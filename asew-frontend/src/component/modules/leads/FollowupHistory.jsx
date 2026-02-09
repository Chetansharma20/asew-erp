import React, { useState, useEffect } from 'react';
import * as followupApi from '../../../api/followupApi';

const FollowupHistory = ({ leadId, onClose }) => {
    const [followups, setFollowups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newFollowup, setNewFollowup] = useState({
        remarks: '',
        nextFollowupDate: '',
        orderStatus: 'FOLLOW_UP'
    });

    useEffect(() => {
        if (leadId) {
            fetchFollowups();
        }
    }, [leadId]);

    const fetchFollowups = async () => {
        try {
            setIsLoading(true);
            const response = await followupApi.getFollowupsByLead(leadId);
            setFollowups(response.data || []);
        } catch (error) {
            console.error("Error fetching follow-ups:", error);
            // Optionally handle error state
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewFollowup({ ...newFollowup, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // In followupApi.js, createFollowup takes (data) where data must include leadId.
            // Wait, looking at my created file: 
            // export const createFollowup = async (data) => { ... axiosInstance.post(..., data); ... }
            // Only takes one arg. So I must include leadId in the object.

            // Wait, I might have misremembered what I wrote in the implementation plan vs what I decided.
            // In step 52, I wrote: export const createFollowup = async (data) => { ... }
            // So I need to pass { ...newFollowup, leadId }

            await followupApi.createFollowup({ ...newFollowup, leadId });
            setNewFollowup({ remarks: '', nextFollowupDate: '', orderStatus: 'FOLLOW_UP' });
            fetchFollowups();
        } catch (error) {
            alert(error.message || "Failed to add follow-up");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xl font-bold text-gray-900">Follow-up History</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-4">
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">Loading history...</div>
                    ) : followups.length > 0 ? (
                        followups.map((followup) => (
                            <div key={followup._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {new Date(followup.followupDate).toLocaleDateString()} at {new Date(followup.followupDate).toLocaleTimeString()}
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${followup.orderStatus === 'ORDER_WON' ? 'bg-green-100 text-green-800' :
                                        followup.orderStatus === 'ORDER_LOSS' ? 'bg-red-100 text-red-800' :
                                            followup.orderStatus === 'PRECLOSED' ? 'bg-purple-100 text-purple-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {followup.orderStatus === 'ORDER_WON' ? 'CONVERTED' :
                                            followup.orderStatus === 'ORDER_LOSS' ? 'LOST' :
                                                followup.orderStatus.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-gray-700 text-sm mb-2">{followup.remarks}</p>
                                <div className="text-xs text-blue-600 font-medium">
                                    Next Follow-up: {new Date(followup.nextFollowupDate).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            No follow-up history found.
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Add New Follow-up</h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="orderStatus"
                                    value={newFollowup.orderStatus}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="FOLLOW_UP">Follow Up</option>
                                    <option value="PRECLOSED">Pre-Closed</option>
                                    <option value="ORDER_LOSS">Lost</option>
                                    <option value="ORDER_WON">Converted</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Next Follow-up Date</label>
                                <input
                                    type="date"
                                    name="nextFollowupDate"
                                    required
                                    value={newFollowup.nextFollowupDate.split('T')[0]} // Handle date format
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
                            <textarea
                                name="remarks"
                                required
                                rows="2"
                                value={newFollowup.remarks}
                                onChange={handleInputChange}
                                placeholder="Enter discussion details..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Submit Follow-up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FollowupHistory;
