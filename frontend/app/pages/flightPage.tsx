import React from "react";
import { getFlightById } from "~/clients/flightsClient";
import { reserveSeats } from "~/clients/reservationsClient";
import Button from "~/components/button";
import Spinner from "~/components/spinner";
import UserNavigationHeader from "~/components/userNavigationHeader";
import type { Flight } from "~/model/flight";
import { ensureLoggedIn } from "~/utils/authUtils";
import { showToast } from "~/utils/toastUtils";

export function FlightPage() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [flight, setFlight] = React.useState<Flight | null>(null);
    const [isFetchingFlight, setIsFetchingFlight] = React.useState(false);

    const [selectedEconomy, setSelectedEconomy] = React.useState(0);
    const [selectedBusiness, setSelectedBusiness] = React.useState(0);
    const [selectedFirst, setSelectedFirst] = React.useState(0);

    const [errors, setErrors] = React.useState<string | null>(null);
    const [isReserving, setIsReserving] = React.useState(false);

    const fetchFlight = async () => {
        setIsFetchingFlight(true);
        setErrors(null);

        try {
            const segments = window.location.pathname.split("/").filter(Boolean);
            const id = segments[segments.length - 1];
            if (!id) return;
            const data = await getFlightById(Number(id));
            setFlight(data);

            setSelectedEconomy(0);
            setSelectedBusiness(0);
            setSelectedFirst(0);
        } catch (err) {
            showToast("Failed to fetch flight details", "error");
        } finally {
            setIsFetchingFlight(false);
        }
    };

    React.useEffect(() => {
        setIsLoggedIn(ensureLoggedIn());
        fetchFlight();
    }, []);

    const formatPrice = (cents: number) => {
        return `Euro ${(cents / 100).toFixed(2)}`;
    };

    const clamp = (value: number, min = 0, max = Infinity) =>
        Math.max(min, Math.min(max, Math.floor(isNaN(value) ? 0 : value)));

    const onChangeSeats = (
        setter: (v: number) => void,
        value: number,
        maxAvailable: number
    ) => {
        const v = clamp(value, 0, maxAvailable);
        setter(v);
    };

    const totalSelected = selectedEconomy + selectedBusiness + selectedFirst;

    const totalPriceCents =
        (selectedEconomy || 0) * (flight?.basePriceCentsEconomy || 0) +
        (selectedBusiness || 0) * (flight?.basePriceCentsBusiness || 0) +
        (selectedFirst || 0) * (flight?.basePriceCentsFirstClass || 0);

    const validateSelection = () => {
        if (!flight) return "No flight loaded.";
        if (totalSelected <= 0) return "Select at least one seat to reserve.";
        if (selectedEconomy > flight.seatsAvailableEconomy)
            return `Only ${flight.seatsAvailableEconomy} economy seat(s) available.`;
        if (selectedBusiness > flight.seatsAvailableBusiness)
            return `Only ${flight.seatsAvailableBusiness} business seat(s) available.`;
        if (selectedFirst > flight.seatsAvailableFirstClass)
            return `Only ${flight.seatsAvailableFirstClass} first class seat(s) available.`;
        return null;
    };

    const onReserve = async () => {
        setErrors(null);
        if (!isLoggedIn) {
            setErrors("You must be logged in to reserve.");
            return;
        }
        const validationError = validateSelection();
        if (validationError) {
            setErrors(validationError);
            return;
        }

        setIsReserving(true);
        try {
            await reserveSeats({ flightId: flight!.id, economy: selectedEconomy, business: selectedBusiness, firstClass: selectedFirst });

            showToast(
                `Reserved ${totalSelected} seat(s) for flight ${flight!.flightNumber}. Total: ${formatPrice(
                    totalPriceCents
                )}`,
                "success"
            );

            showToast("You have 3h to complete your payment.", "info");

            await fetchFlight();
        } catch (err) {
            showToast("Failed to reserve seats", "error");
        } finally {
            setIsReserving(false);
        }
    };

    if (isFetchingFlight) {
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
            <div className="w-full max-w-3xl bg-white shadow rounded p-6 mt-6">
                {!flight ? (
                    <div className="text-center text-gray-600">No flight selected.</div>
                ) : (
                    <>
                        <div className="mb-4">
                            <h2 className="text-2xl font-semibold">
                                Flight {flight.origin} → {flight.destination}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {flight.flightNumber} &middot; {flight.numberOfLayovers}{" "}
                                layover(s)
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <div className="text-xs text-gray-500">Departure</div>
                                <div className="font-medium">{flight.departureTime}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Arrival</div>
                                <div className="font-medium">{flight.arrivalTime}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Duration</div>
                                <div className="font-medium">
                                    {Math.floor(flight.durationMinutes / 60)}h{" "}
                                    {flight.durationMinutes % 60}m
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Total Seats</div>
                                <div className="font-medium">{flight.seatsTotal}</div>
                            </div>
                        </div>

                        <hr className="my-4" />

                        <div className="space-y-4">
                            {/* Economy */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium">Economy</div>
                                    <div className="text-xs text-gray-500">
                                        Available: {flight.seatsAvailableEconomy}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-sm font-medium">
                                        {formatPrice(flight.basePriceCentsEconomy)}
                                    </div>
                                    <input
                                        type="number"
                                        min={0}
                                        max={flight.seatsAvailableEconomy}
                                        value={selectedEconomy}
                                        onChange={(e) =>
                                            onChangeSeats(
                                                setSelectedEconomy,
                                                Number(e.target.value),
                                                flight.seatsAvailableEconomy
                                            )
                                        }
                                        className="w-20 p-2 border rounded"
                                    />
                                </div>
                            </div>

                            {/* Business */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium">Business</div>
                                    <div className="text-xs text-gray-500">
                                        Available: {flight.seatsAvailableBusiness}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-sm font-medium">
                                        {formatPrice(flight.basePriceCentsBusiness)}
                                    </div>
                                    <input
                                        type="number"
                                        min={0}
                                        max={flight.seatsAvailableBusiness}
                                        value={selectedBusiness}
                                        onChange={(e) =>
                                            onChangeSeats(
                                                setSelectedBusiness,
                                                Number(e.target.value),
                                                flight.seatsAvailableBusiness
                                            )
                                        }
                                        className="w-20 p-2 border rounded"
                                    />
                                </div>
                            </div>

                            {/* First Class */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium">First Class</div>
                                    <div className="text-xs text-gray-500">
                                        Available: {flight.seatsAvailableFirstClass}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-sm font-medium">
                                        {formatPrice(flight.basePriceCentsFirstClass)}
                                    </div>
                                    <input
                                        type="number"
                                        min={0}
                                        max={flight.seatsAvailableFirstClass}
                                        value={selectedFirst}
                                        onChange={(e) =>
                                            onChangeSeats(
                                                setSelectedFirst,
                                                Number(e.target.value),
                                                flight.seatsAvailableFirstClass
                                            )
                                        }
                                        className="w-20 p-2 border rounded"
                                    />
                                </div>
                            </div>
                        </div>

                        {errors && (
                            <div className="mt-4 text-sm text-red-600">{errors}</div>
                        )}

                        <div className="mt-6 flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-500">Selected seats</div>
                                <div className="font-medium">
                                    {totalSelected} seat(s) — {formatPrice(totalPriceCents)}
                                </div>
                                <div className="flex pt-6 items-center space-x-3">
                                    <Button
                                    color="bg-blue-600"
                                        onClick={onReserve}
                                        disabled={
                                            isReserving ||
                                            totalSelected <= 0 ||
                                            !!validateSelection() ||
                                            !isLoggedIn
                                        }
                                        text={isReserving ? "Reserving..." : "Reserve"}
                                    />
                                    <Button
                                    color="bg-blue-600"
                                        onClick={() => {
                                            setSelectedEconomy(0);
                                            setSelectedBusiness(0);
                                            setSelectedFirst(0);
                                            setErrors(null);
                                        }}
                                        text="Reset"
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default FlightPage;