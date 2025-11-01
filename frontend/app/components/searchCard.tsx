import React from "react";
import Button from "./button";
import { showToast } from "../utils/toastUtils";
import { Range } from "react-range";
import {FlightClass} from "~/constants/class";

interface SearchCardProps {
    searchParams: {
        from: string;
        to: string;
        dateFrom: string;
        dateTo: string;
        page: number;
        class: string;
        seatCount: number;
        priceRange: string;
        sort: string;
    };
    setSearchParams: React.Dispatch<React.SetStateAction<any>>;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    handleSearch: () => void;
    isFetchingFlights: boolean;
    maxPrice: number;
}

const SearchCard: React.FC<SearchCardProps> = ({ searchParams, setSearchParams, handleSearch, isFetchingFlights, setCurrentPage, maxPrice }) => {
    const priceRange = searchParams.priceRange ? searchParams.priceRange.split("-").map(Number) : [0, maxPrice];

    return (
        <div className="mt-6 w-full max-w-5xl bg-white rounded-xl shadow border border-gray-200 p-4">
            <div className="flex flex-wrap gap-3 justify-between">
                <div className="flex flex-col flex-1">
                    <label htmlFor="fromInput" className="mb-1 text-gray-700 text-sm font-medium">From</label>
                    <input
                        id="fromInput"
                        type="text"
                        placeholder="From"
                        className="px-3 py-2 border rounded-md bg-white text-gray-700"
                        value={searchParams.from}
                        onChange={(e) => {
                            const value = e.target.value.toUpperCase();
                            if (/^[A-Z]{0,3}$/.test(value)) {
                                setSearchParams({ ...searchParams, from: value, page: 1 });
                            }
                        }}
                    />
                </div>
                <div className="flex flex-col flex-1">
                    <label htmlFor="toInput" className="mb-1 text-gray-700 text-sm font-medium">Where to?</label>
                    <input
                        id="toInput"
                        type="text"
                        placeholder="Where to?"
                        className="px-3 py-2 border rounded-md bg-white text-gray-700"
                        value={searchParams.to}
                        onChange={(e) => {
                            const value = e.target.value.toUpperCase();
                            if (/^[A-Z]{0,3}$/.test(value)) {
                                setSearchParams({ ...searchParams, to: value, page: 1 });
                            }
                        }}
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="dateFromInput" className="mb-1 text-gray-700 text-sm font-medium">Departure Date From</label>
                    <input
                        id="dateFromInput"
                        type="date"
                        className="px-3 py-2 border rounded-md bg-white text-gray-700"
                        value={searchParams.dateFrom}
                        onChange={(e) => {
                            if (searchParams.dateTo && e.target.value > searchParams.dateTo) {
                                showToast("Departure date cannot be after arrival date", "error");
                                return;
                            }
                            setSearchParams({ ...searchParams, dateFrom: e.target.value, page: 1 });
                        }}
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="dateToInput" className="mb-1 text-gray-700 text-sm font-medium">Arrival Date To</label>
                    <input
                        id="dateToInput"
                        type="date"
                        className="px-3 py-2 border rounded-md bg-white text-gray-700"
                        value={searchParams.dateTo}
                        onChange={(e) => {
                            if (searchParams.dateFrom && e.target.value < searchParams.dateFrom) {
                                showToast("Arrival date cannot be before departure date", "error");
                                return;
                            }
                            setSearchParams({ ...searchParams, dateTo: e.target.value, page: 1 });
                        }}
                    />
                </div>
                <div className="flex items-end">
                    <Button
                        text="Search"
                        color="bg-blue-600"
                        onClick={()  => {
                            setCurrentPage(1);
                            handleSearch();
                        }}
                        disabled={isFetchingFlights}
                    />
                </div>
            </div>
            <div className="flex flex-wrap gap-5 justify-between mt-4">
                <div className="flex flex-col flex-1">
                    <label htmlFor="classInput" className="mb-1 text-gray-700 text-sm font-medium">Class</label>
                    <select
                        id="classInput"
                        className="px-3 py-2 border rounded-md bg-white text-gray-700"
                        value={searchParams.class || ""}
                        onChange={(e) => setSearchParams({ ...searchParams, class: e.target.value, page: 1 })}
                    >
                        <option value="">Select Class</option>
                        <option value={FlightClass.Economy}>{FlightClass.Economy}</option>
                        <option value={FlightClass.Business}>{FlightClass.Business}</option>
                        <option value={FlightClass.First}>{FlightClass.First}</option>
                    </select>
                </div>
                <div className="flex flex-col flex-1">
                    <label htmlFor="seatCountInput" className="mb-1 text-gray-700 text-sm font-medium">Available Seats</label>
                    <input
                        id="seatCountInput"
                        type="number"
                        placeholder="Seats"
                        className="px-3 py-2 border rounded-md bg-white text-gray-700"
                        value={searchParams.seatCount || ""}
                        onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (!isNaN(value) && value >= 0 && value <= 1000) {
                                setSearchParams({ ...searchParams, seatCount: value, page: 1 });
                            }
                        }}
                    />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="sortInput" className="mb-1 text-gray-700 text-sm font-medium">Sort</label>
                    <select
                        id="sortInput"
                        className="px-3 py-2 border rounded-md bg-white text-gray-700"
                        value={searchParams.sort || ""}
                        onChange={(e) => setSearchParams({ ...searchParams, sort: e.target.value, page: 1 })}
                    >
                        <option value="">None</option>
                        <option value="cheapest">Cheapest at the top</option>
                        <option value="most_expensive">Most Expensive at the top</option>
                    </select>
                </div>

                <div className="flex flex-col flex-1">
                    <label htmlFor="priceRangeInput" className="mb-1 text-gray-700 text-sm font-medium">Price Range</label>
                    <Range
                        step={10}
                        min={0}
                        max={maxPrice}
                        values={priceRange}
                        onChange={(values) => {
                            setSearchParams({ ...searchParams, priceRange: `${values[0]}-${values[1]}`, page: 1 });
                        }}
                        renderTrack={({ props, children }) => {
                            const [min, max] = priceRange;
                            const denom = maxPrice || 1000;
                            return (
                                <div
                                    {...props}
                                    className="h-2 bg-gray-300 rounded-md relative"
                                    style={{ ...props.style, height: "6px", background: "#ddd" }}
                                >
                                    <div
                                        className="absolute h-full bg-blue-600 rounded-md"
                                        style={{
                                            left: `${((min - 0) / (denom - 0)) * 100}%`,
                                            right: `${100 - ((max - 0) / (denom - 0)) * 100}%`,
                                        }}
                                    />
                                    {children}
                                </div>
                            );
                        }}
                        renderThumb={({ props }) => (
                            <div
                                {...props}
                                className="w-4 h-4 bg-blue-600 rounded-full"
                                style={{ ...props.style }}
                            />
                        )}
                    />
                    <div className="flex justify-between text-sm text-gray-700 mt-2">
                        <span>€{priceRange[0]}</span>
                        <span>€{priceRange[1]}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchCard;
