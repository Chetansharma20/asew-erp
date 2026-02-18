import React, { useState, useEffect } from 'react'
import * as orderApi from '../../../api/orderApi'
import OrderDetails from './OrderDetails'

const OrdersManager = () => {
    const [orders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })

    useEffect(() => {
        fetchOrders()
    }, [filterStatus, pagination.page])

    const fetchOrders = async () => {
        setIsLoading(true)
        try {
            const params = {
                page: pagination.page,
                limit: 10,
                ...(filterStatus !== 'ALL' && { status: filterStatus })
            }
            const res = await orderApi.getAllOrders(params)

            setOrders(res.data.orders || [])
            setPagination(prev => ({
                ...prev,
                totalPages: res.data.pagination.pages || 1
            }))
        } catch (error) {
            console.error("Error fetching orders:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
                    <p className="text-gray-500 mt-1">Manage and track customer orders</p>
                </div>
                {/* Status Filter */}
                <div className="flex gap-2">
                    {['ALL', 'CREATED', 'PO_PENDING', 'PO_RECEIVED', 'CONFIRMED', 'CANCELLED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {status === 'ALL' ? 'All Orders' : status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Order No</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Sales Person</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                                            Loading orders...
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{order.orderNo}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(order.orderDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{order.customer?.name}</div>
                                            <div className="text-xs text-gray-500">{order.customer?.contactPerson}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {order.salesPerson?.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                            ₹{order.totalAmount.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium 
                                                ${order.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                        order.status === 'PO_RECEIVED' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                            disabled={pagination.page === 1}
                            className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                            disabled={pagination.page === pagination.totalPages}
                            className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            <OrderDetails
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                orderId={selectedOrder?._id}
                onUpdate={() => {
                    fetchOrders()
                    setSelectedOrder(null)
                }}
            />
        </div>
    )
}

export default OrdersManager
