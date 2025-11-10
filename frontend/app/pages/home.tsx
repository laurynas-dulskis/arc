import React from "react";
import HeroSection from "../components/heroSection";
import SearchCard from "../components/searchCard";
import FlightsList from "../components/flightsList";
import SearchHistory from "../components/searchHistory";
import { signInWithGoogle } from "../utils/authUtils";
import {showToast} from "../utils/toastUtils";
import {getAllFlights, getAllFlightsPagesCount} from "~/clients/flightsClient";
import type { Flight } from "~/model/flight";
import type { FlightSearchParams } from "../model/searchParams";

const STORAGE_KEY_SEARCH_PARAMS = 'flight_search_params';

const defaultSearchParams: FlightSearchParams = {
    from: '',
    to: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    class: '',
    seatCount: 0,
    priceRange: '',
    sort: '',
};

function loadSearchParamsFromStorage(): FlightSearchParams {
    try {
        if (typeof window === 'undefined') return defaultSearchParams;
        const raw = window.localStorage.getItem(STORAGE_KEY_SEARCH_PARAMS);
        if (!raw) return defaultSearchParams;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
            const merged: FlightSearchParams = {
                ...defaultSearchParams,
                ...parsed,
            };
            merged.from = (merged.from || '').toString().trim().toUpperCase().slice(0, 3);
            merged.to = (merged.to || '').toString().trim().toUpperCase().slice(0, 3);
            merged.page = Number.isFinite(merged.page) && merged.page > 0 ? merged.page : 1;
            merged.seatCount = Number.isFinite(merged.seatCount) && merged.seatCount >= 0 ? merged.seatCount : 0;
            merged.dateFrom = (merged.dateFrom || '').toString();
            merged.dateTo = (merged.dateTo || '').toString();
            merged.class = (merged.class || '').toString();
            merged.priceRange = (merged.priceRange || '').toString();
            merged.sort = (merged.sort || '').toString();
            return merged;
        }
    } catch (e) {
        console.error('Failed to parse saved search params', e);
    }
    return defaultSearchParams;
}

export function Home() {
    const [isSigningIn, setIsSigningIn] = React.useState(false);
    const [isFetchingFlights, setIsFetchingFlights] = React.useState(false);
    const [flights, setFlights] = React.useState<Flight[]>([]);
    const [numberOfPages, setNumberOfPages] = React.useState(1);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [searchParams, setSearchParams] = React.useState<FlightSearchParams>(() => loadSearchParamsFromStorage());

    const [history, setHistory] = React.useState<FlightSearchParams[]>([]);

    React.useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                const raw = window.localStorage.getItem('flight_search_history');
                if (raw) {
                    const parsed: FlightSearchParams[] = JSON.parse(raw);
                    if (Array.isArray(parsed)) setHistory(parsed);
                }
            }
        } catch (e) {
            console.error('Failed to read search history', e);
        }
    }, []);

    const persistHistory = (items: FlightSearchParams[]) => {
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem('flight_search_history', JSON.stringify(items));
            }
        } catch (e) {
            console.error('Failed to persist search history', e);
        }
    };

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

    const findOutCountOfPages = () => {
        getAllFlightsPagesCount(searchParams).then((pages) => {
            setNumberOfPages(pages)
        })
    }

    const changePage = (page: number) => {
        setSearchParams({ ...searchParams, page });
        setCurrentPage(page);
        handleSearch({ page });
    }

    const handleSearch = (overrideParams?: Partial<FlightSearchParams>) => {
        
        setIsFetchingFlights(true);

        const effectiveParams: FlightSearchParams = {
            ...searchParams,
            ...(overrideParams || {}),
        };

        
        if (!effectiveParams.page || effectiveParams.page < 1) {
            effectiveParams.page = 1;
        }

        
        if (effectiveParams.from) effectiveParams.from = effectiveParams.from.trim().toUpperCase();
        if (effectiveParams.to) effectiveParams.to = effectiveParams.to.trim().toUpperCase();

        
        if (overrideParams) {
            setSearchParams(effectiveParams);
            setCurrentPage(effectiveParams.page);
        }

        
        getAllFlightsPagesCount(effectiveParams).then((pages) => {
            setNumberOfPages(pages);
        });

        getAllFlights(effectiveParams)
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

                const keyOf = (p: FlightSearchParams) => [p.from, p.to, p.dateFrom, p.dateTo, p.class, p.seatCount, p.priceRange, p.sort].join('|');
                const newKey = keyOf(effectiveParams);
                setHistory(prev => {
                    const filtered = prev.filter(h => keyOf(h) !== newKey);
                    const next = [
                        { ...effectiveParams, page: 1 },
                        ...filtered,
                    ].slice(0, 10);
                    persistHistory(next);
                    return next;
                });
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                setIsFetchingFlights(false);
            });
    };

    const hasLoadedFromStorage = React.useRef(false);

    React.useEffect(() => {
        if (!hasLoadedFromStorage.current) return;
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(STORAGE_KEY_SEARCH_PARAMS, JSON.stringify(searchParams));
            }
        } catch (e) {
            console.error('Failed to persist search params', e);
        }
    }, [searchParams]);

    React.useEffect(() => {
        let loaded = loadSearchParamsFromStorage();
        setSearchParams(loaded);
        hasLoadedFromStorage.current = true;

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

        handleSearch({ ...loaded });
    }, []);

    const handleSelectHistory = (p: FlightSearchParams) => {
        handleSearch({ ...p, page: 1 });
    };

    const handleClearHistory = () => {
        setHistory([]);
        persistHistory([]);
    };

    return (
        <main className="bg-gray-50 min-h-screen pt-12 pb-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <aside className="lg:col-span-3 bg-white rounded-md border border-gray-200 p-4 h-[calc(100vh-6rem)] sticky top-12 overflow-hidden">
                        <SearchHistory
                            history={history}
                            onSelect={handleSelectHistory}
                            onClear={handleClearHistory}
                            isFetching={isFetchingFlights}
                        />
                    </aside>
                    <section className="lg:col-span-9 flex flex-col items-center">
                        <HeroSection isSigningIn={isSigningIn} handleGoogleSignIn={handleGoogleSignIn} />
                        <SearchCard
                            searchParams={searchParams}
                            setSearchParams={setSearchParams}
                            handleSearch={handleSearch}
                            isFetchingFlights={isFetchingFlights}
                            setCurrentPage={setCurrentPage}
                            maxPrice={1000}
                        />
                        <FlightsList
                            flights={flights}
                            isFetchingFlights={isFetchingFlights}
                            numberOfPages={numberOfPages}
                            currentPage={currentPage}
                            changePage={changePage}
                        />
                    </section>
                </div>
            </div>
        </main>
    );
}

export default Home;
