import React from "react";
import { generatePath, useNavigate } from "react-router";
import { getFlightById } from "~/clients/flightsClient";
import { getMyReservations, reserveSeats } from "~/clients/reservationsClient";
import Button from "~/components/button";
import Spinner from "~/components/spinner";
import UserNavigationHeader from "~/components/userNavigationHeader";
import { ROUTES } from "~/constants/routes";
import type { Reservation } from "~/model/reservation";
import { isLoggedIn } from "~/utils/authUtils";
import { showToast } from "~/utils/toastUtils";


export function ReservationsPage() {
    const [isFetchingReservations, setIsFetchingReservations] = React.useState(true);
    const [reservations, setReservations] = React.useState<Reservation[]>([]);

    React.useEffect(() => {
        setIsFetchingReservations(true);
        
        getMyReservations()
            .then((data: Reservation[]) => {
                if (data.length === 0) {
                    showToast("No reservations found", "info");
                }

                setReservations(data);
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                setIsFetchingReservations(false);
            });
    }, []);

    const navigate = useNavigate();

    const handleDetailsClick = (reservation: Reservation) => {
        if (!isLoggedIn()) {
            showToast("Please log in to view reservation details.", "info");

            return;
        }

        navigate(
            generatePath(ROUTES.RESERVATION_DETAILS, { id: String(reservation.id) })
        );
    };

    if (isFetchingReservations) {
        return (
            <div className="flex flex-col items-center bg-gray-50 min-h-screen pt-8 pb-6">
                <UserNavigationHeader />
                <Spinner />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center bg-gray-50 min-h-screen pt-8 pb-6 text-gray-700">
            <UserNavigationHeader />
            {isFetchingReservations ? (
                <Spinner/>
            ) : (
                <div className="w-full max-w-6xl bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-2 text-left text-gray-700">Route</th>
                            <th className="px-4 py-2 text-left text-gray-700">Status</th>
                            <th className="px-4 py-2 text-left text-gray-700">Reserved At</th>
                            <th className="px-4 py-2 text-left text-gray-700">Departure Time</th>
                            <th className="px-4 py-2 text-left text-gray-700">Arrival Time</th>
                            <th className="px-4 py-2 text-left text-gray-700">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reservations.map((reservation, index) => (
                            <tr key={index} className="border-t">
                                <td className="px-4 py-2 text-gray-700">
                                    {reservation.route}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    <span
                                        className={`inline-block rounded-full p-2 mr-2 ${
                                            reservation.status === 'Reserved' ? 'bg-yellow-500' :
                                            reservation.status === 'Paid' ? 'bg-green-500' :
                                            reservation.status === 'Cancelled' ? 'bg-red-500' : 'bg-gray-500'
                                        }`}
                                    ></span>
                                    {reservation.status}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {new Date(reservation.createdAt).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {new Date(reservation.departureTime).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {new Date(reservation.arrivalTime).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    <Button
                                    color="bg-blue-600"
                                        onClick={handleDetailsClick.bind(null, reservation)}
                                        disabled={false}
                                        text={"View Details"}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ReservationsPage;