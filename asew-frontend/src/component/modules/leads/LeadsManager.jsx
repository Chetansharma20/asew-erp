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
            companyName: '',
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
        'FOLLOW_UP': 'bg-yellow-100 text-yellow-800',
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
                customerData: lead.customer || {
                    name: '',
                    contact: '',
                    email: '',
                    companyName: '',
                    address: ''
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
        setFormData({ ...formData, [name]: value })
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
                    assignedTo: formData.assignedTo
                }
                await leadApi.updateLead(currentLead._id, updateData)
            } else {
                // Add
                await leadApi.createLead(formData)
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
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead No</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Interested In</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</th>
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
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{lead.leadNo}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{lead.customer?.name}</div>
                                            {lead.customer?.companyName && (
                                                <div className="text-xs text-gray-500">{lead.customer.companyName}</div>
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
                                        <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                                            <button
                                                onClick={() => handleOpenModal(lead, true)}
                                                className="text-gray-500 hover:text-gray-700 transition-colors"
                                                title="View Details"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleOpenFollowup(lead._id)}
                                                className="text-yellow-600 hover:text-yellow-800 transition-colors"
                                                title="Follow Up History"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(lead)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                title="Edit"
                                            >
                                                Edit
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
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl p-5 animate-in fade-in zoom-in duration-200">
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

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <fieldset disabled={isViewOnly} className="contents">
                                    {/* Row 1: Customer Details (4 Columns) */}
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer Details</h4>
                                        <div className="grid grid-cols-4 gap-4">
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
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                                                <input
                                                    type="text"
                                                    name="companyName"
                                                    disabled={userRole === 'STAFF'}
                                                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                                                    value={formData.customerData.companyName}
                                                    onChange={handleCustomerChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 2: Lead Details (4 Columns) */}
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Lead Information</h4>
                                        <div className="grid grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Lead Number</label>
                                                <input
                                                    type="text"
                                                    name="leadNo"
                                                    readOnly
                                                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
                                                    value={formData.leadNo}
                                                />
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
                                                    <option value="NEW">NEW</option>
                                                    <option value="REJECTED">REJECTED</option>
                                                    <option value="ASSIGNED">ASSIGNED</option>
                                                    <option value="CONTACTED">CONTACTED</option>
                                                    <option value="QUALIFIED">QUALIFIED</option>
                                                    <option value="QUOTATION_SENT">QUOTATION_SENT</option>
                                                    <option value="FOLLOW_UP">FOLLOW_UP</option>
                                                    <option value="LOST">LOST</option>
                                                </select>
                                            </div>
                                            <div className="col-span-4">
                                                <label className="block text-xs font-medium text-gray-700 mb-2">Interested In Products *</label>
                                                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-gray-100 border-b border-gray-200">
                                                            <tr>
                                                                <th className="px-3 py-2 font-semibold text-gray-600">Product</th>
                                                                <th className="px-3 py-2 font-semibold text-gray-600 w-24">Quantity</th>
                                                                <th className="px-3 py-2 font-semibold text-gray-600 w-24">Price</th>
                                                                <th className="px-3 py-2 font-semibold text-gray-600 w-24">Total</th>
                                                                {!isViewOnly && <th className="px-3 py-2 font-semibold text-gray-600 w-10"></th>}
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
                                                                                disabled={isViewOnly || userRole === 'STAFF'}
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
                                                                        {(!isViewOnly && userRole !== 'STAFF') && (
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
                                                                    <td colSpan={isViewOnly ? 4 : 5} className="px-3 py-4 text-center text-gray-500 italic">
                                                                        No products added yet.
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                        {(!isViewOnly && userRole !== 'STAFF') && (
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
                                    <div className="grid grid-cols-2 gap-4">
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
                                        {isViewOnly ? 'Close' : 'Cancel'}
                                    </button>
                                    {!isViewOnly && (
                                        <button
                                            type="submit"
                                            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                                        >
                                            {currentLead ? 'Save Changes' : 'Create Lead'}
                                        </button>
                                    )}
                                </div>
                            </form>
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
