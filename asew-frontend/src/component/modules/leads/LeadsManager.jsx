import React, { useState, useEffect } from 'react'
import * as leadApi from '../../../api/leadApi'
import * as itemApi from '../../../api/itemApi'
import * as userApi from '../../../api/userApi'
import FollowupHistory from './FollowupHistory'

const LeadsManager = () => {
    const [leads, setLeads] = useState([])
    const [availableProducts, setAvailableProducts] = useState([])
    const [salesPersons, setSalesPersons] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentLead, setCurrentLead] = useState(null)
    const [isViewOnly, setIsViewOnly] = useState(false)
    const [userRole, setUserRole] = useState('')
    const [isFollowupOpen, setIsFollowupOpen] = useState(false)
    const [followupLeadId, setFollowupLeadId] = useState(null)

    const [formData, setFormData] = useState({
        customerId: '',
        customerData: {
            name: '',
            contact: '',
            email: '',
            contactPerson: '',
            address: ''
        },
        interestedIn: [],
        source: 'OTHER',
        status: 'NEW',
        assignedTo: '',
        remarks: ''
    })

    const statusColors = {
        'NEW': 'bg-blue-100 text-blue-800',
        'REJECTED': 'bg-red-100 text-red-800',
        'ASSIGNED': 'bg-purple-100 text-purple-800',
        'CONTACTED': 'bg-indigo-100 text-indigo-800',
        'QUALIFIED': 'bg-emerald-100 text-emerald-800',
        'QUOTATION_SENT': 'bg-cyan-100 text-cyan-800',
        'CONVERTED_TO_ORDER': 'bg-emerald-100 text-emerald-800',
        'LOST': 'bg-stone-100 text-stone-800'
    }

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            const user = JSON.parse(storedUser)
            setUserRole(user.role)
        }
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        setIsLoading(true)
        try {
            const [leadsRes, itemsRes, usersRes] = await Promise.all([
                leadApi.getAllLeads(),
                itemApi.getAllItems(),
                userApi.getAllUsers({ role: 'STAFF' })
            ])
            setLeads(leadsRes.data.leads || [])
            setAvailableProducts(itemsRes.data.items || [])
            setSalesPersons(usersRes.data || [])
        } catch (error) {
            console.error("Error fetching leads data:", error)
            alert("Failed to load data. Please check console for details.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenModal = (lead = null, viewMode = false) => {
        setIsViewOnly(viewMode)
        if (lead) {
            setCurrentLead(lead)
            setFormData({
                ...lead,
                customerId: lead.customer?._id || '',
                customerData: {
                    name: lead.customer?.name || '',
                    contact: lead.customer?.contact || '',
                    email: lead.customer?.email || '',
                    contactPerson: lead.customer?.contactPerson || '',
                    address: lead.customer?.address || ''
                },
                interestedIn: (lead.interestedIn || []).map(i => ({
                    item: i.item?._id || i.item,
                    quantity: i.quantity
                })),
                source: lead.source || 'OTHER',
                status: lead.status || 'NEW',
                assignedTo: lead.assignedTo?._id || lead.assignedTo || '',
                remarks: lead.remarks || ''
            })
        } else {
            setCurrentLead(null)
            setFormData({
                customerId: '',
                customerData: {
                    name: '',
                    contact: '',
                    email: '',
                    companyName: '',
                    address: ''
                },
                interestedIn: [],
                source: 'OTHER',
                status: 'NEW',
                assignedTo: '',
                remarks: ''
            })
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setCurrentLead(null)
        setIsViewOnly(false)
    }

    const handleOpenFollowup = (leadId) => {
        setFollowupLeadId(leadId)
        setIsFollowupOpen(true)
    }

    const handleCloseFollowup = () => {
        setIsFollowupOpen(false)
        setFollowupLeadId(null)
        fetchInitialData() // Refresh to show updated status if changed
    }

    const handleCustomerChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            customerData: {
                ...formData.customerData,
                [name]: value
            }
        })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target

        let newFormData = { ...formData, [name]: value }

        // Auto-update status when assigning during creation or edit
        if (name === 'assignedTo') {
            if (value) {
                newFormData.status = 'ASSIGNED'
            } else {
                newFormData.status = 'NEW'
            }
        }

        setFormData(newFormData)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (currentLead) {
                // Update - using selective fields
                const updateData = {
                    source: formData.source,
                    interestedIn: formData.interestedIn,
                    remarks: formData.remarks,
                    status: formData.status,
                    assignedTo: formData.assignedTo,
                    customerData: formData.customerData
                }
                await leadApi.updateLead(currentLead._id, updateData)
            } else {
                // Add - strip empty assignedTo to avoid Mongoose ObjectId CastError
                // Also strip empty email to avoid Party model regex validation failure
                const createData = { ...formData };
                if (!createData.assignedTo) delete createData.assignedTo;
                if (createData.customerData && !createData.customerData.email) {
                    const { email, ...rest } = createData.customerData;
                    createData.customerData = rest;
                }
                await leadApi.createLead(createData)
            }
            fetchInitialData() // Refresh list
            handleCloseModal()
        } catch (error) {
            console.error("Error saving lead:", error)
            alert(error.message || "Failed to save lead")
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            try {
                await leadApi.deleteLead(id)
                fetchInitialData()
            } catch (error) {
                alert("Failed to delete lead")
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Headers and Add Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Leads Management</h2>
                {userRole !== 'STAFF' && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <span>+</span> Add Lead
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>

                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Interested In</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">View</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Follow up</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        Loading leads...
                                    </td>
                                </tr>
                            ) : leads.length > 0 ? (
                                leads.map((lead) => (
                                    <tr key={lead._id} className="hover:bg-gray-50/50 transition-colors">

                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{lead.customer?.name}</div>
                                            {lead.customer?.contactPerson && (
                                                <div className="text-xs text-gray-500">{lead.customer.contactPerson}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700">{lead.customer?.contact}</div>
                                            <div className="text-xs text-gray-500">{lead.customer?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {lead.interestedIn?.length > 0 ? (
                                                <div className="space-y-1">
                                                    {lead.interestedIn.map((item, idx) => (
                                                        <div key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded inline-block mr-1">
                                                            {item.item?.name} x {item.quantity}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {lead.assignedTo?.name || lead.assignedTo || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <button
                                                onClick={() => handleOpenModal(lead, true)}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                                title="Preview Details"
                                            >
                                                Preview
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {(lead.status === 'QUOTATION_SENT' || lead.hasApprovedQuotation) ? (
                                                <button
                                                    onClick={() => handleOpenFollowup(lead._id)}
                                                    className="text-yellow-600 hover:text-yellow-800 font-medium"
                                                    title="Follow Up History"
                                                >
                                                    History
                                                </button>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                                            <button
                                                onClick={() => handleOpenModal(lead, ['LOST', 'REJECTED', 'CONVERTED_TO_ORDER', 'WON'].includes(lead.status))}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                title={['LOST', 'REJECTED', 'CONVERTED_TO_ORDER', 'WON'].includes(lead.status) ? "View Details" : "Update"}
                                            >
                                                {['LOST', 'REJECTED', 'CONVERTED_TO_ORDER', 'WON'].includes(lead.status) ? "View" : "Update"}
                                            </button>
                                            {userRole !== 'STAFF' && (
                                                <button
                                                    onClick={() => handleDelete(lead._id)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                    title="Delete"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No leads found. Add one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl p-5 animate-in fade-in zoom-in duration-200 max-h-[95vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4 border-b pb-3">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {isViewOnly ? 'Lead Details' : (currentLead ? 'Edit Lead' : 'Add New Lead')}
                                </h3>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {isViewOnly ? (
                                <div className="space-y-6 py-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer Name</p>
                                            <p className="text-sm font-semibold text-gray-900">{formData.customerData.name || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                                            <p className="text-sm font-semibold text-gray-900">{formData.customerData.contact || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                            <p className="text-sm font-semibold text-gray-900 break-all">{formData.customerData.email || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Person</p>
                                            <p className="text-sm font-semibold text-gray-900">{formData.customerData.contactPerson || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-gray-100">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-tighter ${formData.status === 'QUALIFIED' ? 'bg-green-100 text-green-700' :
                                                formData.status === 'CONTACTED' ? 'bg-blue-100 text-blue-700' :
                                                    formData.status === 'LOST' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {formData.status}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned To</p>
                                            <p className="text-sm font-semibold text-gray-900">{salesPersons.find(sp => sp._id === formData.assignedTo)?.name || 'Unassigned'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interested In Products</p>
                                        <div className="bg-gray-50/50 rounded-xl border border-gray-100 overflow-hidden">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-gray-50 border-b border-gray-100">
                                                    <tr>
                                                        <th className="px-4 py-2.5 font-bold text-gray-500 uppercase tracking-tighter">Product</th>
                                                        <th className="px-4 py-2.5 font-bold text-gray-500 uppercase tracking-tighter text-center">Qty</th>
                                                        <th className="px-4 py-2.5 font-bold text-gray-500 uppercase tracking-tighter text-right">Unit Price</th>
                                                        <th className="px-4 py-2.5 font-bold text-gray-500 uppercase tracking-tighter text-right">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {formData.interestedIn.map((item, idx) => {
                                                        const product = availableProducts.find(p => p._id === item.item);
                                                        const unitPrice = product?.basePrice || 0;
                                                        const total = (item.quantity || 0) * unitPrice;
                                                        return (
                                                            <tr key={idx}>
                                                                <td className="px-4 py-3 font-semibold text-gray-900 uppercase tracking-tighter">{product?.name || 'Unknown'}</td>
                                                                <td className="px-4 py-3 text-center font-bold text-gray-600">{item.quantity}</td>
                                                                <td className="px-4 py-3 text-right text-gray-500 font-medium">₹{unitPrice.toLocaleString()}</td>
                                                                <td className="px-4 py-3 text-right font-black text-gray-900 tracking-tighter">₹{total.toLocaleString()}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                                <tfoot className="bg-white/50">
                                                    <tr>
                                                        <td colSpan="3" className="px-4 py-3 text-right font-bold text-gray-500 uppercase text-[10px]">Grand Total</td>
                                                        <td className="px-4 py-3 text-right font-black text-blue-600 text-sm tracking-tighter">
                                                            ₹{(formData.interestedIn.reduce((acc, item) => {
                                                                const product = availableProducts.find(p => p._id === item.item);
                                                                return acc + ((item.quantity || 0) * (product?.basePrice || 0));
                                                            }, 0)).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address</p>
                                            <p className="text-sm text-gray-700 leading-relaxed font-medium">{formData.customerData.address || 'No address provided'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Remarks</p>
                                            <p className="text-sm text-gray-700 leading-relaxed font-medium italic">"{formData.remarks || 'No remarks added'}"</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-2 border-t justify-end">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <fieldset className="contents">
                                        {/* Row 1: Customer Details (4 Columns) */}
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer Details</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Customer Name *</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        required
                                                        disabled={userRole === 'STAFF'}
                                                        className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                                                        value={formData.customerData.name}
                                                        onChange={handleCustomerChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
                                                    <input
                                                        type="tel"
                                                        name="contact"
                                                        required
                                                        disabled={userRole === 'STAFF'}
                                                        className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                                                        value={formData.customerData.contact}
                                                        onChange={handleCustomerChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        disabled={userRole === 'STAFF'}
                                                        className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                                                        value={formData.customerData.email}
                                                        onChange={handleCustomerChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Contact Person</label>
                                                    <input
                                                        type="text"
                                                        name="contactPerson"
                                                        disabled={userRole === 'STAFF'}
                                                        className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                                                        value={formData.customerData.contactPerson}
                                                        onChange={handleCustomerChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 2: Lead Details (4 Columns) */}
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Lead Information</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Source *</label>
                                                    <select
                                                        name="source"
                                                        required
                                                        disabled={userRole === 'STAFF'}
                                                        className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-500"
                                                        value={formData.source}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="WHATSAPP">WhatsApp</option>
                                                        <option value="EMAIL">Email</option>
                                                        <option value="REFERRAL">Referral</option>
                                                        <option value="WEBSITE">Website</option>
                                                        <option value="CALL">Call</option>
                                                        <option value="OTHER">Other</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Status *</label>
                                                    <select
                                                        name="status"
                                                        required
                                                        className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-500"
                                                        value={formData.status}
                                                        onChange={handleInputChange}
                                                    >
                                                        {!currentLead ? (
                                                            // Creation Mode: Auto-filtered options
                                                            formData.assignedTo ? (
                                                                <option value="ASSIGNED">ASSIGNED</option>
                                                            ) : (
                                                                <option value="NEW">NEW</option>
                                                            )
                                                        ) : (
                                                            // Edit Mode: Transition-based options
                                                            (() => {
                                                                const VALID_TRANSITIONS = {
                                                                    NEW: ['ASSIGNED'],
                                                                    ASSIGNED: ['CONTACTED', 'LOST'],
                                                                    CONTACTED: ['QUALIFIED', 'LOST'],
                                                                    QUALIFIED: ['QUOTATION_SENT', 'LOST'],
                                                                    QUOTATION_SENT: ['CONVERTED_TO_ORDER', 'LOST'],
                                                                };
                                                                const currentStatus = currentLead.status || 'NEW';
                                                                const nextStatuses = VALID_TRANSITIONS[currentStatus] || [];

                                                                return (
                                                                    <>
                                                                        <option value={currentStatus}>{currentStatus}</option>
                                                                        {nextStatuses.map((status) => (
                                                                            <option key={status} value={status}>{status}</option>
                                                                        ))}
                                                                    </>
                                                                );
                                                            })()
                                                        )}
                                                    </select>
                                                </div>
                                                <div className="col-span-4">
                                                    <label className="block text-xs font-medium text-gray-700 mb-2">Interested In Products *</label>
                                                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-x-auto">
                                                        <table className="w-full text-left text-xs">
                                                            <thead className="bg-gray-100 border-b border-gray-200">
                                                                <tr>
                                                                    <th className="px-3 py-2 font-semibold text-gray-600">Product</th>
                                                                    <th className="px-3 py-2 font-semibold text-gray-600 w-24">Quantity</th>
                                                                    <th className="px-3 py-2 font-semibold text-gray-600 w-24">Price</th>
                                                                    <th className="px-3 py-2 font-semibold text-gray-600 w-24">Total</th>
                                                                    <th className="px-3 py-2 font-semibold text-gray-600 w-10"></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200">
                                                                {formData.interestedIn.map((item, idx) => {
                                                                    const product = availableProducts.find(p => p._id === item.item);
                                                                    const unitPrice = product?.basePrice || 0;
                                                                    const total = (item.quantity || 0) * unitPrice;

                                                                    return (
                                                                        <tr key={idx} className="bg-white">
                                                                            <td className="px-3 py-2">
                                                                                <span className="font-medium text-gray-900">
                                                                                    {product?.name || 'Unknown Item'}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-3 py-2">
                                                                                <input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    disabled={userRole === 'STAFF'}
                                                                                    value={item.quantity}
                                                                                    onChange={(e) => {
                                                                                        const newQty = parseInt(e.target.value) || 0;
                                                                                        const newInterestedIn = [...formData.interestedIn];
                                                                                        newInterestedIn[idx] = { ...newInterestedIn[idx], quantity: newQty };
                                                                                        setFormData({ ...formData, interestedIn: newInterestedIn });
                                                                                    }}
                                                                                    className="w-full border-gray-300 rounded text-xs py-1 px-2 focus:ring-blue-500 focus:border-blue-500"
                                                                                />
                                                                            </td>
                                                                            <td className="px-3 py-2 text-gray-600">₹{(unitPrice || 0).toLocaleString()}</td>
                                                                            <td className="px-3 py-2 font-medium text-gray-900">₹{(total || 0).toLocaleString()}</td>
                                                                            {(userRole !== 'STAFF') && (
                                                                                <td className="px-3 py-2 text-right">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            const newInterestedIn = formData.interestedIn.filter((_, i) => i !== idx);
                                                                                            setFormData({ ...formData, interestedIn: newInterestedIn });
                                                                                        }}
                                                                                        className="text-red-500 hover:text-red-700 font-bold"
                                                                                    >
                                                                                        &times;
                                                                                    </button>
                                                                                </td>
                                                                            )}
                                                                        </tr>
                                                                    );
                                                                })}
                                                                {formData.interestedIn.length === 0 && (
                                                                    <tr>
                                                                        <td colSpan={5} className="px-3 py-4 text-center text-gray-500 italic">
                                                                            No products added yet.
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                            {(userRole !== 'STAFF') && (
                                                                <tfoot className="bg-gray-50 border-t border-gray-200">
                                                                    <tr>
                                                                        <td colSpan="5" className="p-2">
                                                                            <select
                                                                                className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                                                                value=""
                                                                                onChange={(e) => {
                                                                                    const val = e.target.value;
                                                                                    if (val) {
                                                                                        const existing = formData.interestedIn.find(i => i.item === val);
                                                                                        if (existing) {
                                                                                            setFormData({
                                                                                                ...formData,
                                                                                                interestedIn: formData.interestedIn.map(i => i.item === val ? { ...i, quantity: i.quantity + 1 } : i)
                                                                                            });
                                                                                        } else {
                                                                                            setFormData({
                                                                                                ...formData,
                                                                                                interestedIn: [...formData.interestedIn, { item: val, quantity: 1 }]
                                                                                            });
                                                                                        }
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <option value="">+ Add Product</option>
                                                                                {availableProducts.map((p) => (
                                                                                    <option key={p._id} value={p._id}>
                                                                                        {p.name} - ₹{p.basePrice}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                        </td>
                                                                    </tr>
                                                                </tfoot>
                                                            )}
                                                        </table>
                                                    </div>
                                                    <div className="flex justify-end mt-2 px-3">
                                                        <div className="text-sm font-bold text-gray-900">
                                                            Grand Total: <span className="text-blue-600">₹{
                                                                (formData.interestedIn.reduce((acc, item) => {
                                                                    const product = availableProducts.find(p => p._id === item.item);
                                                                    return acc + ((item.quantity || 0) * (product?.basePrice || 0));
                                                                }, 0) || 0).toLocaleString()
                                                            }</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Assign To</label>
                                                    <select
                                                        name="assignedTo"
                                                        disabled={userRole === 'STAFF'}
                                                        className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-500"
                                                        value={formData.assignedTo || ''}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">Unassigned</option>
                                                        {salesPersons.map((sp) => (
                                                            <option key={sp._id} value={sp._id}>{sp.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 3: Text Areas (Split) */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                                                <textarea
                                                    name="address"
                                                    rows="2"
                                                    disabled={userRole === 'STAFF'}
                                                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none resize-none disabled:bg-gray-50 disabled:text-gray-500"
                                                    value={formData.customerData.address}
                                                    onChange={handleCustomerChange}
                                                    placeholder="Enter full address..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
                                                <textarea
                                                    name="remarks"
                                                    rows="2"
                                                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none resize-none disabled:bg-gray-50 disabled:text-gray-500"
                                                    value={formData.remarks}
                                                    onChange={handleInputChange}
                                                    placeholder="Internal notes..."
                                                />
                                            </div>
                                        </div>
                                    </fieldset>

                                    <div className="flex gap-3 pt-2 border-t justify-end">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold transition-all shadow-md active:scale-95"
                                        >
                                            {currentLead ? 'Update Lead' : 'Save Lead'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

            {/* Followup History Modal */}
            {isFollowupOpen && (
                <FollowupHistory
                    leadId={followupLeadId}
                    onClose={handleCloseFollowup}
                />
            )}
        </div>
    )
}

export default LeadsManager
