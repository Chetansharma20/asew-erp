import axiosInstance from '../component/utils/axiosInstance';

// Create new item (supports image upload via FormData)
export const createItem = async (itemData) => {
    try {
        const formData = new FormData();
        formData.append('name', itemData.name);
        formData.append('description', itemData.description);
        formData.append('basePrice', itemData.basePrice);
        if (itemData.isActive !== undefined) formData.append('isActive', itemData.isActive);
        if (itemData.imageFile) formData.append('image', itemData.imageFile);

        const response = await axiosInstance.post(`/items/createitem`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
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

// Update item (supports image upload via FormData)
export const updateItem = async (id, updateData) => {
    try {
        const formData = new FormData();
        if (updateData.name) formData.append('name', updateData.name);
        if (updateData.description) formData.append('description', updateData.description);
        if (updateData.basePrice) formData.append('basePrice', updateData.basePrice);
        if (updateData.isActive !== undefined) formData.append('isActive', updateData.isActive);
        if (updateData.imageFile) formData.append('image', updateData.imageFile);

        const response = await axiosInstance.patch(`/items/updateitem/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
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
