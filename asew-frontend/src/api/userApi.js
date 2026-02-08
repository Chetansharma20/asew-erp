
import axiosInstance from "../component/utils/axiosInstance";

export const login = async (data) => {
    const response = await axiosInstance.post('/users/login', data);
    return response.data;
};

export const registerUser = async (data) => {
    const response = await axiosInstance.post('/users/register', data);
    return response.data;
};

export const getAllUsers = async (params) => {
    const response = await axiosInstance.get('/users/get-all-users', { params });
    return response.data;
};

export const getUserById = async (id) => {
    const response = await axiosInstance.get(`/users/get-user-by-id/${id}`);
    return response.data;
};

export const updateUser = async (id, data) => {
    const response = await axiosInstance.patch(`/users/update-user-by-id/${id}`, data);
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await axiosInstance.delete(`/users/delete-user-by-id/${id}`);
    return response.data;
};

export const getUserStats = async () => {
    const response = await axiosInstance.get('/users/get-user-stats');
    return response.data;
};
