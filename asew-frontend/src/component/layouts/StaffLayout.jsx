import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../common/Sidebar'
import Header from '../common/Header'

const StaffLayout = () => {
    const menuItems = [
        { label: 'Dashboard', path: '/staff/dashboard', icon: '📊' },
        { label: 'Leads', path: '/staff/leads', icon: '👥' },
        { label: 'Quotations', path: '/staff/quotations', icon: '📝' },
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
