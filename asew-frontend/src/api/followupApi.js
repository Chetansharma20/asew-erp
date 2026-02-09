import axiosInstance from '../component/utils/axiosInstance';

// Create follow-up
export const createFollowup = async (data) => {
    try {
        const response = await axiosInstance.post(`/followups/createfollowup`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get follow-ups by lead
export const getFollowupsByLead = async (leadId) => {
    try {
        const response = await axiosInstance.get(`/followups/lead/${leadId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get upcoming follow-ups
export const getUpcomingFollowups = async (salesPersonId) => {
    try {
        // Note: The backend controller handles salesPersonId filtering based on the logged-in user's role/ID if they are STAFF.
        // If we need to pass a specific salesPersonId (e.g., for Admin to filter), we might need to adjust the backend or pass it as a query param if supported.
        // Based on current backend implementation: "const salesPersonId = req.user.role === "STAFF" ? req.user._id : null;"
        // It seems it auto-detects for STAFF, but maybe Admin sees all?
        // Let's pass it as a param just in case the backend supports it or we update it later.
        const params = salesPersonId ? { salesPersonId } : {};
        const response = await axiosInstance.get(`/followups/upcoming`, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update follow-up
export const updateFollowup = async (id, data) => {
    try {
        const response = await axiosInstance.patch(`/followups/updatefollowup/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
