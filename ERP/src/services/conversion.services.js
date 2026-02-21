// services/conversion.services.js

import mongoose from "mongoose";
import { Quotation } from "../models/quotation.models.js";
import { Lead } from "../models/leads.models.js";
import { Order } from "../models/order.model.js";
import { generateOrderNumber } from "../utils/autoNumber.helper.js";
import { ApiError } from "../utils/ApiError.js";

export const convertQuotationToOrder = async (quotationId, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Fetch quotation with full details
        const quotation = await Quotation.findById(quotationId)
            .populate({
                path: "leadId",
                populate: { path: "customer", model: "Party" }
            })
            .session(session);

        if (!quotation) throw new ApiError(404, "Quotation not found");

        if (quotation.status !== "APPROVED") {
            throw new ApiError(400, `Quotation must be APPROVED to convert. Current: ${quotation.status}`);
        }

        // 2. Check if order already exists for this quotation (idempotency)
        const existingOrder = await Order.findOne({ quotation: quotationId }).session(session);
        if (existingOrder) {
            await session.abortTransaction();
            return existingOrder;
        }

        const party = quotation.leadId.customer;

        // 3. Generate order number
        const orderNo = await generateOrderNumber();

        // 4. Create order — snapshot everything from quotation
        const order = await Order.create(
            [{
                orderNo,
                lead: quotation.leadId._id,
                quotation: quotation._id,
                salesPerson: quotation.salesPersonId,

                // Snapshot customer at time of order
                customer: {
                    name: party.name,
                    contact: party.contact,
                    email: party.email,
                    contactPerson: party.contactPerson,
                    address: party.address
                },

                // Copy items
                orderItems: quotation.quotationItems.map(item => ({
                    itemId: item.itemId,
                    quantity: item.quantity,
                    unitPrice: item.UnitPrice,
                    total: item.Total
                })),

                totalAmount: quotation.totalAmount,
                status: "CREATED"
            }],
            { session }
        );

        // 5. Update quotation status → CONVERTED
        await Quotation.findByIdAndUpdate(
            quotationId,
            { status: "CONVERTED" },
            { session }
        );

        // 6. Update lead status → CONVERTED_TO_ORDER
        await Lead.findByIdAndUpdate(
            quotation.leadId._id,
            { status: "CONVERTED_TO_ORDER" },
            { session }
        );

        await session.commitTransaction();
        return order[0];

    } catch (error) {
        await session.abortTransaction();
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, `Conversion failed: ${error.message}`);
    } finally {
        session.endSession();
    }
};
