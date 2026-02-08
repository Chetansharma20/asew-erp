// Centralized Mock Data for Leads, Products, Sales Persons, and Quotations

export const availableProducts = [
    { id: 'p1', name: 'Honda Activa 6G', unitPrice: 75000, category: 'Scooter' },
    { id: 'p2', name: 'Hero Splendor Plus', unitPrice: 68000, category: 'Motorcycle' },
    { id: 'p3', name: 'TVS Jupiter', unitPrice: 72000, category: 'Scooter' },
    { id: 'p4', name: 'Bajaj Pulsar 150', unitPrice: 105000, category: 'Motorcycle' },
    { id: 'p5', name: 'Yamaha FZ-S', unitPrice: 115000, category: 'Motorcycle' },
]

export const salesPersons = [
    { id: 'sp1', name: 'Rajesh Kumar' },
    { id: 'sp2', name: 'Priya Sharma' },
    { id: 'sp3', name: 'Amit Patel' },
]

export const initialLeads = [
    {
        id: 1,
        leadNo: 'L-2026-001',
        customer: {
            name: 'Ramesh Verma',
            phone: '+91 98765 43210',
            email: 'ramesh@example.com',
            companyName: 'Verma Enterprises',
            address: '123 MG Road, Mumbai'
        },
        interestedIn: [
            { productId: 'p1', name: 'Honda Activa 6G' }
        ],
        status: 'QUALIFIED',
        assignedTo: 'sp1',
        remarks: 'Customer interested in bulk purchase',
        createdBy: 'subadmin1'
    },
    {
        id: 2,
        leadNo: 'L-2026-002',
        customer: {
            name: 'Sunita Desai',
            phone: '+91 87654 32109',
            email: 'sunita@example.com',
            companyName: 'Desai Motors',
            address: '456 Park Street, Delhi'
        },
        interestedIn: [
            { productId: 'p4', name: 'Bajaj Pulsar 150' }
        ],
        status: 'QUALIFIED',
        assignedTo: 'sp1',
        remarks: 'Follow up scheduled for next week',
        createdBy: 'subadmin1'
    },
    {
        id: 3,
        leadNo: 'L-2026-003',
        customer: {
            name: 'Anil Kapoor',
            phone: '+91 76543 21098',
            email: 'anil@example.com',
            companyName: null,
            address: '789 Brigade Road, Bangalore'
        },
        interestedIn: [
            { productId: 'p3', name: 'TVS Jupiter' }
        ],
        status: 'CONTACTED',
        assignedTo: 'sp2',
        remarks: 'Waiting for customer response',
        createdBy: 'subadmin2'
    },
]

export const initialQuotations = [
    {
        id: 1,
        quotationNo: 'Q-2026-001',
        leadId: 1,
        salesPersonId: 'sp1',
        status: 'SENT',
        items: [
            {
                productId: 'p1',
                name: 'Honda Activa 6G',
                qty: 5,
                unitPrice: 75000,
                total: 375000
            }
        ],
        additionalCharges: [
            {
                title: 'Transport',
                type: 'FIXED',
                value: 5000,
                amount: 5000
            }
        ],
        subTotal: 375000,
        discount: {
            type: 'PERCENTAGE',
            value: 5,
            amount: 18750
        },
        tax: {
            type: 'GST',
            percentage: 18,
            amount: 64125
        },
        grandTotal: 425375,
        notes: 'Payment terms: 50% advance, 50% on delivery',
        createdAt: '2026-02-01',
        createdBy: 'sp1'
    }
]

