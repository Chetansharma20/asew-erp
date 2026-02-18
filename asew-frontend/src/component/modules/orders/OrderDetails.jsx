import React, { useState, useEffect } from 'react'
import * as orderApi from '../../../api/orderApi'

const OrderDetails = ({ isOpen, onClose, orderId, onUpdate }) => {
    const [order, setOrder] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)

    // PO Form Code
    const [poData, setPoData] = useState({
        poNumber: '',
        poDate: '',
        poAmount: ''
    })
    const [showPoForm, setShowPoForm] = useState(false)

    useEffect(() => {
        if (isOpen && orderId) {
            fetchOrderDetails()
        }
    }, [isOpen, orderId])

    const fetchOrderDetails = async () => {
        setIsLoading(true)
        try {
            const res = await orderApi.getOrderById(orderId)
            setOrder(res.data)
            // Initialize PO data if exists
            if (res.data.poDetails) {
                setPoData({
                    poNumber: res.data.poDetails.poNumber || '',
                    poDate: res.data.poDetails.poDate ? new Date(res.data.poDetails.poDate).toISOString().split('T')[0] : '',
                    poAmount: res.data.poDetails.poAmount || ''
                })
            }
        } catch (error) {
            console.error("Error fetching order details:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleStatusUpdate = async (newStatus) => {
        if (!confirm(`Are you sure you want to update status to ${newStatus}?`)) return

        setIsUpdating(true)
        try {
            await orderApi.updateOrderStatus(orderId, newStatus)
            fetchOrderDetails() // Refresh details
            if (onUpdate) onUpdate() // Refresh list
        } catch (error) {
            console.error("Error updating status:", error)
            alert("Failed to update status")
        } finally {
            setIsUpdating(false)
        }
    }

    const handlePoSubmit = async (e) => {
        e.preventDefault()
        setIsUpdating(true)
        try {
            await orderApi.addPOToOrder(orderId, poData)
            setShowPoForm(false)
            fetchOrderDetails()
            if (onUpdate) onUpdate()
            alert("PO Details added successfully")
        } catch (error) {
            console.error("Error adding PO:", error)
            alert("Failed to add PO details")
        } finally {
            setIsUpdating(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 my-auto max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            Order Details
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">#{order?.orderNo}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : order ? (
                        <div className="space-y-8">
                            {/* Status Bar */}
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div>
                                    <span className="text-sm text-gray-500 block mb-1">Current Status</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                                        ${order.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                order.status === 'PO_RECEIVED' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {/* Actions based on status */}
                                    {order.status === 'CREATED' && (
                                        <button
                                            onClick={() => setShowPoForm(true)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                        >
                                            Upload PO
                                        </button>
                                    )}
                                    {order.status === 'PO_RECEIVED' && (
                                        <button
                                            onClick={() => handleStatusUpdate('CONFIRMED')}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                        >
                                            Confirm Order
                                        </button>
                                    )}
                                    {order.status !== 'CANCELLED' && order.status !== 'CONFIRMED' && (
                                        <button
                                            onClick={() => handleStatusUpdate('CANCELLED')}
                                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* PO Form Modal/Section */}
                            {showPoForm && (
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 animate-fade-in">
                                    <h4 className="font-semibold text-blue-900 mb-4">Add Purchase Order Details</h4>
                                    <form onSubmit={handlePoSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-blue-800 mb-1">PO Number <span className="text-xs text-blue-400">(Auto-generated if blank)</span></label>
                                            <input
                                                type="text"
                                                value={poData.poNumber}
                                                onChange={e => setPoData({ ...poData, poNumber: e.target.value })}
                                                placeholder="PO-YYYY-XXX"
                                                className="w-full px-3 py-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 placeholder-blue-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-blue-800 mb-1">PO Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={poData.poDate}
                                                onChange={e => setPoData({ ...poData, poDate: e.target.value })}
                                                className="w-full px-3 py-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-blue-800 mb-1">PO Amount</label>
                                            <input
                                                type="number"
                                                required
                                                value={poData.poAmount}
                                                onChange={e => setPoData({ ...poData, poAmount: e.target.value })}
                                                className="w-full px-3 py-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="md:col-span-3 flex justify-end gap-2 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowPoForm(false)}
                                                className="px-4 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isUpdating}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                            >
                                                {isUpdating ? 'Saving...' : 'Save PO Details'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Customer & Sales Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer Details</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="font-medium text-gray-900">{order.customer?.name}</p>
                                        <p className="text-gray-600 text-sm">{order.customer?.contactPerson}</p>
                                        <p className="text-gray-600 text-sm mt-2">{order.customer?.email}</p>
                                        <p className="text-gray-600 text-sm">{order.customer?.contact}</p>
                                        <p className="text-gray-600 text-sm mt-1">{order.customer?.address}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Info</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">Order Date</span>
                                            <span className="font-medium text-gray-900">{new Date(order.orderDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">Sales Person</span>
                                            <span className="font-medium text-gray-900">{order.salesPerson?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">Quotation Ref</span>
                                            <span className="font-medium text-gray-900">{order.quotation?.quotationNo}</span>
                                        </div>
                                        {order.poDetails?.poNumber && (
                                            <>
                                                <div className="border-t border-gray-200 my-2 pt-2"></div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 text-sm">PO Number</span>
                                                    <span className="font-medium text-blue-600">{order.poDetails.poNumber}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 text-sm">PO Date</span>
                                                    <span className="font-medium text-gray-900">{new Date(order.poDetails.poDate).toLocaleDateString()}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Items</h4>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-left bg-white">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-center">Qty</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Unit Price</th>
                                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {order.orderItems.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900">{item.itemId?.name}</div>
                                                        <div className="text-xs text-gray-500">{item.itemId?.description}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                                                        {item.quantity} {item.itemId?.unit}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                                                        ₹{item.unitPrice.toLocaleString('en-IN')}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                        ₹{item.total.toLocaleString('en-IN')}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-50">
                                                <td colSpan="3" className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                                                    Total Amount
                                                </td>
                                                <td className="px-6 py-4 text-right text-lg font-bold text-blue-600">
                                                    ₹{order.totalAmount.toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            Failed to load order details
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default OrderDetails
