import axios from "axios";
import { API_ENDPOINTS } from "~/constants/api";
import { handleBackendError } from "~/utils/errorUtils";

export const getUnavailableSeats = async (id: string | number) => {
    try {
        const response = await axios.get(`${API_ENDPOINTS.FLIGHTS.ALL}/seats/${id}`, {
            withCredentials: true
        });

        return response.data.takenSeats;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};