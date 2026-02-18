import { Lead } from "../models/leads.models.js";
import { Order } from "../models/order.model.js";
import { Followup } from "../models/followsUp.models.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

/**
 * Get lead statistics
 * @param {Object} dateRange - Date range filter
 * @returns {Promise<Object>} - Lead statistics
 */
export const getLeadStatistics = async (dateRange = {}) => {
    try {
        const { dateFrom, dateTo } = dateRange;

        let matchStage = { isActive: true };

        if (dateFrom || dateTo) {
            matchStage.leadDate = {};
            if (dateFrom) matchStage.leadDate.$gte = new Date(dateFrom);
            if (dateTo) matchStage.leadDate.$lte = new Date(dateTo);
        }

        const result = await Lead.aggregate([
            { $match: matchStage },
            {
                $facet: {
                    totalLeads: [
                        { $count: "count" }
                    ],
                    byStatus: [
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    bySource: [
                        {
                            $group: {
                                _id: "$source",
                                count: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        const data = result[0];

        return {
            totalLeads: data.totalLeads[0]?.count || 0,
            byStatus: data.byStatus.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            bySource: data.bySource.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        };

    } catch (error) {
        throw new ApiError(500, `Error fetching lead statistics: ${error.message}`);
    }
};

/**
 * Get sales metrics
 * @param {Object} dateRange - Date range filter
 * @param {string} salesPersonId - Sales person ID (optional)
 * @returns {Promise<Object>} - Sales metrics
 */
export const getSalesMetrics = async (dateRange = {}, salesPersonId = null) => {
    try {
        const { dateFrom, dateTo } = dateRange;

        let matchStage = {};

        if (dateFrom || dateTo) {
            matchStage.orderDate = {};
            if (dateFrom) matchStage.orderDate.$gte = new Date(dateFrom);
            if (dateTo) matchStage.orderDate.$lte = new Date(dateTo);
        }

        if (salesPersonId) {
            matchStage.salesPerson = new mongoose.Types.ObjectId(salesPersonId);
        }

        const result = await Order.aggregate([
            { $match: matchStage },
            {
                $facet: {
                    orderStats: [
                        {
                            $group: {
                                _id: null,
                                totalOrders: { $sum: 1 },
                                totalRevenue: { $sum: "$totalAmount" },
                                avgOrderValue: { $avg: "$totalAmount" }
                            }
                        }
                    ],
                    ordersByStatus: [
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 },
                                totalAmount: { $sum: "$totalAmount" }
                            }
                        }
                    ],
                    topSalesPersons: salesPersonId ? [] : [
                        {
                            $group: {
                                _id: "$salesPerson",
                                totalOrders: { $sum: 1 },
                                totalRevenue: { $sum: "$totalAmount" }
                            }
                        },
                        { $sort: { totalRevenue: -1 } },
                        { $limit: 5 },
                        {
                            $lookup: {
                                from: "users",
                                localField: "_id",
                                foreignField: "_id",
                                as: "salesPerson"
                            }
                        },
                        { $unwind: "$salesPerson" },
                        {
                            $project: {
                                name: "$salesPerson.name",
                                email: "$salesPerson.email",
                                totalOrders: 1,
                                totalRevenue: 1
                            }
                        }
                    ]
                }
            }
        ]);

        const data = result[0];
        const stats = data.orderStats[0] || {
            totalOrders: 0,
            totalRevenue: 0,
            avgOrderValue: 0
        };

        return {
            totalOrders: stats.totalOrders,
            totalRevenue: stats.totalRevenue,
            avgOrderValue: stats.avgOrderValue,
            ordersByStatus: data.ordersByStatus.reduce((acc, item) => {
                acc[item._id] = {
                    count: item.count,
                    totalAmount: item.totalAmount
                };
                return acc;
            }, {}),
            topSalesPersons: data.topSalesPersons || []
        };

    } catch (error) {
        throw new ApiError(500, `Error fetching sales metrics: ${error.message}`);
    }
};

/**
 * Get order dashboard
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} - Order pipeline view
 */
export const getOrderDashboard = async (filters = {}) => {
    try {
        const { salesPersonId } = filters;

        let matchFilter = {};
        if (salesPersonId) {
            matchFilter.salesPerson = new mongoose.Types.ObjectId(salesPersonId);
        }

        // Orders by status with details
        const pipeline = await Order.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Recent orders
        const recentOrders = await Order.find(matchFilter)
            .populate('salesPerson', 'name email')
            .sort({ createdAt: -1 })
            .limit(10)
            .select('orderNo customer.name customer.contactPerson totalAmount status orderDate');

        // Pending PO orders
        const pendingPO = await Order.countDocuments({
            ...matchFilter,
            status: { $in: ["CREATED", "PO_PENDING"] }
        });

        return {
            pipeline: pipeline.reduce((acc, item) => {
                acc[item._id] = {
                    count: item.count,
                    totalAmount: item.totalAmount
                };
                return acc;
            }, {}),
            recentOrders,
            pendingPO
        };

    } catch (error) {
        throw new ApiError(500, `Error fetching order dashboard: ${error.message}`);
    }
};

/**
 * Get follow-up reminders
 * @param {string} salesPersonId - Sales person ID (optional)
 * @returns {Promise<Object>} - Follow-up reminders
 */
export const getFollowupReminders = async (salesPersonId = null) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        let matchUpcoming = {
            nextFollowupDate: {
                $gte: today,
                $lte: nextWeek
            }
        };

        let matchOverdue = {
            nextFollowupDate: { $lt: today }
        };

        const pipeline = [
            {
                $lookup: {
                    from: "leads",
                    localField: "lead",
                    foreignField: "_id",
                    as: "lead"
                }
            },
            { $unwind: "$lead" },
            {
                $lookup: {
                    from: "users",
                    localField: "lead.assignedTo",
                    foreignField: "_id",
                    as: "lead.assignedTo"
                }
            },
            {
                $unwind: {
                    path: "$lead.assignedTo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    "lead.assignedTo.password": 0,
                    "lead.assignedTo.refreshToken": 0
                }
            }
        ];

        if (salesPersonId) {
            const sid = new mongoose.Types.ObjectId(salesPersonId);
            matchUpcoming["lead.assignedTo"] = sid;
            matchOverdue["lead.assignedTo"] = sid;
        }

        const [upcoming, overdue] = await Promise.all([
            Followup.aggregate([
                { $match: matchUpcoming },
                ...pipeline,
                { $sort: { nextFollowupDate: 1 } }
            ]),
            Followup.aggregate([
                { $match: matchOverdue },
                ...pipeline,
                { $sort: { nextFollowupDate: 1 } }
            ])
        ]);

        return {
            upcoming,
            overdue,
            totalUpcoming: upcoming.length,
            totalOverdue: overdue.length
        };

    } catch (error) {
        throw new ApiError(500, `Error fetching follow-up reminders: ${error.message}`);
    }
};

/**
 * Get dashboard statistics (leads, quotations, orders counts)
 * @param {string} userId - User ID
 * @param {string} userRole - User role (STAFF, ADMIN, SUB_ADMIN)
 * @returns {Promise<Object>} - Dashboard statistics
 */
export const getDashboardStats = async (userId, userRole) => {
    try {
        const { Quotation } = await import("../models/quotation.models.js");

        let leadsCount = 0;
        let quotationsCount = 0;
        let ordersCount = 0;
        let pendingFollowups = 0;
        let convertedQuotationsCount = 0;
        let leadsWithQuotations = 0;
        let leadsWithOrders = 0;

        if (userRole === "STAFF") {
            const sid = new mongoose.Types.ObjectId(userId);

            // Optimized counts for Staff
            const result = await Lead.aggregate([
                { $match: { assignedTo: sid, isActive: true } },
                {
                    $facet: {
                        leadsCount: [{ $count: "count" }],
                        followups: [
                            { $match: { status: "FOLLOW_UP" } },
                            { $count: "count" }
                        ],
                        leadsWithOrders: [
                            {
                                $lookup: {
                                    from: "orders",
                                    localField: "_id",
                                    foreignField: "lead",
                                    as: "orders"
                                }
                            },
                            { $match: { "orders.salesPerson": sid } },
                            { $unwind: "$orders" },
                            { $group: { _id: "$_id" } },
                            { $count: "count" }
                        ]
                    }
                }
            ]);

            const data = result[0];
            leadsCount = data.leadsCount[0]?.count || 0;
            pendingFollowups = data.followups[0]?.count || 0;
            leadsWithOrders = data.leadsWithOrders[0]?.count || 0;

            // Quotation stats
            const qResult = await Quotation.aggregate([
                { $match: { salesPersonId: sid } },
                {
                    $facet: {
                        total: [{ $count: "count" }],
                        converted: [{ $match: { status: "CONVERTED" } }, { $count: "count" }],
                        distinctLeads: [{ $group: { _id: "$leadId" } }, { $count: "count" }]
                    }
                }
            ]);

            const qData = qResult[0];
            quotationsCount = qData.total[0]?.count || 0;
            convertedQuotationsCount = qData.converted[0]?.count || 0;
            leadsWithQuotations = qData.distinctLeads[0]?.count || 0;

            ordersCount = await Order.countDocuments({ salesPerson: sid });

        } else if (userRole === "ADMIN" || userRole === "SUB_ADMIN" || userRole === "SUPER_ADMIN") {
            // Optimized counts for Admin
            const result = await Promise.all([
                Lead.countDocuments({ isActive: true }),
                Quotation.aggregate([
                    {
                        $facet: {
                            total: [{ $count: "count" }],
                            converted: [{ $match: { status: "CONVERTED" } }, { $count: "count" }],
                            distinctLeads: [{ $group: { _id: "$leadId" } }, { $count: "count" }]
                        }
                    }
                ]),
                Order.aggregate([
                    {
                        $facet: {
                            total: [{ $count: "count" }],
                            distinctLeads: [{ $group: { _id: "$lead" } }, { $count: "count" }]
                        }
                    }
                ]),
                Lead.countDocuments({ isActive: true, status: "FOLLOW_UP" })
            ]);

            leadsCount = result[0];
            const qData = result[1][0];
            quotationsCount = qData.total[0]?.count || 0;
            convertedQuotationsCount = qData.converted[0]?.count || 0;
            leadsWithQuotations = qData.distinctLeads[0]?.count || 0;

            const oData = result[2][0];
            ordersCount = oData.total[0]?.count || 0;
            leadsWithOrders = oData.distinctLeads[0]?.count || 0;

            pendingFollowups = result[3];
        }

        const quotationToOrderRate = quotationsCount > 0
            ? ((convertedQuotationsCount / quotationsCount) * 100).toFixed(2)
            : 0;

        return {
            leadsCount,
            quotationsCount,
            ordersCount,
            pendingFollowups,
            quotationToOrderRate: Number(quotationToOrderRate),
            leadsToOrdersCount: leadsWithOrders,
            leadsToQuotationsCount: leadsWithQuotations
        };

    } catch (error) {
        throw new ApiError(500, `Error fetching dashboard stats: ${error.message}`);
    }
};
