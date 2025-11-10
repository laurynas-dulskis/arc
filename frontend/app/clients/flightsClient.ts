import axios from 'axios';
import { API_ENDPOINTS } from '~/constants/api';
import { handleBackendError } from '~/utils/errorUtils';
import { showToast } from '~/utils/toastUtils';
import type { FlightSearchParams } from "../model/searchParams";

export const getAllFlights = async (params?: Partial<FlightSearchParams>) => {
    try {
        const filteredParams: { [key: string]: string | number } = {};
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                if (value) {
                    filteredParams[key] = value;
                }
            }
        }

        const config = Object.keys(filteredParams).length ? { params: filteredParams } : {};
        const response = await axios.get(API_ENDPOINTS.FLIGHTS.ALL, config);

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};

export const getAllFlightsAll = async () => {
    try {
        const response = await axios.get(API_ENDPOINTS.FLIGHTS.ALL_ALL, {
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};

export const getFlightById = async (id: string | number) => {
    try {
        const response = await axios.get(`${API_ENDPOINTS.FLIGHTS.ALL}/${id}`, {
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};

export const getAllFlightsPagesCount = async (params?: Partial<FlightSearchParams>) => {
    try {
        const filteredParams: { [key: string]: string | number } = {};
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                if (value) {
                    filteredParams[key] = value;
                }
            }
        }

        const config = Object.keys(filteredParams).length ? { params: filteredParams } : {};
        const response = await axios.get(API_ENDPOINTS.FLIGHTS.PAGES, config);

        return response.data.pages;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};

export const adminUpdateFlight = async (flightId: string, flightData: any) => {
    try {
        const response = await axios.put(`${API_ENDPOINTS.FLIGHTS.ALL}/${flightId}`, flightData, {
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};

export const adminDeleteFlight = async (flightId: string) => {
    try {
        const response = await axios.delete(`${API_ENDPOINTS.FLIGHTS.ALL}/${flightId}`, {
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};

export const adminCreateFlight = async (flightData: any) => {
    try {
        const response = await axios.post(API_ENDPOINTS.FLIGHTS.ALL, flightData, {
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};
