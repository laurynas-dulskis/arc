import axios from "axios";
import { API_ENDPOINTS } from "~/constants/api";
import { handleBackendError } from "~/utils/errorUtils";

export const adminGetAllReservations = async () => {
    try {
        const response = await axios.get(API_ENDPOINTS.RESERVATIONS.ALL, {
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};
