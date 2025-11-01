import React from "react";
import { useNavigate, generatePath } from "react-router";
import FlightCard from "./flightCard";
import Spinner from "./spinner";
import type { Flight } from "../model/flight";
import { isLoggedIn } from "~/utils/authUtils";
import { showToast } from "~/utils/toastUtils";
import { ROUTES } from "~/constants/routes";

interface FlightsListProps {
    flights: Flight[];
    isFetchingFlights: boolean;
    numberOfPages: number;
    currentPage: number;
    changePage: (page: number) => void;
}

const FlightsList: React.FC<FlightsListProps> = ({ flights, isFetchingFlights, numberOfPages, currentPage, changePage }) => {
    const formatPrice = (cents?: number) =>
        cents !== undefined ? `€${(cents / 100).toFixed(2)}` : "N/A";

    const navigate = useNavigate();

    const handleCardClick = (flight: Flight) => {
        if (!isLoggedIn()) {
            showToast("Please log in to view flight details.", "info");

            return;
        }

        navigate(
            generatePath(ROUTES.FLIGHT, { id: String(flight.id) })
        );
    };

    return (
        <section className="flex flex-col items-start w-full max-w-5xl mt-10 px-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Available Flights
            </h2>

            {isFetchingFlights ? (
                <div className="flex justify-center items-center w-full">
                    <Spinner />
                </div>
            ) : (
                <>
                    <div className="grid md:grid-cols-3 gap-4 w-full">
                        {flights.map((flight) => {
                            const seatsAvailable =
                                (flight.seatsAvailableEconomy ?? 0) +
                                (flight.seatsAvailableBusiness ?? 0) +
                                (flight.seatsAvailableFirstClass ?? 0);

                            const seatsTotal =
                                (flight.seatsEconomy ?? 0) +
                                (flight.seatsBusiness ?? 0) +
                                (flight.seatsFirstClass ?? 0);

                            const priceCents = [
                                flight.basePriceCentsEconomy,
                                flight.basePriceCentsBusiness,
                                flight.basePriceCentsFirstClass,
                            ].filter((p): p is number => p !== undefined);

                            let priceLabel: string;
                            if (priceCents.length === 0) {
                                priceLabel = "Price: N/A";
                            } else {
                                const min = Math.min(...priceCents);
                                const max = Math.max(...priceCents);
                                priceLabel = `From ${formatPrice(min)} — To ${formatPrice(max)}`;
                            }

                            const durationHours = (flight.durationMinutes / 60).toFixed(1);

                            return (
                                <div
                                    key={flight.id}
                                    className="cursor-pointer"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleCardClick(flight)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            handleCardClick(flight);
                                        }
                                    }}
                                >
                                    <FlightCard
                                        route={`${flight.origin} → ${flight.destination}`}
                                        dates={`${flight.departureTime} – ${flight.arrivalTime}`}
                                        price={priceLabel}
                                        duration={`Duration: ${durationHours}h • ${flight.numberOfLayovers} layover(s)`}
                                        seatsAvailable={seatsAvailable}
                                        seatsTotal={seatsTotal}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-between items-center w-full mt-6">
                        <button
                            className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
                            onClick={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="text-gray-700">
                            Page {currentPage} of {numberOfPages}
                        </span>
                        <button
                            className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
                            onClick={() => changePage(currentPage + 1)}
                            disabled={currentPage === numberOfPages || numberOfPages === 0}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </section>
    );
};

export default FlightsList;