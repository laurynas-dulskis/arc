import axios from "axios";
import { API_ENDPOINTS } from "~/constants/api";
import { handleBackendError } from "~/utils/errorUtils";

export const getMyHistory = async () => {
    try {
        const response = await axios.get(API_ENDPOINTS.HISTORY.MY, {
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};