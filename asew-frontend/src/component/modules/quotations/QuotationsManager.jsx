import React, { useState, useEffect } from 'react'
import * as quotationApi from '../../../api/quotationApi'
import * as userApi from '../../../api/userApi'
import * as orderApi from '../../../api/orderApi'
import QuotationModal from './QuotationModal'

const QuotationsManager = () => {
    const [quotations, setQuotations] = useState([])
    const [salesPersons, setSalesPersons] = useState([])
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [selectedQuotation, setSelectedQuotation] = useState(null)
    const [modalMode, setModalMode] = useState('create') // 'create', 'edit', 'view'
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [quotRes, userRes] = await Promise.all([
                quotationApi.getAllQuotations(),
                userApi.getAllUsers({ role: 'STAFF' })
            ]);
            setQuotations(quotRes.data.quotations || []);
            setSalesPersons(userRes.data || []);
        } catch (error) {
            console.error("Error fetching quotations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getSalesPersonName = (salesPersonId) => {
        const person = salesPersons.find(sp => sp._id === salesPersonId)
        return person ? person.name : 'N/A'
    }

    const getStatusBadgeColor = (status) => {
        const colors = {
            CREATED: 'bg-gray-100 text-gray-800',
            SENT: 'bg-blue-100 text-blue-800',
            APPROVED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800',
            CONVERTED: 'bg-purple-100 text-purple-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const handleCreate = () => {
        setSelectedQuotation(null)
        setModalMode('create')
        setIsModalOpen(true)
    }

    const handleView = (quotation) => {
        setSelectedQuotation(quotation)
        setModalMode('view')
        setIsModalOpen(true)
    }

    const handleEdit = (quotation) => {
        setSelectedQuotation(quotation)
        setModalMode('edit')
        setIsModalOpen(true)
    }

    const handleStatusChange = async (quotationId, newStatus) => {
        if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

        try {
            await quotationApi.updateQuotationStatus(quotationId, newStatus);
            fetchInitialData(); // Refresh list
        } catch (error) {
            console.error("Error updating status:", error);
            alert(error.message || "Failed to update status");
        }
    }

    const handleConvertToOrder = async (quotationId) => {
        if (!window.confirm("Are you sure you want to convert this quotation to an order?")) return;

        try {
            await orderApi.convertQuotationToOrder(quotationId);
            alert("Quotation converted to order successfully!");
            fetchInitialData(); // Refresh list to update status if needed
        } catch (error) {
            console.error("Error converting to order:", error);
            alert(error.message || "Failed to convert to order");
        }
    }

    const filteredQuotations = filterStatus === 'ALL'
        ? quotations
        : quotations.filter(q => q.status === filterStatus)

    return (
        <div className="space-y-6">
            {/* Header and filters remain similar */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Quotations</h2>
                    <p className="text-gray-500 mt-1">Manage and track all quotations</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    + Generate Quotation
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex gap-2">
                    {['ALL', 'CREATED', 'SENT', 'APPROVED', 'REJECTED', 'CONVERTED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quotations Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Quotation No
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Lead / Customer
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Sales Person
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Grand Total
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        Loading quotations...
                                    </td>
                                </tr>
                            ) : filteredQuotations.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No quotations found
                                    </td>
                                </tr>
                            ) : (
                                filteredQuotations.map((quotation) => {
                                    return (
                                        <tr key={quotation._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {quotation.quotationNo}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {quotation.leadId?.customer?.name || 'N/A'}
                                                    </div>
                                                    <div className="text-gray-500 text-xs">
                                                        {quotation.leadId?.leadNo || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {quotation.salesPersonId?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    ₹{(quotation.totalAmount || 0).toLocaleString('en-IN')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={quotation.status}
                                                    onChange={(e) => handleStatusChange(quotation._id, e.target.value)}
                                                    className={`text-xs font-medium rounded-full px-2.5 py-0.5 border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${getStatusBadgeColor(quotation.status)}`}
                                                    onClick={(e) => e.stopPropagation()} // Prevent row click if any
                                                    disabled={quotation.status === 'CONVERTED'}
                                                >
                                                    <option value="CREATED">CREATED</option>
                                                    <option value="SENT">SENT</option>
                                                    <option value="APPROVED">APPROVED</option>
                                                    <option value="REJECTED">REJECTED</option>
                                                    <option value="CONVERTED">CONVERTED</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(quotation.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleView(quotation)}
                                                    className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
                                                    title="View"
                                                >
                                                    View
                                                </button>
                                                {quotation.status === 'CREATED' && (
                                                    <button
                                                        onClick={() => handleEdit(quotation)}
                                                        className="text-gray-600 hover:text-gray-700 transition-colors text-sm font-medium"
                                                        title="Edit"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                {quotation.status === 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleConvertToOrder(quotation._id)}
                                                        className="text-green-600 hover:text-green-700 transition-colors text-sm font-medium"
                                                        title="Convert to Order"
                                                    >
                                                        Convert to Order
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quotation Modal */}
            <QuotationModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    fetchInitialData()
                    setSelectedQuotation(null)
                }}
                initialQuotation={selectedQuotation}
                mode={modalMode}
            />
        </div>
    )
}

export default QuotationsManager
