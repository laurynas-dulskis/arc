import React from "react";
import Button from "./button";
import { showToast } from "../utils/toastUtils";

interface SearchCardProps {
    searchParams: {
        from: string;
        to: string;
        dateFrom: string;
        dateTo: string;
    };
    setSearchParams: React.Dispatch<React.SetStateAction<any>>;
    handleSearch: () => void;
    isFetchingFlights: boolean;
}

const SearchCard: React.FC<SearchCardProps> = ({ searchParams, setSearchParams, handleSearch, isFetchingFlights }) => {
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
                                setSearchParams({ ...searchParams, from: value });
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
                                setSearchParams({ ...searchParams, to: value });
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
                            setSearchParams({ ...searchParams, dateFrom: e.target.value });
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
                            setSearchParams({ ...searchParams, dateTo: e.target.value });
                        }}
                    />
                </div>
                <div className="flex items-end">
                    <Button
                        text="Search"
                        color="bg-blue-600"
                        onClick={handleSearch}
                        disabled={isFetchingFlights}
                    />
                </div>
            </div>
        </div>
    );
};

export default SearchCard;