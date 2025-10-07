import {showToast} from "~/utils/toastUtils";
import {logout} from "~/utils/authUtils";

// @ts-ignore
export function handleBackendError(error, customMessage = null) {
    console.error("Failed: ", error);

    if (
        error.status === 401
        || error.status === 403
    ){
        logout();

        return;
    }

    if(customMessage !== null){
        showToast(customMessage, "error");

        return;
    }

    if (error.response.data.error !== undefined) {
        showToast(error.response.data.error, "error");

        return;
    }

    showToast("An unexpected error occurred. Please try again later.", "error");
}