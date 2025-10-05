import React from "react";
import FlightCard from "../components/flightCard";
import SignInButton from "../components/signInButton";
import Button from "../components/button";
import { 
    getAccessTokenData, 
    clearAccessToken,
    isAdmin, 
    signInWithGoogle 
} from "../utils/authUtils";
import { showToast } from "../utils/toastUtils";
import { getAllFlights } from "~/clients/flightsClient";

interface Flight {
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    durationMinutes: number;
    basePriceCents: number;
    seatsTotal: number;
    seatsAvailable: number;
}

export function Home() {
    const [isSigningIn, setIsSigningIn] = React.useState(false);
    const [flights, setFlights] = React.useState<Flight[]>([]);

    const handleGoogleSignIn = async () => {
        setIsSigningIn(true);
        try {
            signInWithGoogle();
        } catch (error) {
            showToast("Error during Google sign-in", "error");
        } finally {
            setIsSigningIn(false);
        }
    };

    React.useEffect(() => {
        getAllFlights()
            .then((data: Flight[]) => {
                const formattedFlights = data.map((flight) => ({
                    ...flight,
                    departureTime: new Date(flight.departureTime).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                    }),
                    arrivalTime: new Date(flight.arrivalTime).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                    }),
                }));

                setFlights(formattedFlights);
            })
            .catch((err) => {
                console.error(err);
                showToast("Failed to fetch flights", "error");
            });
    }, []);

    return (
        <main className="flex flex-col items-center bg-gray-50 min-h-screen pt-12 pb-6">
            {/* Hero Section */}
            <header className="flex flex-col items-center w-full px-6">
                <div className="w-full max-w-5xl flex justify-end mb-4">
                    {getAccessTokenData() !== null ? (
                        <div>
                            <div className="mb-4 text-gray-700">
                                <span className="italic">Logged in as:</span>{" "}
                                <span className="font-semibold">
                                    {getAccessTokenData()?.name} {getAccessTokenData()?.surname}
                                </span>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    text="Logout"
                                    color="bg-red-600 ml-4"
                                    onClick={clearAccessToken}
                                />
                            </div>
                            {isAdmin() ? (
                                <div className="flex justify-end mt-5">
                                    <Button
                                        text="Admin Panel"
                                        color="bg-blue-600 ml-4"
                                        onClick={() => (window.location.href = "/admin")}
                                    />
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <SignInButton isSigningIn={isSigningIn} onClick={handleGoogleSignIn} />
                    )}
                </div>

                <h1 className="text-4xl font-bold text-gray-800">Flights</h1>

                {/* Search Box */}
                <div className="mt-6 w-full max-w-5xl bg-white rounded-xl shadow border border-gray-200 p-4">
                    <div className="flex flex-wrap gap-3 justify-between">
                        <input
                            type="text"
                            placeholder="From"
                            className="flex-1 px-3 py-2 border rounded-md bg-white text-gray-700"
                            defaultValue="Vilnius"
                        />
                        <input
                            type="text"
                            placeholder="Where to?"
                            className="flex-1 px-3 py-2 border rounded-md bg-white text-gray-700"
                        />

                        <input
                            type="date"
                            className="px-3 py-2 border rounded-md bg-white text-gray-700"
                        />
                        <input
                            type="date"
                            className="px-3 py-2 border rounded-md bg-white text-gray-700"
                        />

                        <Button
                            text="Search"
                            color="bg-blue-600"
                            onClick={() => {
                                showToast("Exploring flights...", "info");
                            }}
                        />
                    </div>
                </div>
            </header>

            {/* Results Section */}
            <section className="flex flex-col items-start w-full max-w-5xl mt-10 px-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Available Flights
                </h2>

                <div className="grid md:grid-cols-3 gap-4 w-full">
                    {flights.map((flight) => (
                        <FlightCard
                            key={flight.flightNumber}
                            route={`${flight.origin} to ${flight.destination}`}
                            dates={`${flight.departureTime} – ${flight.arrivalTime}`}
                            price={`€${(flight.basePriceCents / 100).toFixed(2)}`}
                            duration={`Flight duration: ${(flight.durationMinutes / 60).toFixed(1)} hours`}
                            seatsAvailable={flight.seatsAvailable}
                            seatsTotal={flight.seatsTotal}
                        />
                    ))}
                </div>
            </section>
        </main>
    );
}

export default Home;