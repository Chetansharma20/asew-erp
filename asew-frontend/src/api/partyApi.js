import axiosInstance from '../component/utils/axiosInstance';

// Create new party
export const createParty = async (partyData) => {
    try {
        const response = await axiosInstance.post(`/parties/createparty`, partyData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get all parties
export const getAllParties = async (params) => {
    try {
        const response = await axiosInstance.get(`/parties/getallparties`, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get party by ID
export const getPartyById = async (id) => {
    try {
        const response = await axiosInstance.get(`/parties/getpartybyid/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update party
export const updateParty = async (id, updateData) => {
    try {
        const response = await axiosInstance.patch(`/parties/updateparty/${id}`, updateData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Delete party
export const deleteParty = async (id) => {
    try {
        const response = await axiosInstance.delete(`/parties/deleteparty/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
