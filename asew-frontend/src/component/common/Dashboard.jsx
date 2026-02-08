import React, { useEffect, useState } from 'react'
import * as leadApi from '../../api/leadApi'
import { getUserStats } from '../../api/userApi'

const Dashboard = ({ role }) => {
    const [stats, setStats] = useState({ staffCount: 0, subAdminCount: 0 });
    const [leadStats, setLeadStats] = useState({ totalLeads: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                if (role === 'Admin (Owner)' || role === 'Sub Admin') {
                    const [userData, leadData] = await Promise.all([
                        getUserStats(),
                        leadApi.getLeadStats()
                    ]);
                    setStats(userData.data);
                    setLeadStats(leadData.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            }
        };
        fetchStats();
    }, [role]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">Welcome to the {role} Dashboard</h2>
                <p className="mt-2 text-gray-500 text-lg">You have successfully logged in as {role}.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(role === 'Admin (Owner)' || role === 'Sub Admin') && (
                    <>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transform hover:scale-105 transition-transform duration-200">
                            <h3 className="font-semibold text-gray-700">Total Leads</h3>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{leadStats.totalLeads}</p>
                            <p className="text-sm text-gray-400 mt-1">Acquired Leads</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transform hover:scale-105 transition-transform duration-200">
                            <h3 className="font-semibold text-gray-700">Total Staff</h3>
                            <p className="text-3xl font-bold text-green-600 mt-2">{stats.staffCount || 0}</p>
                            <p className="text-sm text-gray-400 mt-1">Active Staff Members</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transform hover:scale-105 transition-transform duration-200">
                            <h3 className="font-semibold text-gray-700">Total Sub Admins</h3>
                            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.subAdminCount || 0}</p>
                            <p className="text-sm text-gray-400 mt-1">Active Sub Admins</p>
                        </div>
                    </>
                )}
            </div>


        </div>
    )
}

export default Dashboard
