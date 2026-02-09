import React, { useState, useEffect } from 'react'
import * as leadApi from '../../../api/leadApi'
import * as itemApi from '../../../api/itemApi'
import * as quotationApi from '../../../api/quotationApi'
import {
    calculateItemTotal,
    calculateSubTotal,
    calculateAdditionalChargeAmount,
    calculateTotalAdditionalCharges,
    calculateDiscountAmount,
    calculateTaxAmount,
    calculateGrandTotal
} from '../../../utils/quotationUtils'

const QuotationModal = ({ isOpen, onClose, selectedLead = null, initialQuotation = null, mode = 'create' }) => {
    const [leads, setLeads] = useState([])
    const [availableProducts, setAvailableProducts] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        leadId: selectedLead?._id || '',
        items: [{ itemId: '', name: '', qty: 1, unitPrice: 0, total: 0 }],
        additionalCharges: [],
        discount: { type: 'PERCENTAGE', value: 0, amount: 0 },
        tax: { type: 'GST', percentage: 18, amount: 0 },
        notes: ''
    })

    const isViewMode = mode === 'view';
    const isEditMode = mode === 'edit';

    useEffect(() => {
        if (isOpen) {
            fetchInitialData()
        }
    }, [isOpen])

    // Populate form data when initialQuotation changes
    useEffect(() => {
        if (initialQuotation && (isEditMode || isViewMode)) {
            setFormData({
                leadId: initialQuotation.leadId?._id || initialQuotation.leadId || '',
                items: initialQuotation.quotationItems.map(item => ({
                    itemId: item.itemId._id || item.itemId,
                    name: item.itemId.name || item.name || '',
                    qty: item.quantity,
                    unitPrice: item.UnitPrice,
                    total: item.Total
                })),
                additionalCharges: initialQuotation.additionalCharges || [],
                discount: initialQuotation.discount || { type: 'PERCENTAGE', value: 0, amount: 0 },
                tax: initialQuotation.tax || { type: 'GST', percentage: 18, amount: 0 },
                notes: initialQuotation.notes || ''
            })
        } else if (mode === 'create') {
            // Reset form for create mode
            setFormData({
                leadId: selectedLead?._id || '',
                items: [{ itemId: '', name: '', qty: 1, unitPrice: 0, total: 0 }],
                additionalCharges: [],
                discount: { type: 'PERCENTAGE', value: 0, amount: 0 },
                tax: { type: 'GST', percentage: 18, amount: 0 },
                notes: ''
            })
        }
    }, [initialQuotation, mode, selectedLead])

    const fetchInitialData = async () => {
        setIsLoading(true)
        try {
            // For edit/view, we might need all leads, but typically we just need the one in the quotation
            // For create, we filter by QUALIFIED
            // For create, we filter by QUALIFIED
            const leadParams = mode === 'create' ? { status: 'QUALIFIED' } : {};

            const [leadsRes, itemsRes] = await Promise.all([
                leadApi.getAllLeads(leadParams),
                itemApi.getAllItems()
            ])
            setLeads(leadsRes.data.leads || [])
            setAvailableProducts(itemsRes.data.items || [])
        } catch (error) {
            console.error("Error fetching quotation data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const selectedLeadData = leads.find(lead => lead._id === formData.leadId)

    // Recalculate totals whenever items, charges, discount, or tax change
    useEffect(() => {
        if (isViewMode) return; // Don't recalculate in view mode to avoid overwriting with potentially missing product data

        const subTotal = calculateSubTotal(formData.items)
        const discountAmount = calculateDiscountAmount(formData.discount, subTotal)
        const additionalChargesTotal = calculateTotalAdditionalCharges(formData.additionalCharges, subTotal)
        const taxableAmount = subTotal + additionalChargesTotal - discountAmount
        const taxAmount = calculateTaxAmount(formData.tax, taxableAmount)

        setFormData(prev => ({
            ...prev,
            discount: { ...prev.discount, amount: discountAmount },
            tax: { ...prev.tax, amount: taxAmount }
        }))
    }, [formData.items, formData.additionalCharges, formData.discount.type, formData.discount.value, formData.tax.percentage, isViewMode])

    const handleLeadChange = (e) => {
        if (isViewMode) return;
        const leadId = e.target.value
        setFormData({ ...formData, leadId })

        // Auto-populate items from lead's interestedIn only in create mode
        if (mode === 'create' && leadId) {
            const lead = leads.find(l => l._id === leadId)
            if (lead && lead.interestedIn && lead.interestedIn.length > 0) {
                const populatedItems = lead.interestedIn.map(interested => {
                    const product = availableProducts.find(p => p._id === interested.item?._id || p._id === interested.item)
                    return {
                        itemId: interested.item?._id || interested.item,
                        name: product?.name || '',
                        qty: interested.quantity || 1,
                        unitPrice: product?.basePrice || 0,
                        total: (interested.quantity || 1) * (product?.basePrice || 0)
                    }
                })
                setFormData(prev => ({ ...prev, leadId, items: populatedItems }))
            }
        }
    }

    const handleAddItem = () => {
        if (isViewMode) return;
        setFormData({
            ...formData,
            items: [...formData.items, { itemId: '', name: '', qty: 1, unitPrice: 0, total: 0 }]
        })
    }

    const handleRemoveItem = (index) => {
        if (isViewMode) return;
        const newItems = formData.items.filter((_, i) => i !== index)
        setFormData({ ...formData, items: newItems })
    }

    const handleItemChange = (index, field, value) => {
        if (isViewMode) return;
        const newItems = [...formData.items]

        if (field === 'itemId') {
            const product = availableProducts.find(p => p._id === value)
            if (product) {
                newItems[index].itemId = product._id
                newItems[index].name = product.name
                newItems[index].unitPrice = product.basePrice || 0
            } else {
                newItems[index].itemId = ''
                newItems[index].name = ''
                newItems[index].unitPrice = 0
            }
        } else {
            newItems[index][field] = value
        }

        // Recalculate total for this item
        if (field === 'qty' || field === 'unitPrice' || field === 'itemId') {
            newItems[index].total = calculateItemTotal(newItems[index].qty, newItems[index].unitPrice)
        }

        setFormData({ ...formData, items: newItems })
    }

    const handleAddCharge = () => {
        if (isViewMode) return;
        setFormData({
            ...formData,
            additionalCharges: [...formData.additionalCharges, { title: '', type: 'FIXED', value: 0, amount: 0 }]
        })
    }

    const handleRemoveCharge = (index) => {
        if (isViewMode) return;
        const newCharges = formData.additionalCharges.filter((_, i) => i !== index)
        setFormData({ ...formData, additionalCharges: newCharges })
    }

    const handleChargeChange = (index, field, value) => {
        if (isViewMode) return;
        const newCharges = [...formData.additionalCharges]
        newCharges[index][field] = value

        // Recalculate amount for this charge
        if (field === 'type' || field === 'value') {
            const subTotal = calculateSubTotal(formData.items)
            newCharges[index].amount = calculateAdditionalChargeAmount(newCharges[index], subTotal)
        }

        setFormData({ ...formData, additionalCharges: newCharges })
    }

    const handleSubmit = async (e, status = 'CREATED', sendEmail = false) => {
        e.preventDefault()
        if (isViewMode) return;

        try {
            // Map data to backend schema
            const mappedData = {
                leadId: formData.leadId,
                quotationItems: formData.items.map(item => ({
                    itemId: item.itemId,
                    quantity: item.qty,
                    UnitPrice: item.unitPrice,
                    Total: item.total
                })),
                additionalCharges: formData.additionalCharges.map(charge => ({
                    title: charge.title,
                    type: charge.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed',
                    value: charge.value,
                    amount: charge.amount
                })),
                discount: {
                    type: formData.discount.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed',
                    value: formData.discount.value,
                    amount: formData.discount.amount
                },
                tax: {
                    type: formData.tax.type,
                    percentage: formData.tax.percentage,
                    amount: formData.tax.amount
                },
                notes: formData.notes,
                validTill: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default 7 days
                // Only send status if creating; updates usually don't change status to CREATED unless specified
                ...(mode === 'create' && { status: status === 'CREATED' ? 'CREATED' : 'SENT' })
            }

            if (mode === 'edit' && initialQuotation) {
                await quotationApi.updateQuotation(initialQuotation._id, mappedData)
                if (sendEmail) {
                    await quotationApi.sendQuotationEmail(initialQuotation._id)
                    alert('Quotation updated and sent successfully')
                } else {
                    alert('Quotation updated successfully')
                }
            } else {
                const res = await quotationApi.createQuotation(mappedData)
                if (status === 'SENT' || sendEmail) {
                    // For create mode, if status is SENT, the backend might handle it, 
                    // but we can also explicitly send if needed. 
                    // However, based on createQuotation service, it sets status to CREATED.
                    // So we probably need to call sendQuotationEmail here if it was meant to be SENT.
                    if (res?.data?._id) {
                        await quotationApi.sendQuotationEmail(res.data._id)
                    }
                }
                alert(`Quotation ${status === 'CREATED' ? 'created' : 'sent'} successfully`)
            }
            onClose()
        } catch (error) {
            console.error('Error saving quotation:', error)
            alert(error.message || 'Failed to save quotation')
        }
    }

    if (!isOpen) return null

    // For view mode, use the calculated totals from the backend (initialQuotation) if available, 
    // otherwise fallback to client calculation
    const subTotal = isViewMode && initialQuotation
        ? initialQuotation.quotationItems.reduce((acc, item) => acc + item.Total, 0)
        : calculateSubTotal(formData.items)

    const grandTotal = isViewMode && initialQuotation
        ? initialQuotation.totalAmount
        : calculateGrandTotal(
            subTotal,
            formData.additionalCharges,
            formData.discount,
            formData.tax
        )

    return (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto py-8">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-4">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">
                        {mode === 'create' ? 'Generate Quotation' : mode === 'edit' ? 'Edit Quotation' : 'View Quotation'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={(e) => handleSubmit(e, 'CREATED')} className="p-8 space-y-8">
                    {/* Section 1: Lead Selection */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900">Lead Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Lead *</label>
                                <select
                                    value={formData.leadId}
                                    onChange={handleLeadChange}
                                    required
                                    disabled={mode !== 'create'} // Cannot change lead during edit/view
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                >
                                    <option value="">-- Select Lead --</option>
                                    {isLoading ? (
                                        <option disabled>Loading leads...</option>
                                    ) : (
                                        leads.map(lead => (
                                            <option key={lead._id} value={lead._id}>
                                                {lead.leadNo} - {lead.customer?.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            {selectedLeadData && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-700">Customer Details</p>
                                    <p className="text-sm text-gray-600 mt-1">{selectedLeadData.customer?.name}</p>
                                    <p className="text-xs text-gray-500">{selectedLeadData.customer?.contact}</p>
                                    <p className="text-xs text-gray-500">{selectedLeadData.customer?.email}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 2: Items */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-semibold text-gray-900">Items</h4>
                            {!isViewMode && (
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    + Add Item
                                </button>
                            )}
                        </div>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Product</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Qty</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Unit Price</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Total</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {formData.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={item.itemId}
                                                    onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                                                    required
                                                    disabled={isViewMode}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                                >
                                                    <option value="">-- Select --</option>
                                                    {availableProducts.map(product => (
                                                        <option key={product._id} value={product._id}>
                                                            {product.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={item.qty}
                                                    onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value) || 0)}
                                                    min="1"
                                                    required
                                                    disabled={isViewMode}
                                                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={item.unitPrice}
                                                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                    min="0"
                                                    required
                                                    disabled={isViewMode}
                                                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    ₹{(item.total || 0).toLocaleString('en-IN')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {!isViewMode && formData.items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(index)}
                                                        className="text-red-600 hover:text-red-700 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end">
                            <div className="text-right">
                                <span className="text-sm text-gray-600">Subtotal: </span>
                                <span className="text-lg font-bold text-gray-900">₹{(subTotal || 0).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Additional Charges */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-semibold text-gray-900">Additional Charges</h4>
                            {!isViewMode && (
                                <button
                                    type="button"
                                    onClick={handleAddCharge}
                                    className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    + Add Charge
                                </button>
                            )}
                        </div>
                        {formData.additionalCharges.length > 0 && (
                            <div className="space-y-2">
                                {formData.additionalCharges.map((charge, index) => (
                                    <div key={index} className="grid grid-cols-5 gap-3 items-center">
                                        <input
                                            type="text"
                                            placeholder="Title (e.g., Transport)"
                                            value={charge.title}
                                            onChange={(e) => handleChargeChange(index, 'title', e.target.value)}
                                            required
                                            disabled={isViewMode}
                                            className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                        />
                                        <select
                                            value={charge.type}
                                            onChange={(e) => handleChargeChange(index, 'type', e.target.value)}
                                            disabled={isViewMode}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                        >
                                            <option value="FIXED">Fixed</option>
                                            <option value="PERCENTAGE">Percentage</option>
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Value"
                                            value={charge.value}
                                            onChange={(e) => handleChargeChange(index, 'value', parseFloat(e.target.value) || 0)}
                                            min="0"
                                            required
                                            disabled={isViewMode}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                        />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-900">
                                                ₹{(charge.amount || 0).toLocaleString('en-IN')}
                                            </span>
                                            {!isViewMode && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCharge(index)}
                                                    className="text-red-600 hover:text-red-700 text-sm ml-2"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Section 4: Discount & Tax */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-gray-900">Discount</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    value={formData.discount.type}
                                    onChange={(e) => setFormData({ ...formData, discount: { ...formData.discount, type: e.target.value } })}
                                    disabled={isViewMode}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                >
                                    <option value="FIXED">Fixed</option>
                                    <option value="PERCENTAGE">Percentage</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Value"
                                    value={formData.discount.value}
                                    onChange={(e) => setFormData({ ...formData, discount: { ...formData.discount, value: parseFloat(e.target.value) || 0 } })}
                                    min="0"
                                    disabled={isViewMode}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                />
                            </div>
                            <p className="text-sm text-gray-600">
                                Discount Amount: <span className="font-semibold">₹{(formData.discount.amount || 0).toLocaleString('en-IN')}</span>
                            </p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-gray-900">Tax (GST)</h4>
                            <input
                                type="number"
                                placeholder="GST %"
                                value={formData.tax.percentage}
                                onChange={(e) => setFormData({ ...formData, tax: { ...formData.tax, percentage: parseFloat(e.target.value) || 0 } })}
                                min="0"
                                max="100"
                                disabled={isViewMode}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                            />
                            <p className="text-sm text-gray-600">
                                Tax Amount: <span className="font-semibold">₹{(formData.tax.amount || 0).toLocaleString('en-IN')}</span>
                            </p>
                        </div>
                    </div>

                    {/* Section 5: Notes */}
                    <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-gray-900">Notes / Terms & Conditions</h4>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows="3"
                            disabled={isViewMode}
                            placeholder="Enter any special notes, terms, or conditions..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        />
                    </div>

                    {/* Grand Total */}
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-900">Grand Total</span>
                            <span className="text-3xl font-bold text-blue-600">₹{(grandTotal || 0).toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            {isViewMode ? 'Close' : 'Cancel'}
                        </button>
                        {!isViewMode && (
                            <>
                                {mode === 'create' ? (
                                    <>
                                        <button
                                            type="submit"
                                            className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                                        >
                                            Save as Draft
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => handleSubmit(e, 'SENT')}
                                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                        >
                                            Send to Customer
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={(e) => handleSubmit(e, 'CREATED')}
                                            className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                                        >
                                            Update & Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => handleSubmit(e, 'SENT', true)}
                                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                        >
                                            Update & Send
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default QuotationModal
