import axios from "axios";
import { API_ENDPOINTS } from "~/constants/api";
import { handleBackendError } from "~/utils/errorUtils";

export const getBoardingPasses = async (id: string) => {
    try {
        const response = await axios.get(`${API_ENDPOINTS.BOARDING.ALL}/${id}`, {
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};