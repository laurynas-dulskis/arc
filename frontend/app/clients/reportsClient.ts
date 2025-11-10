import axios from "axios";
import { API_ENDPOINTS } from "~/constants/api";
import { handleBackendError } from "~/utils/errorUtils";

export const postGenerateReport = async (data: {
    reportType: string;
    fromDate: string;
    toDate: string;
}) => {
    try {
        const response = await axios.post(`${API_ENDPOINTS.REPORTS.GENERATE}`, {
            flightsFrom: data.fromDate,
            flightsTo: data.toDate,
            reportType: data.reportType,
        }, {
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        handleBackendError(error);

        throw error;
    }
};
