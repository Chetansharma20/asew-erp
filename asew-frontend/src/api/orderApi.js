import axiosInstance from '../component/utils/axiosInstance';

// Convert quotation to order
export const convertQuotationToOrder = async (quotationId) => {
    try {
        const response = await axiosInstance.post(`/orders/convert/${quotationId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get all orders
export const getAllOrders = async (params) => {
    try {
        const response = await axiosInstance.get(`/orders/getallorders`, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get order by ID
export const getOrderById = async (id) => {
    try {
        const response = await axiosInstance.get(`/orders/getorderbyid/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update order status
export const updateOrderStatus = async (id, status) => {
    try {
        const response = await axiosInstance.patch(`/orders/update-status/${id}`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Add PO to order
export const addPOToOrder = async (id, poData) => {
    try {
        const response = await axiosInstance.patch(`/orders/add-po/${id}`, poData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
