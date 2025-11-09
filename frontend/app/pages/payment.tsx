import React from "react";
import { generatePath, useNavigate } from "react-router";
import { getFlightById } from "~/clients/flightsClient";
import { informAboutPayment } from "~/clients/paymentClient";
import { getMyReservations, reserveSeats } from "~/clients/reservationsClient";
import Button from "~/components/button";
import Spinner from "~/components/spinner";
import { ROUTES } from "~/constants/routes";
import { showToast } from "~/utils/toastUtils";


export function PaymentPage() {

    React.useEffect(() => {
        console.log('PaymentPage loaded');
        try {
            if (typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                const sessionId = params.get('session_id');

                console.log('Session ID:', sessionId);

                    if (sessionId) {
                        const url = new URL(window.location.href);
                        url.searchParams.delete('session_id');
                        window.history.replaceState({}, document.title, url.toString());

                        informAboutPayment(sessionId).then(() => {
                            showToast("Payment successful!", "success");

                            window.location.href = ROUTES.RESERVATIONS;
                        }).catch((err) => {
                            console.error(err);

                            showToast("Failed to process payment result", "error");
                        });
                    }else {
                        window.location.href = ROUTES.HOME;
                    }
                }
            } catch (e) {
                console.error('Failed to read query parameters', e);

                showToast("Failed to process payment result", "error");
            }
    }, []);

    return (
        <div className="flex flex-col items-center bg-gray-50 min-h-screen pt-8 pb-6 text-gray-700">
            <Spinner />
        </div>
    );
}

export default PaymentPage;