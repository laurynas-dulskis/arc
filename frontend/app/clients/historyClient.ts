import axios from "axios";
import { API_ENDPOINTS } from "~/constants/api";
import { handleBackendError } from "~/utils/errorUtils";

export const getMyHistory = async (page?: number) => {
    try {
        const config: any = { withCredentials: true };
        if (page && page > 0) {
            config.params = { page };
        }
        const response = await axios.get(API_ENDPOINTS.HISTORY.MY, config);

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};

export const getMyHistoryPagesCount = async () => {
    try {
        const response = await axios.get(`${API_ENDPOINTS.HISTORY.MY}/pages`, {
            withCredentials: true,
        });

        console.log("Pages count response:", response.data);

        return response.data.pages;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};