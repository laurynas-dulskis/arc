import axios from "axios";
import { API_ENDPOINTS } from "~/constants/api";
import { handleBackendError } from "~/utils/errorUtils";

export const getUserInfo = async (userId: string) => {
    try {
        const response = await axios.get(`${API_ENDPOINTS.USERS.SIGNUP}/${userId}`, {
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};

export const updateUserInfo = async (userId: string, userData: any) => {
    try {
        const response = await axios.put(`${API_ENDPOINTS.USERS.SIGNUP}/${userId}`, userData, {
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};

export const adminGetAllUsers = async (page?: number) => {
    try {
        const config: any = { withCredentials: true };
        if (page && page > 0) {
            config.params = { page };
        }
        const response = await axios.get(API_ENDPOINTS.USERS.ALL, config);

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};

export const adminGetAllUsersPagesCount = async () => {
    try {
        const response = await axios.get(`${API_ENDPOINTS.USERS.ALL}/pages`, {
            withCredentials: true,
        });

        return response.data.pages;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};

export const adminUpdateUser = async (userId: string, userData: any) => {
    try {
        const response = await axios.put(`${API_ENDPOINTS.USERS.ALL}/${userId}`, userData, {
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};

export const adminDeleteUser = async (userId: string) => {
    try {
        const response = await axios.delete(`${API_ENDPOINTS.USERS.ALL}/${userId}`, {
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};
