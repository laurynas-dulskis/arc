import React from "react";

export function Home() {
    return (
        <main className="flex flex-col items-center bg-gray-50 min-h-screen pt-12 pb-6">
            {/* Hero Section */}
            <header className="flex flex-col items-center w-full px-6">
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
