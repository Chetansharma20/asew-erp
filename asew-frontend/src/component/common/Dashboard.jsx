import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Users,
    FileText,
    ShoppingCart,
    Target,
    Clock,
    TrendingUp,
    CheckCircle2,
    ArrowRight,
    DollarSign,
    Briefcase,
    PieChart,
    BarChart3
} from 'lucide-react'
import * as leadApi from '../../api/leadApi'
import { getUserStats } from '../../api/userApi'
import * as followupApi from '../../api/followupApi'
import * as dashboardApi from '../../api/dashboardApi'

const Dashboard = ({ role }) => {
    const [stats, setStats] = useState({ staffCount: 0, subAdminCount: 0 });
    const [leadStats, setLeadStats] = useState({ totalLeads: 0, byStatus: {}, bySource: {} });
    const [salesStats, setSalesStats] = useState({ totalOrders: 0, totalRevenue: 0, avgOrderValue: 0, ordersByStatus: {}, topSalesPersons: [] });
    const [orderData, setOrderData] = useState({ recentOrders: [], pendingPO: 0 });
    const [upcomingFollowups, setUpcomingFollowups] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({
        leadsCount: 0,
        quotationsCount: 0,
        ordersCount: 0,
        pendingFollowups: 0,
        quotationToOrderRate: 0,
        leadsToOrdersCount: 0,
        leadsToQuotationsCount: 0
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()

    const getRoleBasePath = () => {
        switch (role) {
            case 'Admin (Owner)': return '/admin'
            case 'Super Admin': return '/super-admin'
            case 'Sub Admin': return '/sub-admin'
            case 'Staff': return '/staff'
            default: return '/'
        }
    }

    const handleCardClick = (path) => {
        const basePath = getRoleBasePath()
        navigate(`${basePath}/${path}`)
    }

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const promises = [
                    dashboardApi.getDashboardStats(),
                    dashboardApi.getFollowupReminders()
                ];

                if (role === 'Admin (Owner)' || role === 'Sub Admin' || role === 'Super Admin') {
                    promises.push(dashboardApi.getLeadStatistics());
                    promises.push(dashboardApi.getSalesMetrics());
                    promises.push(dashboardApi.getOrderDashboard());
                    promises.push(getUserStats());
                }

                const results = await Promise.all(promises);

                setDashboardStats(results[0].data || {});
                setUpcomingFollowups(results[1].data?.upcoming || []);

                if (role === 'Admin (Owner)' || role === 'Sub Admin' || role === 'Super Admin') {
                    setLeadStats(results[2].data || {});
                    setSalesStats(results[3].data || {});
                    setOrderData(results[4].data || {});
                    setStats(results[5].data || {});
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [role]);

    const isAdminOrSubAdmin = role === 'Admin (Owner)' || role === 'Sub Admin' || role === 'Super Admin';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Top Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div
                    onClick={() => handleCardClick('leads')}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transform hover:scale-105 transition-transform duration-200 cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-600 transition-colors">
                            <Target className="w-6 h-6 text-blue-600 group-hover:text-white" />
                        </div>
                    </div>
                    <h3 className="font-semibold text-gray-700">{role === 'Staff' ? 'My Leads' : 'Total Leads'}</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{dashboardStats.leadsCount}</p>
                    <p className="text-sm text-gray-400 mt-1">{role === 'Staff' ? 'Assigned' : 'Pipeline Total'}</p>
                </div>

                <div
                    onClick={() => handleCardClick('quotations')}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transform hover:scale-105 transition-transform duration-200 cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-600 transition-colors">
                            <FileText className="w-6 h-6 text-green-600 group-hover:text-white" />
                        </div>
                    </div>
                    <h3 className="font-semibold text-gray-700">{role === 'Staff' ? 'My Quotations' : 'Quotations'}</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">{dashboardStats.quotationsCount}</p>
                    <p className="text-sm text-gray-400 mt-1">{role === 'Staff' ? 'Proposed' : 'Proposals Sent'}</p>
                </div>

                <div
                    onClick={() => handleCardClick('orders')}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transform hover:scale-105 transition-transform duration-200 cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-600 transition-colors">
                            <ShoppingCart className="w-6 h-6 text-purple-600 group-hover:text-white" />
                        </div>
                    </div>
                    <h3 className="font-semibold text-gray-700">{role === 'Staff' ? 'My Orders' : 'Orders'}</h3>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{dashboardStats.ordersCount}</p>
                    <p className="text-sm text-gray-400 mt-1">Confirmed Sales</p>
                </div>

                <div
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transform hover:scale-105 transition-transform duration-200 cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-600 transition-colors">
                            <Clock className="w-6 h-6 text-orange-600 group-hover:text-white" />
                        </div>
                        <div className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded">PENDING</div>
                    </div>
                    <h3 className="font-semibold text-gray-700">Follow-ups</h3>
                    <p className="text-3xl font-bold text-orange-600 mt-2">{dashboardStats.pendingFollowups}</p>
                    <p className="text-sm text-gray-400 mt-1">Awaiting Action</p>
                </div>
            </div>

            {isAdminOrSubAdmin && (
                <>
                    {/* Revenue & Team Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between lg:col-span-2">
                            <div className="space-y-4">
                                <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" /> Total Revenue
                                </h3>
                                <p className="text-4xl font-black text-gray-800">
                                    ₹{salesStats.totalRevenue?.toLocaleString('en-IN')}
                                </p>
                                <div className="flex gap-4">
                                    <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
                                        AVG ORDER: ₹{Math.round(salesStats.avgOrderValue || 0).toLocaleString('en-IN')}
                                    </div>
                                    <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                                        TOTAL ORDERS: {salesStats.totalOrders}
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <div className="p-6 bg-indigo-50 rounded-full">
                                    <TrendingUp className="w-12 h-12 text-indigo-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-orange-50 p-4 rounded-2xl">
                                    <Users className="w-8 h-8 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-800">{(stats.staffCount || 0) + (stats.subAdminCount || 0)}</h3>
                                    <p className="text-gray-400 font-medium">Active Team Members</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Sub Admins</p>
                                    <p className="text-xl font-bold text-gray-700">{stats.subAdminCount || 0}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Staff Force</p>
                                    <p className="text-xl font-bold text-gray-700">{stats.staffCount || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Analytics Row: Funnel & Lead Sources */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <TrendingUp className="text-blue-600" /> Sales Pipeline Funnel
                                </h3>
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Efficiency</span>
                            </div>

                            <div className="space-y-8">
                                <div className="relative">
                                    <div className="flex justify-between text-sm font-bold mb-2">
                                        <span className="text-gray-600 uppercase tracking-tighter">Leads to Quotations</span>
                                        <span className="text-blue-600">{dashboardStats.leadsToQuotationsCount} / {dashboardStats.leadsCount}</span>
                                    </div>
                                    <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${dashboardStats.leadsCount > 0 ? (dashboardStats.leadsToQuotationsCount / dashboardStats.leadsCount) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="flex justify-between text-sm font-bold mb-2">
                                        <span className="text-gray-600 uppercase tracking-tighter">Quotations to Orders</span>
                                        <span className="text-purple-600">{dashboardStats.leadsToOrdersCount} / {dashboardStats.quotationsCount}</span>
                                    </div>
                                    <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-1000 ease-out shadow-sm"
                                            style={{ width: `${dashboardStats.quotationsCount > 0 ? (dashboardStats.leadsToOrdersCount / dashboardStats.quotationsCount) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-6 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-lg">
                                        <CheckCircle2 className="text-green-600 w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Conversion Rate</p>
                                        <p className="text-2xl font-black text-gray-800">{dashboardStats.quotationToOrderRate}%</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleCardClick('leads')}
                                    className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
                                >
                                    Full Pipeline <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <BarChart3 className="text-orange-600" /> Lead Source Distribution
                                </h3>
                                <PieChart className="w-5 h-5 text-gray-300" />
                            </div>

                            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2">
                                {Object.entries(leadStats.bySource || {}).length > 0 ? (
                                    Object.entries(leadStats.bySource).sort((a, b) => b[1] - a[1]).map(([source, count], index) => (
                                        <div key={source} className="flex items-center gap-4">
                                            <span className="text-sm font-bold text-gray-600 min-w-[100px] truncate">{source}</span>
                                            <div className="flex-1 h-2 bg-gray-50 rounded-full overflow-hidden flex">
                                                <div
                                                    className={`h-full opacity-80 ${index % 3 === 0 ? 'bg-orange-500' : index % 3 === 1 ? 'bg-blue-500' : 'bg-green-500'}`}
                                                    style={{ width: `${(count / leadStats.totalLeads) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-black text-gray-800">{count}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-10 text-gray-400 italic font-medium">No lead source data available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Main Data Split: Tables & Lists */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Recent Orders (Admin Only) */}
                {isAdminOrSubAdmin && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                <Briefcase className="text-purple-600" /> Recent Business Orders
                            </h3>
                            <span className="px-2 py-1 bg-purple-50 text-purple-600 text-[10px] font-black uppercase rounded">LATEST 10</span>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order #</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Value</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orderData.recentOrders?.length > 0 ? (
                                        orderData.recentOrders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => handleCardClick('orders')}>
                                                <td className="px-6 py-4 text-xs font-black text-blue-600">{order.orderNo}</td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-gray-800 truncate max-w-[150px]">{order.customer?.name}</p>
                                                    <p className="text-[10px] text-gray-400 lowercase">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}</p>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-black text-gray-900 text-right">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${order.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium italic">No recent orders.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Follow-ups (All Roles) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                            Pipeline Reminders
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded">CRITICAL</span>
                            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded">NEXT 7 DAYS</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lead</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Action Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Task</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Owner</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {upcomingFollowups.length > 0 ? (
                                    upcomingFollowups.map((followup) => (
                                        <tr key={followup._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-gray-900 uppercase tracking-tighter">{followup.lead?.customer?.name || 'Unknown'}</p>
                                                <p className="text-[10px] text-gray-400">{followup.lead?.customer?.contactPerson || '-'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md font-black text-[10px] shadow-sm italic">
                                                    {new Date(followup.nextFollowupDate).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-[150px] truncate italic" title={followup.remarks}>
                                                "{followup.remarks}"
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-indigo-600 text-white rounded-md flex items-center justify-center text-[10px] font-black uppercase">
                                                        {(followup.lead?.assignedTo?.name || 'U').substring(0, 1)}
                                                    </div>
                                                    <span className="text-xs text-gray-700 font-bold">{followup.lead?.assignedTo?.name || '-'}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 bg-gray-50 rounded-full">
                                                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                                                </div>
                                                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Pipeline is all caught up!</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Top Sales Performers (Admin Only) */}
            {isAdminOrSubAdmin && salesStats.topSalesPersons?.length > 0 && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mt-6">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            Market Leaders (Top Performers)
                        </h3>
                        <span className="text-xs text-green-600 font-black flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full uppercase">
                            High Growth <TrendingUp className="w-3 h-3" />
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {salesStats.topSalesPersons.map((person, index) => (
                            <div key={person.email} className="relative p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-md transition-all">
                                <span className="absolute top-2 left-2 text-[40px] font-black text-gray-100 group-hover:text-blue-50/50 leading-none">#{index + 1}</span>
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black mb-4 shadow-lg transform group-hover:rotate-12 transition-transform">
                                    {person.name.substring(0, 1)}
                                </div>
                                <h4 className="font-black text-gray-800 uppercase tracking-tighter mb-1">{person.name}</h4>
                                <p className="text-[10px] text-gray-400 mb-4">{person.email}</p>
                                <div className="mt-auto w-full pt-4 border-t border-gray-200/50">
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Revenue</p>
                                    <p className="text-lg font-black text-blue-600">₹{Math.round(person.totalRevenue / 1000)}K</p>
                                    <p className="text-[10px] font-black text-gray-500 uppercase">{person.totalOrders} Orders</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard
