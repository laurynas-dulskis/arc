import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    toast(message, {
        position: 'bottom-right',
        type,
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
}