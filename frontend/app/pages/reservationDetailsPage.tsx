import React from "react";
import { redirect } from "react-router";
import { getFlightById } from "~/clients/flightsClient";
import {
    cancelReservation,
    confirmAndPay,
    getReservationById,    
} from "~/clients/reservationsClient";
import Button from "~/components/button";
import { getUnavailableSeats } from "~/clients/seatsClient";
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
    const [selectedSeats, setSelectedSeats] = React.useState<Record<number, { row: number | null; letter: string | null }>>({});
    const [seatPickerTicketId, setSeatPickerTicketId] = React.useState<number | null>(null);
    const [seatPickerTemp, setSeatPickerTemp] = React.useState<{ row: number | null; letter: string | null } | null>(null);
    const [backendTakenSeats, setBackendTakenSeats] = React.useState<string[]>([]);
    const [isLoadingSeats, setIsLoadingSeats] = React.useState(false);

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
                    // Ensure default values for optional frontend-managed fields
                    const normalized = {
                        ...data,
                        tickets: data.tickets.map((t: any) => ({
                            ...t,
                            seat: typeof t.seat === 'string' ? t.seat : null,
                            extraBags: Number.isFinite(t.extraBags) ? t.extraBags : 0,
                        })),
                    } as ReservationInfo;
                    setReservation(normalized);
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

    React.useEffect(() => {
        async function fetchSeats() {
            if (!reservation) return;

            const flightIdCandidate = reservation.id;
            setIsLoadingSeats(true);
            try {
                const taken = await getUnavailableSeats(flightIdCandidate);
                if (Array.isArray(taken)) {
                    const cleaned = taken
                        .map((s) => String(s).toUpperCase())
                        .filter((s) => /^([1-9]|[12]\d|3[01])[A-F]$/.test(s));
                    setBackendTakenSeats(cleaned);
                }
            } catch (e) {
                // Non-fatal; keep local selection logic.
                console.warn('Failed fetching backend taken seats', e);
            } finally {
                setIsLoadingSeats(false);
            }
        }
        fetchSeats();
    }, [reservation]);

    const flightHasHappened = React.useMemo(() => {
        if (!reservation) return false;
        const dep = new Date(reservation.departureTime);
        return dep.getTime() <= Date.now();
    }, [reservation]);

    const canModify =
        !!reservation && reservation.status === "Reserved" && !flightHasHappened;

    const todayStr = React.useMemo(() => new Date().toISOString().split("T")[0], []);
    const seatLetters = React.useMemo(() => ["A", "B", "C", "D", "E", "F"], []);
    const seatRows = React.useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);

    const selectedSeatCount = React.useMemo(() => {
        if (!reservation) return 0;
        return reservation.tickets.reduce((acc, t) => {
            const s = selectedSeats[t.id];
            const hasLocal = !!(s && s.row && s.letter);
            const persistedSeat = (t as any).seat ? String((t as any).seat).toUpperCase() : null;
            const hasPersisted = !hasLocal && !!(persistedSeat && /^([1-9]|[12]\d|3[01])[A-F]$/.test(persistedSeat));
            return acc + (hasLocal || hasPersisted ? 1 : 0);
        }, 0);
    }, [reservation, selectedSeats]);

    const seatSelectionValid = React.useMemo(() => {
        if (!reservation) return true;
        return reservation.tickets.every((t) => {
            const s = selectedSeats[t.id];
            if (!s) return true;
            const hasRow = !!s.row;
            const hasLetter = !!s.letter;
            return (hasRow && hasLetter) || (!hasRow && !hasLetter);
        });
    }, [reservation, selectedSeats]);

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

    function updateSeat(ticketId: number, patch: Partial<{ row: number | null; letter: string | null }>) {
        setSelectedSeats((prev) => ({
            ...prev,
            [ticketId]: { row: prev[ticketId]?.row ?? null, letter: prev[ticketId]?.letter ?? null, ...patch },
        }));
    }

    function openSeatPicker(ticketId: number) {
        setSeatPickerTicketId(ticketId);
        const current = selectedSeats[ticketId] ?? { row: null, letter: null };
        setSeatPickerTemp({ ...current });
    }

    function closeSeatPicker() {
        setSeatPickerTicketId(null);
        setSeatPickerTemp(null);
    }

    function confirmSeatPicker() {
        if (seatPickerTicketId == null || !seatPickerTemp) return;
        // Prevent selecting a seat already chosen by another ticket
        if (seatPickerTemp.row && seatPickerTemp.letter && isSeatTaken(seatPickerTemp.row, seatPickerTemp.letter, seatPickerTicketId)) {
            showToast("This seat is already selected for another ticket. Please choose a different one.", "info");
            return;
        }
        updateSeat(seatPickerTicketId, { row: seatPickerTemp.row ?? null, letter: seatPickerTemp.letter ?? null });
        // Also reflect seat code in reservation.tickets for payload convenience
        if (reservation) {
            const code = seatPickerTemp.row && seatPickerTemp.letter ? `${seatPickerTemp.row}${seatPickerTemp.letter}` : null;
            setReservation({
                ...reservation,
                tickets: reservation.tickets.map((t) => t.id === seatPickerTicketId ? { ...t, seat: code } : t),
            });
        }
        closeSeatPicker();
    }

    function clearSeat(ticketId: number) {
        updateSeat(ticketId, { row: null, letter: null });
        if (reservation) {
            setReservation({
                ...reservation,
                tickets: reservation.tickets.map((t) => t.id === ticketId ? { ...t, seat: null } : t),
            });
        }
    }

    function isSeatTaken(row: number, letter: string, excludeTicketId?: number): boolean {
        for (const [tidStr, seat] of Object.entries(selectedSeats)) {
            const tid = Number(tidStr);
            if (excludeTicketId && tid === excludeTicketId) continue;
            if (seat && seat.row === row && seat.letter === letter) return true;
        }
        // Include backend taken seats with code like "12C"
        const code = `${row}${String(letter).toUpperCase()}`;
        if (backendTakenSeats.includes(code)) return true;
        return false;
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
        if (!seatSelectionValid) {
            showToast("Please complete seat selection: choose both row and letter, or clear the selection.", "info");
            return;
        }

        setIsProcessing(true);
        try {
            // Enrich tickets with seat from selectedSeats if needed and ensure extraBags defaults
            const enriched = reservation.tickets.map((t: any) => {
                const s = selectedSeats[t.id];
                const seatCode = s && s.row && s.letter ? `${s.row}${s.letter}` : (typeof t.seat === 'string' ? t.seat : null);
                return {
                    ...t,
                    seat: seatCode,
                    extraBags: Number.isFinite(t.extraBags) ? t.extraBags : 0,
                };
            });

            let paymentResult = await confirmAndPay(reservation.id, enriched);

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
    const seatFeePerSelectionCents = 2500;
    const extraSeatFeesCents = selectedSeatCount * seatFeePerSelectionCents;
    const grandTotalCents = totalPrice + extraSeatFeesCents;

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
                            const seat = selectedSeats[t.id] ?? { row: null, letter: null };
                            const seatFromPicker = seat.letter && seat.row ? `${seat.row}${seat.letter}` : null;
                            const persistedSeat = t.seat ? String(t.seat).toUpperCase() : null;
                            const seatLabel = seatFromPicker ?? persistedSeat;
                            const seatInvalid = (seat.row && !seat.letter) || (!seat.row && seat.letter);

                            return (
                                <div key={t.id} className="border rounded p-4 bg-gray-50">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <p className="text-sm font-medium">Ticket #{t.id} — {t.class}{seatLabel ? ` — Seat: ${seatLabel} (+25 €)` : ""}</p>
                                            <p className="text-sm text-gray-600">Price: {t.price / 100} €</p>
                                        </div>
                                    </div>

                                    {/* Row 1: Passenger info */}
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

                                    {/* Row 2: Seat and extra bags (optional) */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                        <div>
                                            <label className="block text-xs text-gray-600">Seat (optional)</label>
                                            <div className="mt-1 flex items-center gap-3">
                                                <Button
                                                    onClick={() => openSeatPicker(t.id)}
                                                    disabled={!canModify || isProcessing}
                                                    color="bg-blue-600"
                                                    text={seatLabel ? "Change seat" : "Choose seat"}
                                                />
                                                {seatLabel && (
                                                    <>
                                                        <span className="text-sm">Selected: <span className="font-medium">{seatLabel}</span></span>
                                                        <button
                                                            type="button"
                                                            onClick={() => clearSeat(t.id)}
                                                            className="text-xs text-red-600 underline"
                                                            disabled={!canModify || isProcessing}
                                                        >
                                                            Remove
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Choosing a seat costs <span className="font-semibold">+25 €</span>. Use the picker to select A–F and 1–31. Selected seat fees are included in the total.
                                                {isLoadingSeats && (<span className="ml-1">(Loading taken seats...)</span>)}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-600">Extra bags (optional)</label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={5}
                                                value={Number.isFinite((t as any).extraBags) ? (t as any).extraBags : 0}
                                                onChange={(e) => {
                                                    const value = Math.max(0, Math.min(5, Number(e.target.value) || 0));
                                                    updateTicket(t.id, { /* type-cast in setter below */ } as any);
                                                    if (reservation) {
                                                        setReservation({
                                                            ...reservation,
                                                            tickets: reservation.tickets.map((tk) => tk.id === t.id ? { ...tk, extraBags: value } : tk),
                                                        });
                                                    }
                                                }}
                                                disabled={!canModify || isProcessing}
                                                className="mt-1 block w-full border rounded px-2 py-1"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Optional. +30 € per extra bag. Not included in the total shown here.</p>
                                        </div>

                                        <div className="hidden md:block" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-lg font-semibold">Total: {grandTotalCents / 100} €</p>
                        {selectedSeatCount > 0 && (
                            <p className="text-xs text-gray-600">Includes seat selection: +{(extraSeatFeesCents / 100).toFixed(2)} € ({selectedSeatCount} × 25 €)</p>
                        )}
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
                        disabled={!canModify || !allPassengersFilled || !seatSelectionValid || isProcessing} 
                        color="bg-green-600" 
                        text={isProcessing ? "Processing..." : "Pay & Confirm"} 
                        />
                    </div>
                </div>
            </div>

            <SeatPickerModal
                isOpen={seatPickerTicketId !== null}
                onClose={closeSeatPicker}
                onConfirm={confirmSeatPicker}
                seatLetters={seatLetters}
                seatRows={seatRows}
                value={seatPickerTemp ?? { row: null, letter: null }}
                setValue={(v) => setSeatPickerTemp(v)}
                isSeatDisabled={(r, l) => isSeatTaken(r, l, seatPickerTicketId ?? undefined)}
            />

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

function SeatPickerModal({
    isOpen,
    onClose,
    onConfirm,
    seatLetters,
    seatRows,
    value,
    setValue,
    isSeatDisabled,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    seatLetters: string[];
    seatRows: number[];
    value: { row: number | null; letter: string | null } | null;
    setValue: (v: { row: number | null; letter: string | null }) => void;
    isSeatDisabled?: (row: number, letter: string) => boolean;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded shadow-lg p-4 w-full max-w-3xl max-h-[80vh] overflow-hidden">
                <h4 className="text-lg font-semibold mb-2">Choose your seat</h4>
                <div className="border rounded overflow-auto max-h-[60vh]">
                    <table className="min-w-full text-sm">
                        <thead className="sticky top-0 bg-gray-100">
                            <tr>
                                <th className="p-2 text-left">Row</th>
                                {seatLetters.map((l) => (
                                    <th key={l} className="p-2 text-center">{l}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {seatRows.map((r) => (
                                <tr key={r} className="odd:bg-white even:bg-gray-50">
                                    <td className="p-2 font-medium">{r}</td>
                                    {seatLetters.map((l) => {
                                        const selected = value?.row === r && value?.letter === l;
                                        const disabled = isSeatDisabled ? isSeatDisabled(r, l) : false;
                                        return (
                                            <td key={l} className="p-1">
                                                <button
                                                    type="button"
                                                    disabled={disabled}
                                                    onClick={() => !disabled && setValue({ row: r, letter: l })}
                                                    className={`w-full py-2 rounded border ${disabled ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-blue-50 border-gray-300'}`}
                                                >
                                                    {r}{l}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-3 flex justify-between items-center">
                    <div className="text-xs text-gray-600">Seat selection costs <span className="font-semibold">+25 €</span>.</div>
                    <div className="flex gap-2">
                        <button type="button" className="px-3 py-2 rounded border border-gray-300" onClick={onClose}>Cancel</button>
                        <button
                            type="button"
                            className="px-3 py-2 rounded border border-red-500 text-red-600"
                            onClick={() => setValue({ row: null, letter: null })}
                        >
                            Clear seat
                        </button>
                        <button type="button" className="px-3 py-2 rounded bg-blue-600 text-white" onClick={onConfirm}>Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReservationsDetailsPage;