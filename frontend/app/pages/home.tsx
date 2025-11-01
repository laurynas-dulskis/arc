import React from "react";
import HeroSection from "../components/heroSection";
import SearchCard from "../components/searchCard";
import FlightsList from "../components/flightsList";
import { signInWithGoogle } from "../utils/authUtils";
import {showToast} from "../utils/toastUtils";
import {getAllFlights} from "~/clients/flightsClient";
import type { Flight } from "~/model/flight";

export function Home() {
    const [isSigningIn, setIsSigningIn] = React.useState(false);
    const [isFetchingFlights, setIsFetchingFlights] = React.useState(false);
    const [flights, setFlights] = React.useState<Flight[]>([]);
    const [searchParams, setSearchParams] = React.useState({
        from: '',
        to: '',
        dateFrom: '',
        dateTo: '',
    });

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

    const handleSearch = () => {
        setIsFetchingFlights(true);

        getAllFlights(searchParams)
            .then((data: Flight[]) => {
                const formattedFlights = data.map((flight) => ({
                    ...flight,
                    departureTime: new Date(flight.departureTime.replace(' ', 'T')).toLocaleString('en-LT', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                    }),
                    arrivalTime: new Date(flight.arrivalTime.replace(' ', 'T')).toLocaleString('en-LT', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                    }),
                }));

                if (formattedFlights.length === 0) {
                    showToast("No flights found", "info");
                }

                setFlights(formattedFlights);
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                setIsFetchingFlights(false);
            });
    };

    React.useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                const error = params.get('error');

                if (error) {
                    showToast(decodeURIComponent(error), 'error');

                    const url = new URL(window.location.href);
                    url.searchParams.delete('error');
                    window.history.replaceState({}, document.title, url.toString());
                }
            }
        } catch (e) {
            console.error('Failed to read query parameters', e);
        }

        handleSearch();
    }, []);

    return (
        <main className="flex flex-col items-center bg-gray-50 min-h-screen pt-12 pb-6">
            <HeroSection isSigningIn={isSigningIn} handleGoogleSignIn={handleGoogleSignIn} />
            <SearchCard
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                handleSearch={handleSearch}
                isFetchingFlights={isFetchingFlights}
            />
            <FlightsList flights={flights} isFetchingFlights={isFetchingFlights} />
        </main>
    );
}

export default Home;
