import React, { useEffect, useState } from 'react'
import * as leadApi from '../../api/leadApi'
import { getUserStats } from '../../api/userApi'
import * as followupApi from '../../api/followupApi'

const Dashboard = ({ role }) => {
    const [stats, setStats] = useState({ staffCount: 0, subAdminCount: 0 });
    const [leadStats, setLeadStats] = useState({ totalLeads: 0 });
    const [upcomingFollowups, setUpcomingFollowups] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Admin/SubAdmin specific stats
                if (role === 'Admin (Owner)' || role === 'Sub Admin') {
                    const [userData, leadData] = await Promise.all([
                        getUserStats(),
                        leadApi.getLeadStats()
                    ]);
                    setStats(userData.data);
                    setLeadStats(leadData.data);
                }

                // Follow-ups (Also for Staff)
                if (role === 'Admin (Owner)' || role === 'Sub Admin' || role === 'Staff') {
                    const followupsData = await followupApi.getUpcomingFollowups();
                    setUpcomingFollowups(followupsData.data || []);
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

            {/* Upcoming Follow-ups Section */}
            {(role === 'Admin (Owner)' || role === 'Sub Admin' || role === 'Staff') && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800 text-lg">Upcoming Follow-ups (Next 7 Days)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Lead</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Company</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Follow-up Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Remarks</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Assigned To</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {upcomingFollowups.length > 0 ? (
                                    upcomingFollowups.map((followup) => (
                                        <tr key={followup._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {followup.lead?.customer?.name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {followup.lead?.customer?.companyName || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-blue-600 font-medium">
                                                {new Date(followup.nextFollowupDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={followup.remarks}>
                                                {followup.remarks}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {followup.lead?.assignedTo?.name || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            No upcoming follow-ups found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


        </div>
    )
}

export default Dashboard
