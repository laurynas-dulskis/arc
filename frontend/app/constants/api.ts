export const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE: `${API_BASE_URL}/auth`,
  },
  FLIGHTS: {
    ALL: `${API_BASE_URL}/flights`,
  },
} as const;
