import React from "react";
import { redirect } from "react-router";
import { getFlightById } from "~/clients/flightsClient";
import {
    cancelReservation,
    confirmAndPay,
    getReservationById,    
} from "~/clients/reservationsClient";
import Button from "~/components/button";
import ConfirmationModal from "~/components/confirmationModal";
import Spinner from "~/components/spinner";
import UserNavigationHeader from "~/components/userNavigationHeader";
import type { Reservation } from "~/model/reservation";
import type { ReservationInfo } from "~/model/reservationInfo";
import { showToast } from "~/utils/toastUtils";

export function ReservationsDetailsPage() {
    const [isFetchingReservation, setIsFetchingReservation] = React.useState(true);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [reservation, setReservation] = React.useState<ReservationInfo | null>(null);
    const [windowOpen, setWindowOpen] = React.useState(false);

    React.useEffect(() => {
        setIsFetchingReservation(true);
        const segments = window.location.pathname.split("/").filter(Boolean);
        const id = segments[segments.length - 1];
        if (!id) return;

        getReservationById(id)
            .then((data: ReservationInfo) => {
                if (!data) {
                    showToast("No reservation found", "info");
                } else {
                    setReservation(data);
                }
            })
            .catch((err) => {
                console.error(err);
                showToast("Failed to load reservation", "error");
            })
            .finally(() => {
                setIsFetchingReservation(false);
            });
    }, []);

    const flightHasHappened = React.useMemo(() => {
        if (!reservation) return false;
        const dep = new Date(reservation.departureTime);
        return dep.getTime() <= Date.now();
    }, [reservation]);

    const canModify =
        !!reservation && reservation.status === "Reserved" && !flightHasHappened;

    const todayStr = React.useMemo(() => new Date().toISOString().split("T")[0], []);

    const allPassengersFilled = React.useMemo(() => {
        if (!reservation) return false;
        return reservation.tickets.every((t) => {
            const name = t.passengerName?.trim();
            if (!name) return false;
            // only letters and spaces
            if (!/^[A-Za-z\s]+$/.test(name)) return false;
            if (!t.passengerDob) return false;
            // dob must not be in the future
            const dob = new Date(t.passengerDob);
            if (isNaN(dob.getTime())) return false;
            if (dob.getTime() > Date.now()) return false;
            return true;
        });
    }, [reservation]);

    function updateTicket(ticketId: number, patch: Partial<{ passengerName: string; passengerDob: string }>) {
        if (!reservation) return;
        setReservation({
            ...reservation,
            tickets: reservation.tickets.map((t) =>
                t.id === ticketId ? { ...t, ...patch } : t
            ),
        });
    }

    async function handlePay() {
        if (!reservation) return;
        if (!canModify) {
            showToast("Cannot pay for this reservation. It is either not reserved or flight has already happened.", "warning");
            return;
        }
        if (!allPassengersFilled) {
            showToast("Please fill in all passenger names and valid dates of birth before paying.", "info");
            return;
        }

        setIsProcessing(true);
        try {
            let paymentResult = await confirmAndPay(reservation.id, reservation.tickets);

            window.location.href = paymentResult.paymentUrl;
        } catch (err) {
            console.error(err);
            showToast("Payment failed", "error");
        } finally {
            setIsProcessing(false);
        }
    }

    async function handleCancel() {
        if (!reservation) return;
        if (!canModify) {
            showToast("Cannot cancel this reservation.", "warning");
            return;
        }

        setIsProcessing(true);
        try {
            await cancelReservation(reservation.id);

            showToast("Reservation cancelled", "success");
            window.location.href = "/reservations";
        } catch (err) {
            console.error(err);
            showToast("Failed to cancel reservation", "error");
        } finally {
            setIsProcessing(false);
        }
    }

    if (isFetchingReservation) {
        return (
            <div className="flex flex-col items-center bg-gray-50 min-h-screen pt-8 pb-6">
                <UserNavigationHeader />
                <Spinner />
            </div>
        );
    }

    if (!reservation) {
        return (
            <div className="flex flex-col items-center bg-gray-50 min-h-screen pt-8 pb-6 text-gray-700">
                <UserNavigationHeader />
                <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
                    <p>No reservation found.</p>
                </div>
            </div>
        );
    }

    const totalPrice = reservation.tickets.reduce((s, t) => s + (t.price || 0), 0);

    return (
        <div className="flex flex-col items-center bg-gray-50 min-h-screen pt-8 pb-6 text-gray-700">
            <UserNavigationHeader />
            <div className="w-full max-w-6xl bg-white shadow-md rounded-lg overflow-hidden p-6 space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-semibold">Reservation #{reservation.id}</h2>
                        <p className="text-sm text-gray-600">Status: {reservation.status}</p>
                        <p className="text-sm text-gray-600">Created: {new Date(reservation.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-600 font-bold text-2xl">Route: {reservation.route}</p>
                        <p className="text-sm text-gray-600">Flight: {reservation.flightNumber}</p>
                        <p className="text-sm text-gray-600">Departure: {new Date(reservation.departureTime).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Arrival: {new Date(reservation.arrivalTime).toLocaleString()}</p>
                        {reservation.status === "Reserved" ? <p className="text-sm text-gray-600">Reservation expires: {new Date(reservation.reservationExpiryTime).toLocaleString()}</p> : null}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-2">Tickets</h3>
                    <div className="space-y-4">
                        {reservation.tickets.map((t) => {
                            const nameVal = t.passengerName ?? "";
                            const dobVal = t.passengerDob ?? "";
                            const nameInvalid = !nameVal.trim() || !/^[A-Za-z\s]+$/.test(nameVal.trim());
                            const dobInvalid = !dobVal || isNaN(new Date(dobVal).getTime()) || new Date(dobVal).getTime() > Date.now();

                            return (
                                <div key={t.id} className="border rounded p-4 bg-gray-50">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <p className="text-sm font-medium">Ticket #{t.id} — {t.class}</p>
                                            <p className="text-sm text-gray-600">Price: {t.price / 100} €</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-600">Passenger name</label>
                                            <input
                                                type="text"
                                                value={nameVal}
                                                onChange={(e) => {
                                                    const sanitized = e.target.value.replace(/[^A-Za-z\s]/g, "");
                                                    updateTicket(t.id, { passengerName: sanitized });
                                                }}
                                                disabled={!canModify || isProcessing}
                                                className="mt-1 block w-full border rounded px-2 py-1"
                                                placeholder="Full name"
                                            />
                                            {nameInvalid && (
                                                <p className="text-xs text-red-600 mt-1">Only letters and spaces are allowed, and the name cannot be empty.</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-600">Passenger date of birth</label>
                                            {(() => {
                                                // Normalize various ISO / datetime formats to YYYY-MM-DD for <input type="date" />
                                                const dateForInput = (() => {
                                                    if (!dobVal) return "";
                                                    const m = dobVal.match(/^(\d{4}-\d{2}-\d{2})/);
                                                    if (m) return m[1];
                                                    const d = new Date(dobVal);
                                                    if (isNaN(d.getTime())) return "";
                                                    const yyyy = d.getFullYear();
                                                    const mm = String(d.getMonth() + 1).padStart(2, "0");
                                                    const dd = String(d.getDate()).padStart(2, "0");
                                                    return `${yyyy}-${mm}-${dd}`;
                                                })();

                                                return (
                                                    <input
                                                        type="date"
                                                        value={dateForInput}
                                                        onChange={(e) => updateTicket(t.id, { passengerDob: e.target.value })}
                                                        disabled={!canModify || isProcessing}
                                                        className="mt-1 block w-full border rounded px-2 py-1"
                                                        max={todayStr}
                                                    />
                                                );
                                            })()}
                                            {dobInvalid && (
                                                <p className="text-xs text-red-600 mt-1">Please enter a valid date of birth.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-lg font-semibold">Total: {totalPrice / 100} €</p>
                        {flightHasHappened && <p className="text-sm text-red-600">This flight has already departed — you cannot modify or pay for this reservation.</p>}
                        {!flightHasHappened && reservation.status !== "Reserved" && <p className="text-sm text-gray-600">Reservation is {reservation.status} — actions are disabled.</p>}
                    </div>

                    <div className="flex gap-3">
                        <Button 
                        onClick={() => setWindowOpen(true)} 
                        disabled={!canModify || isProcessing} 
                        color="bg-red-600" 
                        text={isProcessing ? "Processing..." : "Cancel reservation"} 
                        />
                        <Button 
                        onClick={handlePay} 
                        disabled={!canModify || !allPassengersFilled || isProcessing} 
                        color="bg-green-600" 
                        text={isProcessing ? "Processing..." : "Pay & Confirm"} 
                        />
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={windowOpen}
                onConfirm={handleCancel}
                onCancel={() => {
                    setWindowOpen(false);
                }}
                title="Confirm Cancellation"
                message="Are you sure you want to cancel this flight?"
                isLoading={isProcessing}
            />
        </div>
    );
}

export default ReservationsDetailsPage;