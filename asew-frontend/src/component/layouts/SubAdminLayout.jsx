import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../common/Sidebar'
import Header from '../common/Header'

const SubAdminLayout = () => {
    const menuItems = [
        { label: 'Dashboard', path: '/sub-admin/dashboard', icon: '📊' },
        { label: 'Users', path: '/sub-admin/users', icon: '👥' },
        { label: 'Orders', path: '/sub-admin/orders', icon: '📦' },
        { label: 'Items', path: '/sub-admin/items', icon: '📁' },
        { label: 'Quotations', path: '/sub-admin/quotations', icon: '📝' },
        { label: 'Leads', path: '/sub-admin/leads', icon: '🎯' },
        { label: 'Customers', path: '/sub-admin/customers', icon: '🏢' }, // Added Customers
    ]

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar menuItems={menuItems} colorScheme="blue" />
            <div className="flex-1 flex flex-col">
                <Header role="Sub Admin" />
                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default SubAdminLayout
