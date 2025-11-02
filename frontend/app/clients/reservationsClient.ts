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

export const reserveSeats = async ({ flightId, economy, business, firstClass }: { flightId: number; economy: number; business: number; firstClass: number }) => {
    try {
        const response = await axios.post(API_ENDPOINTS.RESERVATIONS.ALL, {
            flightId: flightId,
            selectedEconomy: economy,
            selectedBusiness: business,
            selectedFirstClass: firstClass
        }, {
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};
