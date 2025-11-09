import axios from "axios";
import { API_ENDPOINTS } from "~/constants/api";
import { handleBackendError } from "~/utils/errorUtils";

export const informAboutPayment = async (id: string | number) => {
    try {
        const response = await axios.post(`${API_ENDPOINTS.PAYMENTS.ALL}/${id}`, {}, {
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};