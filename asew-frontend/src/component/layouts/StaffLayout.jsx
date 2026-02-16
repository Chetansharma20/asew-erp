import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../common/Sidebar'
import Header from '../common/Header'
import { LayoutDashboard, Users, FileText, ShoppingCart } from 'lucide-react'

const StaffLayout = () => {
    const menuItems = [
        { label: 'Dashboard', path: '/staff/dashboard', icon: <LayoutDashboard size={20} /> },
        { label: 'Leads', path: '/staff/leads', icon: <Users size={20} /> },
        { label: 'Quotations', path: '/staff/quotations', icon: <FileText size={20} /> },
        { label: 'Orders', path: '/staff/orders', icon: <ShoppingCart size={20} /> },
    ]



    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar menuItems={menuItems} colorScheme="teal" />
            <div className="flex-1 flex flex-col">
                <Header role="Staff" />
                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default StaffLayout
