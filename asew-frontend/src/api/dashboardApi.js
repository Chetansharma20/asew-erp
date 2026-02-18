import axiosInstance from "../component/utils/axiosInstance";

export const getDashboardStats = async () => {
    const response = await axiosInstance.get('/dashboard/stats');
    return response.data;
};

export const getLeadStatistics = async (params) => {
    const response = await axiosInstance.get('/dashboard/leads', { params });
    return response.data;
};

export const getSalesMetrics = async (params) => {
    const response = await axiosInstance.get('/dashboard/sales', { params });
    return response.data;
};

export const getOrderDashboard = async (params) => {
    const response = await axiosInstance.get('/dashboard/orders', { params });
    return response.data;
};

export const getFollowupReminders = async () => {
    const response = await axiosInstance.get('/dashboard/reminders');
    return response.data;
};
