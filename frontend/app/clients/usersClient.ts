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
