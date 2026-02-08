import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../common/Sidebar'
import Header from '../common/Header'

const SuperAdminLayout = () => {
    const menuItems = [
        { label: 'Dashboard', path: '/super-admin/dashboard', icon: '📊' },
        { label: 'Users', path: '/super-admin/users', icon: '👥' },
        { label: 'Orders', path: '/super-admin/orders', icon: '📦' },
        { label: 'Quotations', path: '/super-admin/quotations', icon: '📝' },
    ]


    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar menuItems={menuItems} colorScheme="indigo" />
            <div className="flex-1 flex flex-col">
                <Header role="Super Admin" />
                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default SuperAdminLayout
