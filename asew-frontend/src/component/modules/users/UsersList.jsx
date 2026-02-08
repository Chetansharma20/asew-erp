import React, { useEffect, useRef, useState } from 'react';
import { getAllUsers, deleteUser } from '../../../api/userApi';
import { useNavigate } from 'react-router-dom';
import UserDetail from './UserDetail';
import EditUserModal from './EditUserModal';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [editUserId, setEditUserId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const navigate = useNavigate();
    const controllerRef = useRef(null);

    const fetchUsers = async () => {
        // cancel previous request
        if (controllerRef.current) {
            controllerRef.current.abort();
        }

        controllerRef.current = new AbortController();
        setLoading(true);

        try {
            const response = await getAllUsers(
                {
                    search: searchQuery,
                    role: roleFilter
                },
                controllerRef.current.signal
            );

            setUsers(response.data || []);
            setError('');
        } catch (err) {
            if (err.name !== 'CanceledError') {
                setError('Failed to fetch users.');
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    };

    // Single debounced effect
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 250); // reduced debounce

        return () => {
            clearTimeout(timer);
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
        };
    }, [searchQuery, roleFilter]);

    const handleUserClick = (userId) => {
        setSelectedUserId(userId);
    };

    const handleEditClick = (e, userId) => {
        e.stopPropagation(); // Prevent opening detail modal
        setEditUserId(userId);
    };

    const handleCloseModal = () => {
        setSelectedUserId(null);
        setEditUserId(null);
    };

    const handleDeleteClick = async (e, userId) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await deleteUser(userId);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete user.');
        }
    };

    const handleAddUser = () => {
        const currentPath = window.location.pathname.split('/')[1];
        navigate(`/${currentPath}/register-user`);
    };

    if (error) {
        return <div className="text-center mt-10 text-red-600">{error}</div>;
    }



    return (
        <div className="container mx-auto px-4 sm:px-8">
            <div className="py-8">
                <div className="flex flex-col sm:flex-row mb-6 justify-between items-center gap-4">
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">User Management</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchUsers}
                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                            title="Refresh List"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <button
                            onClick={handleAddUser}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all transform active:scale-95"
                        >
                            <span className="text-xl">+</span> Add Member
                        </button>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-slate-700 font-medium"
                    >
                        <option value="">All Roles</option>
                        <option value="STAFF">Staff</option>
                        <option value="SUB_ADMIN">Sub Admin</option>
                    </select>
                </div>

                <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm bg-white">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    Member Details
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    Contact Info
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    System Role
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        {loading ? (
                            <tbody className="bg-white divide-y divide-slate-200">
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                                            <span className="text-slate-500 font-medium">Loading users...</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {users.map((user) => (
                                    <tr
                                        key={user._id}
                                        className="group hover:bg-blue-50/30 transition-all duration-200 cursor-pointer"
                                        onClick={() => handleUserClick(user._id)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 group-hover:scale-110 transition-transform">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${user.isActive
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={(e) => handleEditClick(e, user._id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                                                    title="Edit User"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteClick(e, user._id)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                                    title="Delete User"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleUserClick(user._id)}
                                                    className="text-blue-600 font-bold text-sm hover:text-indigo-700 hover:underline px-4 py-2 rounded-lg hover:bg-blue-100/50 transition-all"
                                                >
                                                    Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        )}
                    </table>
                </div>
            </div>


            {selectedUserId && (
                <UserDetail userId={selectedUserId} onClose={handleCloseModal} />
            )}

            {editUserId && (
                <EditUserModal
                    userId={editUserId}
                    onClose={handleCloseModal}
                    onUserUpdated={fetchUsers}
                />
            )}
        </div>
    );
};

export default UsersList;
