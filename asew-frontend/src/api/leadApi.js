import axiosInstance from '../component/utils/axiosInstance';

// Create new lead
export const createLead = async (leadData) => {
    try {
        const response = await axiosInstance.post(`/leads/createlead`, leadData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get all leads
export const getAllLeads = async (params) => {
    try {
        const response = await axiosInstance.get(`/leads/get-all-leads`, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get lead by ID
export const getLeadById = async (id) => {
    try {
        const response = await axiosInstance.get(`/leads/get-lead-by-id/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update lead
export const updateLead = async (id, updateData) => {
    try {
        const response = await axiosInstance.patch(`/leads/updatelead/${id}`, updateData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update lead status
export const updateLeadStatus = async (id, status) => {
    try {
        const response = await axiosInstance.patch(`/leads/update-status/${id}`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Review lead
export const reviewLead = async (id, data) => {
    try {
        const response = await axiosInstance.patch(`/leads/review/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Assign sales person
export const assignSalesPerson = async (id, data) => {
    try {
        const response = await axiosInstance.patch(`/leads/assign/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Delete lead
export const deleteLead = async (id) => {
    try {
        const response = await axiosInstance.delete(`/leads/deletelead/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get lead stats
export const getLeadStats = async () => {
    try {
        const response = await axiosInstance.get(`/leads/stats`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
