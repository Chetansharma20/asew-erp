import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../common/Sidebar'
import Header from '../common/Header'

const AdminLayout = () => {
    // Admin (Owner) has full access, similar to Super Admin but business focused
    const menuItems = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { label: 'Users', path: '/admin/users', icon: '👥' },
        { label: 'Orders', path: '/admin/orders', icon: '📦' },
        { label: 'Leads', path: '/admin/leads', icon: '📞' },
        { label: 'Items', path: '/admin/items', icon: '📁' },
        { label: 'Quotations', path: '/admin/quotations', icon: '📝' },
        { label: 'Customers', path: '/admin/customers', icon: '🏢' },
        { label: 'Reports', path: '/admin/reports', icon: '📈' }, // Owner might want specific reports

    ]

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar menuItems={menuItems} colorScheme="purple" /> {/* Distinct color for Owner */}
            <div className="flex-1 flex flex-col">
                <Header role="Admin (Owner)" />
                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
