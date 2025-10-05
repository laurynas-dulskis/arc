import React from "react";
import { API_ENDPOINTS } from "../constants/api";

export function Home() {
    const [isSigningIn, setIsSigningIn] = React.useState(false);
    const handleGoogleSignIn = async () => {
        setIsSigningIn(true); // Disable the button
        try {
            window.location.href = API_ENDPOINTS.AUTH.GOOGLE;
        } catch (error) {
            console.error('Error during Google sign-in', error);
        } finally {
            setIsSigningIn(false);
        }
    };

    return (
        <main className="flex flex-col items-center bg-gray-50 min-h-screen pt-12 pb-6">
            {/* Hero Section */}
            <header className="flex flex-col items-center w-full px-6">
                {/* Sign In Button */}
                <div className="w-full max-w-5xl flex justify-end mb-4">
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isSigningIn}
                        className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-black ${
                            isSigningIn ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign in with Google
                    </button>
                </div>

                <h1 className="text-4xl font-bold text-gray-800">Flights</h1>

                {/* Search Box */}
                <div className="mt-6 w-full max-w-5xl bg-white rounded-xl shadow border border-gray-200 p-4">
                    <div className="flex flex-wrap gap-3 justify-between">
                        <select className="px-3 py-2 border rounded-md bg-white text-gray-700">
                            <option>Round trip</option>
                            <option>One way</option>
                            <option>Multi-city</option>
                        </select>

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

                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                            Explore
                        </button>
                    </div>
                </div>
            </header>

            {/* Results Section */}
            <section className="flex flex-col items-start w-full max-w-5xl mt-10 px-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Find cheap flights from Lithuania to anywhere
                </h2>

                <div className="flex gap-2 mb-6">
                    <button className="px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                        Vilnius
                    </button>
                    <button className="px-4 py-1 rounded-full bg-gray-200 text-gray-700">
                        Kaunas
                    </button>
                    <button className="px-4 py-1 rounded-full bg-gray-200 text-gray-700">
                        Palanga
                    </button>
                </div>

                {/* Flight Cards */}
                <div className="grid md:grid-cols-3 gap-4 w-full">
                    <div className="border border-gray-200 bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
                        <p className="font-semibold text-gray-800">Vilnius to Riga</p>
                        <p className="text-gray-600 text-sm">6 Nov – 12 Nov • Non-stop</p>
                        <p className="mt-2 text-gray-800 font-bold">from €53</p>
                    </div>

                    <div className="border border-gray-200 bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
                        <p className="font-semibold text-gray-800">Vilnius to Kraków</p>
                        <p className="text-gray-600 text-sm">24 Nov – 1 Dec • Non-stop</p>
                        <p className="mt-2 text-gray-800 font-bold">from €40</p>
                    </div>

                    <div className="border border-gray-200 bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
                        <p className="font-semibold text-gray-800">Vilnius to Tel Aviv-Yafo</p>
                        <p className="text-gray-600 text-sm">14 Nov – 23 Nov • Non-stop</p>
                        <p className="mt-2 text-gray-800 font-bold">from €74</p>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Home;
