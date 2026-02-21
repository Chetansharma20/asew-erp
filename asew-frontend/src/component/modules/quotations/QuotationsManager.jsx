import React, { useState, useEffect } from 'react'
import * as quotationApi from '../../../api/quotationApi'
import * as leadApi from '../../../api/leadApi'
import * as userApi from '../../../api/userApi'
import * as orderApi from '../../../api/orderApi'
import QuotationModal from './QuotationModal'

const QuotationsManager = () => {
    const [quotations, setQuotations] = useState([])
    const [qualifiedLeads, setQualifiedLeads] = useState([])
    const [salesPersons, setSalesPersons] = useState([])
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [selectedQuotation, setSelectedQuotation] = useState(null)
    const [selectedLead, setSelectedLead] = useState(null)
    const [modalMode, setModalMode] = useState('create')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [bannerCollapsed, setBannerCollapsed] = useState(false)

    // Rejection remark modal state
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [rejectRemark, setRejectRemark] = useState('')
    const [rejectingQuotationId, setRejectingQuotationId] = useState(null)
    const [isRejecting, setIsRejecting] = useState(false)

    useEffect(() => {
        fetchInitialData()

        const handleEditRequest = (e) => {
            const quotationToEdit = e.detail;
            if (quotationToEdit) handleEdit(quotationToEdit);
        };
        window.addEventListener('editQuotation', handleEditRequest);
        return () => window.removeEventListener('editQuotation', handleEditRequest);
    }, [])

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [quotRes, userRes, leadsRes] = await Promise.all([
                quotationApi.getAllQuotations(),
                userApi.getAllUsers({ role: 'STAFF' }),
                leadApi.getAllLeads({ status: 'QUALIFIED' })
            ]);

            const allQuotations = quotRes.data.quotations || [];
            setQuotations(allQuotations);
            setSalesPersons(userRes.data || []);

            // Find qualified leads that do NOT yet have a quotation
            const quotedLeadIds = new Set(
                allQuotations.map(q => q.leadId?._id?.toString() || q.leadId?.toString())
            );
            const unquotedLeads = (leadsRes.data.leads || []).filter(
                l => !quotedLeadIds.has(l._id.toString())
            );
            setQualifiedLeads(unquotedLeads);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

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
        setSelectedLead(null)
        setModalMode('create')
        setIsModalOpen(true)
    }

    const handleCreateForLead = (lead) => {
        setSelectedQuotation(null)
        setSelectedLead(lead)
        setModalMode('create')
        setIsModalOpen(true)
    }

    const handleView = (quotation) => {
        setSelectedQuotation(quotation)
        setSelectedLead(null)
        setModalMode('view')
        setIsModalOpen(true)
    }

    const handleEdit = (quotation) => {
        setSelectedQuotation(quotation)
        setSelectedLead(null)
        setModalMode('edit')
        setIsModalOpen(true)
    }

    const filteredQuotations = filterStatus === 'ALL'
        ? quotations
        : quotations.filter(q => q.status === filterStatus)

    return (
        <div className="space-y-6">
            {/* Header */}
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

            {/* Qualified Leads Banner */}
            {!isLoading && qualifiedLeads.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl overflow-hidden">
                    <button
                        onClick={() => setBannerCollapsed(!bannerCollapsed)}
                        className="w-full flex justify-between items-center px-5 py-3 text-left hover:bg-emerald-100/40 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-500 text-white text-xs font-bold rounded-full">
                                {qualifiedLeads.length}
                            </span>
                            <span className="font-semibold text-emerald-800 text-sm">
                                Qualified Leads — Awaiting Quotation
                            </span>
                            <span className="text-xs text-emerald-600 hidden sm:inline">
                                These leads are ready. Create a quotation to proceed.
                            </span>
                        </div>
                        <svg
                            className={`w-4 h-4 text-emerald-700 transition-transform ${bannerCollapsed ? '-rotate-90' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {!bannerCollapsed && (
                        <div className="border-t border-emerald-200 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-emerald-100/60">
                                    <tr>
                                        <th className="px-5 py-2.5 text-xs font-semibold text-emerald-700 uppercase tracking-wider">Lead No</th>
                                        <th className="px-5 py-2.5 text-xs font-semibold text-emerald-700 uppercase tracking-wider">Customer</th>
                                        <th className="px-5 py-2.5 text-xs font-semibold text-emerald-700 uppercase tracking-wider">Contact</th>
                                        <th className="px-5 py-2.5 text-xs font-semibold text-emerald-700 uppercase tracking-wider">Assigned To</th>
                                        <th className="px-5 py-2.5 text-xs font-semibold text-emerald-700 uppercase tracking-wider">Products</th>
                                        <th className="px-5 py-2.5 text-xs font-semibold text-emerald-700 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-emerald-100">
                                    {qualifiedLeads.map(lead => (
                                        <tr key={lead._id} className="hover:bg-emerald-50/80 transition-colors">
                                            <td className="px-5 py-3">
                                                <span className="font-mono text-xs font-bold text-gray-700 bg-white border border-emerald-200 px-2 py-0.5 rounded">
                                                    {lead.leadNo}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="font-medium text-gray-900">{lead.customer?.name || '-'}</div>
                                                {lead.customer?.contactPerson && (
                                                    <div className="text-xs text-gray-500">{lead.customer.contactPerson}</div>
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="text-sm text-gray-700">{lead.customer?.contact || '-'}</div>
                                                <div className="text-xs text-gray-400">{lead.customer?.email}</div>
                                            </td>
                                            <td className="px-5 py-3 text-sm text-gray-600">
                                                {lead.assignedTo?.name || (
                                                    <span className="text-red-400 italic text-xs">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {(lead.interestedIn || []).slice(0, 3).map((item, idx) => (
                                                        <span key={idx} className="text-xs bg-white border border-emerald-200 text-gray-600 px-2 py-0.5 rounded">
                                                            {item.item?.name} ×{item.quantity}
                                                        </span>
                                                    ))}
                                                    {lead.interestedIn?.length > 3 && (
                                                        <span className="text-xs text-gray-400">+{lead.interestedIn.length - 3} more</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <button
                                                    onClick={() => handleCreateForLead(lead)}
                                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                                                >
                                                    Create Quotation
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex gap-2 flex-wrap">
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quotation No</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead / Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sales Person</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Grand Total</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
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
                                filteredQuotations.map((quotation) => (
                                    <tr key={quotation._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-900">{quotation.quotationNo}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">{quotation.leadId?.customer?.name || 'N/A'}</div>
                                                <div className="text-gray-500 text-xs">{quotation.leadId?.leadNo || 'N/A'}</div>
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
                                            {quotation.status === 'SENT' ? (
                                                <select
                                                    value={quotation.status}
                                                    onChange={async (e) => {
                                                        const newStatus = e.target.value
                                                        if (!newStatus || newStatus === 'SENT') return

                                                        if (newStatus === 'REJECTED') {
                                                            // Open rejection remark modal
                                                            setRejectingQuotationId(quotation._id)
                                                            setRejectRemark('')
                                                            setShowRejectModal(true)
                                                            e.target.value = 'SENT' // Reset dropdown
                                                            return
                                                        }

                                                        // APPROVED flow — keep existing confirm
                                                        if (!window.confirm('Approve this quotation?')) {
                                                            e.target.value = 'SENT'
                                                            return
                                                        }
                                                        try {
                                                            await quotationApi.updateQuotationStatus(quotation._id, newStatus)
                                                            fetchInitialData()
                                                        } catch (err) {
                                                            alert(err?.message || 'Failed to approve quotation')
                                                        }
                                                    }}
                                                    className="text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-blue-300 bg-blue-50 text-blue-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                >
                                                    <option value="SENT">SENT</option>
                                                    <option value="APPROVED">APPROVED</option>
                                                    <option value="REJECTED">REJECTED</option>
                                                </select>
                                            ) : (
                                                <div>
                                                    <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 border flex w-fit items-center gap-1 ${getStatusBadgeColor(quotation.status)}`}>
                                                        {quotation.status}
                                                    </span>
                                                    {quotation.status === 'REJECTED' && quotation.rejectionRemark && (
                                                        <p className="text-xs text-red-600 mt-1 max-w-[200px] truncate" title={quotation.rejectionRemark}>
                                                            Remark: {quotation.rejectionRemark}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(quotation.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <button
                                                    onClick={() => handleView(quotation)}
                                                    className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 rounded-lg transition-colors"
                                                >
                                                    Preview
                                                </button>
                                                {/* Update + Send only for non-terminal statuses */}
                                                {(quotation.status === 'CREATED' || quotation.status === 'DRAFT') && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(quotation)}
                                                            className="px-3 py-1 text-xs font-medium text-green-600 hover:text-white bg-green-50 hover:bg-green-600 border border-green-200 rounded-lg transition-colors"
                                                        >
                                                            Update
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (!window.confirm("Send this quotation to the client?")) return;
                                                                try {
                                                                    await quotationApi.sendQuotationEmail(quotation._id);
                                                                    fetchInitialData();
                                                                    alert('Quotation sent successfully');
                                                                } catch (err) {
                                                                    alert('Failed to send quotation');
                                                                }
                                                            }}
                                                            className="px-3 py-1 text-xs font-medium text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-200 rounded-lg transition-colors"
                                                        >
                                                            Send
                                                        </button>
                                                    </>
                                                )}
                                                {/* SENT: Update + Re-send only (status changed via dropdown) */}
                                                {quotation.status === 'SENT' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(quotation)}
                                                            className="px-3 py-1 text-xs font-medium text-green-600 hover:text-white bg-green-50 hover:bg-green-600 border border-green-200 rounded-lg transition-colors"
                                                        >
                                                            Update
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (!window.confirm("Re-send this quotation to the client?")) return;
                                                                try {
                                                                    await quotationApi.sendQuotationEmail(quotation._id);
                                                                    fetchInitialData();
                                                                    alert('Quotation re-sent successfully');
                                                                } catch (err) {
                                                                    alert('Failed to re-send quotation');
                                                                }
                                                            }}
                                                            className="px-3 py-1 text-xs font-medium text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-200 rounded-lg transition-colors"
                                                        >
                                                            Re-send
                                                        </button>
                                                    </>
                                                )}
                                                {/* APPROVED / REJECTED: no further actions */}
                                            </div>
                                        </td>
                                    </tr>
                                ))
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
                    setSelectedLead(null)
                }}
                initialQuotation={selectedQuotation}
                selectedLead={selectedLead}
                mode={modalMode}
            />

            {/* Rejection Remark Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowRejectModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Reject Quotation</h3>
                                <p className="text-sm text-gray-500">Please provide a reason for rejection</p>
                            </div>
                        </div>

                        <textarea
                            value={rejectRemark}
                            onChange={(e) => setRejectRemark(e.target.value)}
                            placeholder="Enter rejection remark..."
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 resize-none"
                            autoFocus
                        />

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false)
                                    setRejectRemark('')
                                    setRejectingQuotationId(null)
                                }}
                                disabled={isRejecting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    setIsRejecting(true)
                                    try {
                                        await quotationApi.updateQuotationStatus(rejectingQuotationId, 'REJECTED', rejectRemark.trim())
                                        setShowRejectModal(false)
                                        setRejectRemark('')
                                        setRejectingQuotationId(null)
                                        fetchInitialData()
                                    } catch (err) {
                                        alert(err?.message || 'Failed to reject quotation')
                                    } finally {
                                        setIsRejecting(false)
                                    }
                                }}
                                disabled={!rejectRemark.trim() || isRejecting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isRejecting ? 'Rejecting...' : 'Confirm Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default QuotationsManager
