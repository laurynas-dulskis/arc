import React from "react";
import FlightCard from "./flightCard";
import Spinner from "./spinner";
import type { Flight } from "../model/flight";

interface FlightsListProps {
    flights: Flight[];
    isFetchingFlights: boolean;
    numberOfPages: number;
    currentPage: number;
    changePage: (page: number) => void;
}

const FlightsList: React.FC<FlightsListProps> = ({ flights, isFetchingFlights, numberOfPages, currentPage, changePage }) => {
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
                        {flights.map((flight) => (
                            <FlightCard
                                route={`${flight.origin} to ${flight.destination}`}
                                dates={`${flight.departureTime} – ${flight.arrivalTime}`}
                                price={`€${(flight.basePriceCents / 100).toFixed(2)}`}
                                duration={`Flight duration: ${(flight.durationMinutes / 60).toFixed(1)} hours`}
                                seatsAvailable={flight.seatsAvailable}
                                seatsTotal={flight.seatsTotal}
                            />
                        ))}
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