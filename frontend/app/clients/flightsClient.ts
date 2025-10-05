import axios from 'axios';
import { API_ENDPOINTS } from '~/constants/api';
import { showToast } from '~/utils/toastUtils';

export const getAllFlights = async () => {
    try {
        const response = await axios.get(API_ENDPOINTS.FLIGHTS.ALL);

        return response.data;
    } catch (error) {
        showToast('Error fetching flights', 'error');

        throw error;
    }
};