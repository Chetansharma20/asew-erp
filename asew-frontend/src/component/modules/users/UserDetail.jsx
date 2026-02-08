
import React, { useEffect, useState } from 'react';
import { getUserById } from '../../../api/userApi';

const UserDetail = ({ userId, onClose }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                const response = await getUserById(userId);
                setUser(response.data);
            } catch (err) {
                setError('Failed to fetch user details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    if (!userId) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
            <div
                className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">👤</span> User Profile
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-medium">Loading user details...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
                            <p className="text-red-600 font-medium">{error}</p>
                            <button
                                onClick={onClose}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    ) : user ? (
                        <div className="space-y-6">
                            {/* User Avatar & Basic Info */}
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl text-blue-600 font-bold border-2 border-blue-50">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-800">{user.name}</h4>
                                    <p className="text-slate-500 font-medium flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        {user.role} • {user.isActive ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <DetailItem label="Email Address" value={user.email} icon="✉️" />
                                <DetailItem label="Phone Number" value={user.phone || 'Not provided'} icon="📱" />
                                <DetailItem label="Current Role" value={user.role} icon="🛡️" />
                                <DetailItem label="Account Status" value={user.isActive ? 'Active' : 'Inactive'} icon="⚡" />
                                <DetailItem label="Created On" value={new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })} icon="📅" />
                                <DetailItem label="User ID" value={user._id} icon="🆔" fullWidth />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-slate-500">User not found.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-all shadow-sm"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ label, value, icon, fullWidth }) => (
    <div className={`${fullWidth ? 'md:col-span-2' : ''} space-y-1`}>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
        <div className="flex items-center gap-2 text-slate-700 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-lg opacity-70">{icon}</span>
            <span className="truncate">{value}</span>
        </div>
    </div>
);

export default UserDetail;
