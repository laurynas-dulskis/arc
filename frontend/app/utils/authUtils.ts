import Cookies from 'js-cookie';
import { UserRoles } from '../constants/userRoles';
import { API_ENDPOINTS } from '~/constants/api';

export function signInWithGoogle() {
    window.location.href = API_ENDPOINTS.AUTH.GOOGLE;
} 

export function getAccessTokenData(): any | null {
    const token = Cookies.get('access_token');

    if (!token) {
        return null;
    }

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to parse access token:', error);
        return null;
    }
}

export function clearAccessToken() {
    Cookies.remove('access_token');

    window.location.reload();
}

export function isAdmin(): boolean {
    return getAccessTokenData()?.role === UserRoles.ADMIN;
}