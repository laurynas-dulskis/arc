export const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE: `${API_BASE_URL}/auth`,
  },
  FLIGHTS: {
    ALL: `${API_BASE_URL}/flights`,
    PAGES: `${API_BASE_URL}/flights/pages`,
    ALL_ALL: `${API_BASE_URL}/flights/all`,
  },
  USERS: {
    ALL: `${API_BASE_URL}/users`,
    SIGNUP: `${API_BASE_URL}/users/signup`,
  },
  RESERVATIONS: {
    ALL: `${API_BASE_URL}/reservations`,
    MY: `${API_BASE_URL}/reservations/my`,
  },
  PAYMENTS: {
    ALL: `${API_BASE_URL}/payments`,
  },
  BOARDING: {
    ALL: `${API_BASE_URL}/boarding/all`,
  },
  HISTORY: {
    MY: `${API_BASE_URL}/history/my`,
  },
  REPORTS: {
    GENERATE: `${API_BASE_URL}/reports`,
  },
} as const;
