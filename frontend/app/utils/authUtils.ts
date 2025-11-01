import Cookies from 'js-cookie';
import { UserRoles } from '../constants/userRoles';
import { API_ENDPOINTS } from '~/constants/api';
import { showToast } from './toastUtils';
import { ROUTES } from '~/constants/routes';

export function signInWithGoogle() {
    window.location.href = API_ENDPOINTS.AUTH.GOOGLE;
} 

export interface AccessToken {
    sub: string;
    email: string;
    name: string;
    surname: string;
    role: string;
    signupCompleted: boolean;
    iat: number;
    exp: number;
}

export function getAccessTokenData(redirect = true): AccessToken | null {
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

        const parsedData = JSON.parse(jsonPayload);

        if (!parsedData.signupCompleted && redirect) {
            window.location.href = ROUTES.COMPLETE_SIGNUP;

            return null;
        }

        return parsedData as AccessToken;
    } catch (error) {
        console.error('Failed to parse access token:', error);
        showToast("Failed to retrieve user information", "error");

        return null;
    }
}

export function logout() {
    Cookies.remove('access_token');

    window.location.href = ROUTES.HOME;
}

export function isLoggedIn(): boolean {
    return getAccessTokenData() !== null;
}

export function isAdmin(): boolean {
    return getAccessTokenData()?.role === UserRoles.ADMIN;
}

export function ensureAdminAccess(): boolean {
    if (!isAdmin()) {
        showToast("Access denied. Admins only.", "error");

        window.location.href = ROUTES.HOME;

        return false;
    }

    return true;
}

export function ensureLoggedIn(): boolean {
    if (!isLoggedIn()) {
        showToast("Please log in to continue.", "error");
        window.location.href = ROUTES.HOME;
        
        return false;
    }

    return true;
}
