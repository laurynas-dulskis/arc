import React from "react";
import { generatePath, useNavigate } from "react-router";
import { getBoardingPasses } from "~/clients/boardingPassClient";
import { getFlightById } from "~/clients/flightsClient";
import { getMyReservations, reserveSeats } from "~/clients/reservationsClient";
import Button from "~/components/button";
import Spinner from "~/components/spinner";
import UserNavigationHeader from "~/components/userNavigationHeader";
import BoardingPassTicket from "~/components/boardingPassTicket";
import { ROUTES } from "~/constants/routes";
import type { BoardingPass } from "~/model/boardingPass";
import type { Reservation } from "~/model/reservation";
import { ensureAgent, isLoggedIn } from "~/utils/authUtils";
import { showToast } from "~/utils/toastUtils";


export function PassengersPage() {
    const [isFetchingBoarding, setIsFetchingBoarding] = React.useState(true);
    const [boardingPassengers, setBoardingPassengers] = React.useState<BoardingPass[]>([]);

    React.useEffect(() => {
        ensureAgent();
        setIsFetchingBoarding(true);

        const segments = window.location.pathname.split("/").filter(Boolean);
        const id = segments[segments.length - 1];
        if (!id) return;

        getBoardingPasses(id)
            .then((data: BoardingPass[]) => {
                if (data.length === 0) {
                    showToast("No passengers found", "info");
                }

                setBoardingPassengers(data);
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                setIsFetchingBoarding(false);
            });
    }, []);

    return (
        <div className="flex flex-col items-center bg-gray-50 min-h-screen pt-8 pb-6 text-gray-700">
            <UserNavigationHeader />
            {isFetchingBoarding ? (
                <Spinner/>
            ) : (
                <div className="w-full max-w-6xl flex flex-col gap-8 py-8 items-center">
                   {boardingPassengers.length === 0 ? (
                        <p className="text-gray-600 text-xl px-6 text-center">No passengers found.</p>
                    ) : 
                    <div className="w-full max-w-6xl bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-2 text-left text-gray-700">PNR</th>
                            <th className="px-4 py-2 text-left text-gray-700">Passenger Name</th>
                            <th className="px-4 py-2 text-left text-gray-700">Seat</th>
                        </tr>
                        </thead>
                        <tbody>
                        {boardingPassengers.map((boardingPass, index) => (
                            <tr key={index} className="border-t">
                                <td className="px-4 py-2 text-gray-700">
                                    {boardingPass.pnr}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {boardingPass.passengerName}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {boardingPass.seat}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                    }
                </div>
            )}
        </div>
    );
}

export default PassengersPage;