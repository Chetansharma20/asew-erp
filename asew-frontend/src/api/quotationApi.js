import axiosInstance from '../component/utils/axiosInstance';

// Create quotation
export const createQuotation = async (quotationData) => {
    try {
        const response = await axiosInstance.post(`/quotations/createquotation`, quotationData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get all quotations
export const getAllQuotations = async (params = {}) => {
    try {
        const response = await axiosInstance.get(`/quotations/get-all-quotations`, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get quotations by lead
export const getQuotationsByLead = async (leadId) => {
    try {
        const response = await axiosInstance.get(`/quotations/getquotationsbylead/${leadId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get quotation by ID
export const getQuotationById = async (id) => {
    try {
        const response = await axiosInstance.get(`/quotations/getquotationbyid/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Send quotation email
export const sendQuotationEmail = async (id) => {
    try {
        const response = await axiosInstance.post(`/quotations/sendquotationemail/${id}`, {});
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update quotation status
export const updateQuotationStatus = async (id, status, remark) => {
    try {
        const response = await axiosInstance.patch(`/quotations/updatequotationstatus/${id}`, { status, remark });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update quotation details
export const updateQuotation = async (id, quotationData) => {
    try {
        const response = await axiosInstance.put(`/quotations/updatequotation/${id}`, quotationData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
