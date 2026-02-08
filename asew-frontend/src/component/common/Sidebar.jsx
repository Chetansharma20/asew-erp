import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = ({ menuItems, colorScheme }) => {
    const location = useLocation()

    const colors = {
        indigo: {
            sidebar: 'bg-indigo-900',
            text: 'text-indigo-100',
            active: 'bg-indigo-800 text-white',
            hover: 'hover:bg-indigo-800 hover:text-white'
        },
        blue: {
            sidebar: 'bg-slate-900',
            text: 'text-slate-300',
            active: 'bg-blue-600 text-white',
            hover: 'hover:bg-slate-800 hover:text-white'
        },
        teal: {
            sidebar: 'bg-teal-900',
            text: 'text-teal-100',
            active: 'bg-teal-800 text-white',
            hover: 'hover:bg-teal-800 hover:text-white'
        },
        purple: {
            sidebar: 'bg-purple-900',
            text: 'text-purple-100',
            active: 'bg-purple-800 text-white',
            hover: 'hover:bg-purple-800 hover:text-white'
        }
    }

    const activeScheme = colors[colorScheme] || colors.blue

    return (
        <aside className={`w-64 min-h-screen ${activeScheme.sidebar} ${activeScheme.text} flex flex-col transition-all duration-300`}>
            <div className="p-6">
                <div className="flex items-center gap-2 mb-8">
                    <div className={`w-8 h-8 rounded-lg ${activeScheme.active} flex items-center justify-center font-bold`}>
                        A
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">ASEW</span>
                </div>

                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname.includes(item.path)
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? activeScheme.active : activeScheme.hover
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-white/10">
                <p className="text-xs text-white/50">© 2024 ASEW Management</p>
            </div>
        </aside>
    )
}

export default Sidebar
