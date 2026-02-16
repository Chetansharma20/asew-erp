import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../common/Sidebar'
import Header from '../common/Header'
import { LayoutDashboard, Users, ShoppingCart, Phone, Package, FileText, Building2, BarChart3 } from 'lucide-react'

const AdminLayout = () => {
    // Admin (Owner) has full access, similar to Super Admin but business focused
    const menuItems = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { label: 'Users', path: '/admin/users', icon: <Users size={20} /> },
        { label: 'Orders', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
        { label: 'Leads', path: '/admin/leads', icon: <Phone size={20} /> },
        { label: 'Items', path: '/admin/items', icon: <Package size={20} /> },
        { label: 'Quotations', path: '/admin/quotations', icon: <FileText size={20} /> },
        { label: 'Customers', path: '/admin/customers', icon: <Building2 size={20} /> },
        // { label: 'Reports', path: '/admin/reports', icon: <BarChart3 size={20} /> }, // Owner might want specific reports

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
