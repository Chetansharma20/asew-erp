import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../common/Sidebar'
import Header from '../common/Header'
import { LayoutDashboard, Users, ShoppingCart, Package, FileText, Target, Building2 } from 'lucide-react'

const SubAdminLayout = () => {
    const menuItems = [
        { label: 'Dashboard', path: '/sub-admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { label: 'Users', path: '/sub-admin/users', icon: <Users size={20} /> },
        { label: 'Orders', path: '/sub-admin/orders', icon: <ShoppingCart size={20} /> },
        { label: 'Items', path: '/sub-admin/items', icon: <Package size={20} /> },
        { label: 'Quotations', path: '/sub-admin/quotations', icon: <FileText size={20} /> },
        { label: 'Leads', path: '/sub-admin/leads', icon: <Target size={20} /> },
        { label: 'Customers', path: '/sub-admin/customers', icon: <Building2 size={20} /> }, // Added Customers
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
