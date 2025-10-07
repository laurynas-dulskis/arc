import React from "react";
import {ensureAdminAccess} from "~/utils/authUtils";
import AdminNavigationHeader from "~/components/adminNavigationHeader";
import { adminGetAllReservations } from "~/clients/reservationsClient";
import type { Reservation } from "~/model/reservation";
import { showToast } from "~/utils/toastUtils";
import Spinner from "~/components/spinner";

export function Reservations() {
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [reservations, setReservations] = React.useState<Reservation[]>([]);
    const [isLoading, setLoading] = React.useState(true);

    React.useEffect(() => {
            setIsAdmin(ensureAdminAccess());
    
            adminGetAllReservations()
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
                    setLoading(false);
                });
        }, []);

    return (
        <div className="flex flex-col items-center bg-gray-50 min-h-screen pt-8 pb-6">
            <AdminNavigationHeader/>
            {isAdmin ?  <h1 className="text-4xl font-bold text-gray-800 pb-10">Admin Reservation Panel</h1> : null}

            {isLoading ? (
                <Spinner/>
            ) : (
                <div className="w-full max-w-6xl bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-2 text-left text-gray-700">Id</th>
                            <th className="px-4 py-2 text-left text-gray-700">Status</th>
                            <th className="px-4 py-2 text-left text-gray-700">Created At</th>
                            <th className="px-4 py-2 text-left text-gray-700">User</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reservations.map((reservation, index) => (
                            <tr key={index} className="border-t">
                                <td className="px-4 py-2 text-gray-700">
                                    {reservation.id}
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
                                    {reservation.user}
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


export default Reservations;