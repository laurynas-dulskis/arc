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

export const getMyReservations = async (page?: number) => {
    try {
        const config: any = { withCredentials: true };
        if (page && page > 0) {
            config.params = { page };
        }
        const response = await axios.get(API_ENDPOINTS.RESERVATIONS.MY, config);

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};

export const getMyReservationsPagesCount = async () => {
    try {
        const response = await axios.get(`${API_ENDPOINTS.RESERVATIONS.MY}/pages`, {
            withCredentials: true,
        });

        return response.data.pages;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};

export const getReservationById = async (id: string | number) => {
    try {
        const response = await axios.get(`${API_ENDPOINTS.RESERVATIONS.ALL}/${id}`, {
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};

export const cancelReservation = async (id: string | number) => {
    try {
        const response = await axios.delete(`${API_ENDPOINTS.RESERVATIONS.ALL}/${id}`, {
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};

export const confirmAndPay = async (id: string | number, tickets: any[]) => {
    try {
        const payload = tickets.map((ticket: any) => ({
            ticketId: ticket.id,
            passengerName: ticket.passengerName,
            passengerDob: ticket.passengerDob
        }));

        const response = await axios.post(`${API_ENDPOINTS.RESERVATIONS.ALL}/${id}/confirm`, payload, {
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};
