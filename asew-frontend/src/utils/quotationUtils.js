// Quotation Utility Functions

export const generateQuotationNo = (existingQuotations) => {
    const year = new Date().getFullYear()
    const count = existingQuotations.length + 1
    return `Q-${year}-${String(count).padStart(3, '0')}`
}

export const calculateItemTotal = (qty, unitPrice) => {
    return qty * unitPrice
}

export const calculateSubTotal = (items) => {
    return items.reduce((sum, item) => sum + item.total, 0)
}

export const calculateAdditionalChargeAmount = (charge, subTotal) => {
    if (charge.type === 'FIXED') {
        return charge.value
    } else if (charge.type === 'PERCENTAGE') {
        return (subTotal * charge.value) / 100
    }
    return 0
}

export const calculateTotalAdditionalCharges = (charges, subTotal) => {
    return charges.reduce((sum, charge) => {
        return sum + calculateAdditionalChargeAmount(charge, subTotal)
    }, 0)
}

export const calculateDiscountAmount = (discount, subTotal) => {
    if (!discount || !discount.value) return 0

    if (discount.type === 'FIXED') {
        return discount.value
    } else if (discount.type === 'PERCENTAGE') {
        return (subTotal * discount.value) / 100
    }
    return 0
}

export const calculateTaxAmount = (tax, taxableAmount) => {
    if (!tax || !tax.percentage) return 0
    return (taxableAmount * tax.percentage) / 100
}

export const calculateGrandTotal = (subTotal, additionalCharges, discount, tax) => {
    const additionalChargesTotal = calculateTotalAdditionalCharges(additionalCharges, subTotal)
    const discountAmount = calculateDiscountAmount(discount, subTotal)
    const taxableAmount = subTotal + additionalChargesTotal - discountAmount
    const taxAmount = calculateTaxAmount(tax, taxableAmount)

    return taxableAmount + taxAmount
}

export const validateQuotation = (quotation) => {
    const errors = []

    if (!quotation.leadId) {
        errors.push('Please select a lead')
    }

    if (!quotation.items || quotation.items.length === 0) {
        errors.push('Please add at least one item')
    }

    if (quotation.items) {
        quotation.items.forEach((item, index) => {
            if (!item.productId) {
                errors.push(`Item ${index + 1}: Please select a product`)
            }
            if (!item.qty || item.qty <= 0) {
                errors.push(`Item ${index + 1}: Quantity must be greater than 0`)
            }
            if (!item.unitPrice || item.unitPrice <= 0) {
                errors.push(`Item ${index + 1}: Unit price must be greater than 0`)
            }
        })
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}
