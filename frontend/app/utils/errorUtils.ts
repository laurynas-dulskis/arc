import {showToast} from "~/utils/toastUtils";
import {logout} from "~/utils/authUtils";

// @ts-ignore
export function handleBackendError(error) {
    console.error("Failed: ", error);

    if (error.status === 401 || error.status === 403){
        logout();

        return;
    }

    if (error.data.error !== undefined) {
        showToast(error.data.error, "error");
    }else{
        showToast("An unexpected error occurred. Please try again later.", "error");
    }
}