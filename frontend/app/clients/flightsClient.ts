import axios from 'axios';
import { API_ENDPOINTS } from '~/constants/api';
import { showToast } from '~/utils/toastUtils';

export const getAllFlights = async (params?: { from?: string; to?: string; startDate?: string; endDate?: string }) => {
    try {
        const filteredParams: { [key: string]: string } = {};
        if (params) {
            for (const key in params) {
                if (params[key]) {
                    filteredParams[key] = params[key] as string;
                }
            }
        }

        const config = Object.keys(filteredParams).length ? { params: filteredParams } : {};
        const response = await axios.get(API_ENDPOINTS.FLIGHTS.ALL, config);

        return response.data;
    } catch (error) {
        showToast('Error fetching flights', 'error');

        throw error;
    }
};
