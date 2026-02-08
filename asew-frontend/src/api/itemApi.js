import axiosInstance from '../component/utils/axiosInstance';

// Create new item
export const createItem = async (itemData) => {
    try {
        const response = await axiosInstance.post(`/items/createitem`, itemData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get all items
export const getAllItems = async (params) => {
    try {
        const response = await axiosInstance.get(`/items/getallitems`, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get item by ID
export const getItemById = async (id) => {
    try {
        const response = await axiosInstance.get(`/items/getitembyid/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update item
export const updateItem = async (id, updateData) => {
    try {
        const response = await axiosInstance.patch(`/items/updateitem/${id}`, updateData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Delete item
export const deleteItem = async (id) => {
    try {
        const response = await axiosInstance.delete(`/items/deleteitem/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
