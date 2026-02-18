import React from 'react'
import { useNavigate } from 'react-router-dom'

const Header = ({ role }) => {
    const navigate = useNavigate()

    const handleLogout = () => {
        // In a real app, clear tokens here
        navigate('/login')
    }

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">ERP</h1>
                <span className="h-4 w-px bg-gray-200"></span>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{role}</span>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                >
                    Logout
                </button>
            </div>
        </header>
    )
}

export default Header
