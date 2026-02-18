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

        // Listen for edit requests from the modal
        const handleEditRequest = (e) => {
            const quotationToEdit = e.detail;
            if (quotationToEdit) {
                handleEdit(quotationToEdit);
            }
        };

        window.addEventListener('editQuotation', handleEditRequest);

        return () => {
            window.removeEventListener('editQuotation', handleEditRequest);
        };
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
                                                <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 border flex w-fit items-center gap-1 ${getStatusBadgeColor(quotation.status)}`}>
                                                    {quotation.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(quotation.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    {/* Preview Action */}
                                                    <button
                                                        onClick={() => handleView(quotation)}
                                                        className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 rounded-lg transition-colors"
                                                    >
                                                        Preview
                                                    </button>

                                                    {/* Update Action */}
                                                    {(quotation.status === 'CREATED' || quotation.status === 'DRAFT' || quotation.status === 'SENT') && (
                                                        <button
                                                            onClick={() => handleEdit(quotation)}
                                                            className="px-3 py-1 text-xs font-medium text-green-600 hover:text-white bg-green-50 hover:bg-green-600 border border-green-200 rounded-lg transition-colors"
                                                        >
                                                            Update
                                                        </button>
                                                    )}

                                                    {/* Send Action */}
                                                    {(quotation.status === 'CREATED' || quotation.status === 'DRAFT') && (
                                                        <button
                                                            onClick={async () => {
                                                                if (!window.confirm("Are you sure you want to send this quotation to client?")) return;
                                                                try {
                                                                    await quotationApi.sendQuotationEmail(quotation._id);
                                                                    fetchInitialData();
                                                                    alert('Quotation sent to client successfully');
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    alert('Failed to send quotation');
                                                                }
                                                            }}
                                                            className="px-3 py-1 text-xs font-medium text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-200 rounded-lg transition-colors"
                                                        >
                                                            Send
                                                        </button>
                                                    )}
                                                </div>
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
