import React, { useState } from "react";
import {ensureAdminAccess} from "~/utils/authUtils";
import Button from "~/components/button";
import AdminNavigationHeader from "~/components/adminNavigationHeader";
import { adminDeleteFlight, adminUpdateFlight, getAllFlights, adminCreateFlight } from "~/clients/flightsClient";
import { showToast } from "~/utils/toastUtils";
import type { Flight } from "~/model/flight";
import Spinner from "~/components/spinner";
import ConfirmationModal from "~/components/confirmationModal";

export function Flights() {
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [flights, setFlights] = React.useState<Flight[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [editing, setEditing] = useState<number | null>(null);
    const [errors, setErrors] = useState<Record<number, Partial<Record<keyof Flight, string>>>>({});
    const [originalFlight, setOriginalFlight] = useState<Flight | null>(null);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [windowOpen, setWindowOpen] = useState(false);
    const [adding, setAdding] = useState(false);
    const [newFlight, setNewFlight] = useState<Partial<Flight>>({ flightNumber: '', origin: '', destination: '', departureTime: '', arrivalTime: '', durationMinutes: 0, basePriceCents: 0, seatsTotal: 0, seatsAvailable: 0 });
    const [newFlightErrors, setNewFlightErrors] = useState<Partial<Record<keyof Flight, string>>>({});
    const [loadingAdd, setLoadingAdd] = useState(false);

    React.useEffect(() => {
        setIsAdmin(ensureAdminAccess());

        getAllFlights()
            .then((data: Flight[]) => {
                if (data.length === 0) {
                    showToast("No flights found", "info");
                }

                setFlights(data);
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const validateFlight = (flight: Flight): Partial<Record<keyof Flight, string>> => {
        const errors: Partial<Record<keyof Flight, string>> = {};

        if (!flight.flightNumber.trim()) {
            errors.flightNumber = "Flight number cannot be empty";
        }

        if (flight.flightNumber.length < 5) {
            errors.flightNumber = "Flight number must be at least 5 characters long";
        }

        if (!flight.origin.trim()) {
            errors.origin = "Origin cannot be empty";
        } else if (!/^[A-Z]{0,3}$/.test(flight.origin)) {
            errors.origin = "Origin must be 3 uppercase letters";
        }

        if (!flight.destination.trim()) {
            errors.destination = "Destination cannot be empty";
        } else if (!/^[A-Z]{0,3}$/.test(flight.destination)) {
            errors.destination = "Destination must be 3 uppercase letters";
        }

        if (!flight.departureTime) {
            errors.departureTime = "Departure time cannot be empty";
        }

        if (!flight.arrivalTime) {
            errors.arrivalTime = "Arrival time cannot be empty";
        }

        if (flight.departureTime && flight.arrivalTime && new Date(flight.departureTime) >= new Date(flight.arrivalTime)) {
            errors.departureTime = "Departure time must be before arrival time";
        }

        if (flight.durationMinutes <= 0) {
            errors.durationMinutes = "Duration must be positive";
        }

        if (flight.basePriceCents <= 0) {
            errors.basePriceCents = "Base price must be positive";
        }

        if (flight.seatsTotal <= 0) {
            errors.seatsTotal = "Seats total must be positive";
        }

        if (flight.seatsTotal < flight.seatsAvailable) {
            errors.seatsTotal = "Seats total cannot be less than seats available";
        }

        if (flight.seatsAvailable < 0) {
            errors.seatsAvailable = "Seats available cannot be negative";
        }

        if (flight.seatsAvailable > flight.seatsTotal) {
            errors.seatsAvailable = "Seats available cannot exceed seats total";
        }

        return errors;
    };

    const handleEdit = (index: number) => {
        setEditing(index);
        setOriginalFlight({...flights[index]});
        setErrors(prev => {
            const newE = {...prev};
            delete newE[index];
            return newE;
        });
    };

    const handleSave = (index: number) => {
        const flight = flights[index];
        const errs = validateFlight(flight);
        if (Object.keys(errs).length > 0) {
            setErrors(prev => ({...prev, [index]: errs}));
            return;
        }

        adminUpdateFlight(flight.id.toString(), flight)
            .then(() => {
                setFlights(flights.map((f, i) => i === index ? flight : f));

                showToast("Flight updated successfully", "success");
            })
            .catch((err) => {
                console.error(err);
            });

        setErrors(prev => {
            const newE = {...prev};
            delete newE[index];
            return newE;
        });
        setOriginalFlight(null);
        setEditing(null);
    };

    const handleCancel = () => {
        if (editing !== null && originalFlight) {
            setFlights(flights.map((u, i) => i === editing ? originalFlight : u));
        }
        setEditing(null);
        setOriginalFlight(null);
        setErrors({});
    };

    const handleDelete = () => {
        setLoadingDelete(true);

        if (deleteIndex !== null) {
            adminDeleteFlight(flights[deleteIndex].id.toString()).then(() => {
                setFlights(flights.filter((_, i) => i !== deleteIndex));
            })
            .catch((err) => {
                console.error(err);

            })
            .finally(() => {
                setLoadingDelete(false);
                setWindowOpen(false);
                setDeleteIndex(null);
            });
        }
    };

    const handleSaveNew = () => {
        const errs = validateFlight(newFlight as Flight);
        if (Object.keys(errs).length > 0) {
            setNewFlightErrors(errs);
            return;
        }

        setLoadingAdd(true);
        adminCreateFlight(newFlight)
            .then((createdFlight: Flight) => {
                setFlights([...flights, createdFlight]);
                showToast("Flight created successfully", "success");
                setAdding(false);
                setNewFlight({ flightNumber: '', origin: '', destination: '', departureTime: '', arrivalTime: '', durationMinutes: 0, basePriceCents: 0, seatsTotal: 0, seatsAvailable: 0 });
                setNewFlightErrors({});
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                setLoadingAdd(false);
            });
    };

    const handleCancelNew = () => {
        setAdding(false);
        setNewFlight({ flightNumber: '', origin: '', destination: '', departureTime: '', arrivalTime: '', durationMinutes: 0, basePriceCents: 0, seatsTotal: 0, seatsAvailable: 0 });
        setNewFlightErrors({});
    };

    const updateNewFlight = (field: keyof Flight, value: any) => {
        setNewFlight(prev => ({...prev, [field]: value}));
    };

    const updateFlight = (index: number, field: keyof Flight, value: any) => {
        setFlights(flights.map((flight, i) => i === index ? {...flight, [field]: value} : flight));
    };

    return (
        <div className="flex flex-col items-center bg-gray-50 min-h-screen pt-8 pb-6">
            <AdminNavigationHeader/>
            {isAdmin ?  <h1 className="text-4xl font-bold text-gray-700 pb-10">Admin Flight Panel</h1> : null}

            {loading ? (
                <Spinner/>
            ) : (
                <div className="w-full max-w-8xl bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-2 text-left text-gray-700">Flight Number</th>
                            <th className="px-4 py-2 text-left text-gray-700">Origin</th>
                            <th className="px-4 py-2 text-left text-gray-700">Destination</th>
                            <th className="px-4 py-2 text-left text-gray-700">Departure Time</th>
                            <th className="px-4 py-2 text-left text-gray-700">Arrival Time</th>
                            <th className="px-4 py-2 text-left text-gray-700">Duration (min)</th>
                            <th className="px-4 py-2 text-left text-gray-700">Base Price (cents)</th>
                            <th className="px-4 py-2 text-left text-gray-700">Seats Total</th>
                            <th className="px-4 py-2 text-left text-gray-700">Seats Available</th>
                            <th className="px-4 py-2 text-left text-gray-700">
                                Actions
                                <div className="mt-2">            
                                    <Button text="Add Flight" color="bg-green-500" onClick={() => setAdding(true)}/>
                                </div>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {adding && (
                            <tr className="border-t bg-green-50">
                                <td className="px-4 py-2 text-gray-700">
                                    <input
                                        type="text"
                                        value={newFlight.flightNumber}
                                        onChange={(e) => updateNewFlight('flightNumber', e.target.value)}
                                        className="border rounded px-2 py-1 w-full"
                                        placeholder="Flight Number"
                                    />
                                    {newFlightErrors.flightNumber && <p className="text-red-500 text-sm">{newFlightErrors.flightNumber}</p>}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    <input
                                        type="text"
                                        value={newFlight.origin}
                                        onChange={(e) => updateNewFlight('origin', e.target.value)}
                                        className="border rounded px-2 py-1 w-full"
                                        placeholder="Origin"
                                    />
                                    {newFlightErrors.origin && <p className="text-red-500 text-sm">{newFlightErrors.origin}</p>}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    <input
                                        type="text"
                                        value={newFlight.destination}
                                        onChange={(e) => updateNewFlight('destination', e.target.value)}
                                        className="border rounded px-2 py-1 w-full"
                                        placeholder="Destination"
                                    />
                                    {newFlightErrors.destination && <p className="text-red-500 text-sm">{newFlightErrors.destination}</p>}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    <input
                                        type="datetime-local"
                                        value={newFlight.departureTime ? new Date(newFlight.departureTime).toISOString().slice(0, 16) : ''}
                                        onChange={(e) => updateNewFlight('departureTime', e.target.value)}
                                        className="border rounded px-2 py-1 w-full"
                                    />
                                    {newFlightErrors.departureTime && <p className="text-red-500 text-sm">{newFlightErrors.departureTime}</p>}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    <input
                                        type="datetime-local"
                                        value={newFlight.arrivalTime ? new Date(newFlight.arrivalTime).toISOString().slice(0, 16) : ''}
                                        onChange={(e) => updateNewFlight('arrivalTime', e.target.value)}
                                        className="border rounded px-2 py-1 w-full"
                                    />
                                    {newFlightErrors.arrivalTime && <p className="text-red-500 text-sm">{newFlightErrors.arrivalTime}</p>}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    <input
                                        type="number"
                                        value={newFlight.durationMinutes}
                                        onChange={(e) => updateNewFlight('durationMinutes', parseInt(e.target.value) || 0)}
                                        className="border rounded px-2 py-1 w-full"
                                        placeholder="Duration (min)"
                                    />
                                    {newFlightErrors.durationMinutes && <p className="text-red-500 text-sm">{newFlightErrors.durationMinutes}</p>}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    <input
                                        type="number"
                                        value={newFlight.basePriceCents}
                                        onChange={(e) => updateNewFlight('basePriceCents', parseInt(e.target.value) || 0)}
                                        className="border rounded px-2 py-1 w-full"
                                        placeholder="Base Price (cents)"
                                    />
                                    {newFlightErrors.basePriceCents && <p className="text-red-500 text-sm">{newFlightErrors.basePriceCents}</p>}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    <input
                                        type="number"
                                        value={newFlight.seatsTotal}
                                        onChange={(e) => updateNewFlight('seatsTotal', parseInt(e.target.value) || 0)}
                                        className="border rounded px-2 py-1 w-full"
                                        placeholder="Seats Total"
                                    />
                                    {newFlightErrors.seatsTotal && <p className="text-red-500 text-sm">{newFlightErrors.seatsTotal}</p>}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    <input
                                        type="number"
                                        value={newFlight.seatsAvailable}
                                        onChange={(e) => updateNewFlight('seatsAvailable', parseInt(e.target.value) || 0)}
                                        className="border rounded px-2 py-1 w-full"
                                        placeholder="Seats Available"
                                    />
                                    {newFlightErrors.seatsAvailable && <p className="text-red-500 text-sm">{newFlightErrors.seatsAvailable}</p>}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    <div className="flex space-x-2">
                                        <Button text="Save" color="bg-green-500" onClick={handleSaveNew} disabled={loadingAdd}/>
                                        <Button text="Cancel" color="bg-red-600" onClick={handleCancelNew} disabled={loadingAdd}/>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {flights.map((flight, index) => (
                            <tr key={index} className="border-t">
                                <td className="px-4 py-2 text-gray-700">
                                    {editing === index ? (
                                        <>
                                            <input
                                                type="text"
                                                value={flight.flightNumber}
                                                onChange={(e) => updateFlight(index, 'flightNumber', e.target.value)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                            {errors[index]?.flightNumber && <p className="text-red-500 text-sm">{errors[index].flightNumber}</p>}
                                        </>
                                    ) : (
                                        flight.flightNumber
                                    )}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {editing === index ? (
                                        <>
                                            <input
                                                type="text"
                                                value={flight.origin}
                                                onChange={(e) => updateFlight(index, 'origin', e.target.value)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                            {errors[index]?.origin && <p className="text-red-500 text-sm">{errors[index].origin}</p>}
                                        </>
                                    ) : (
                                        flight.origin
                                    )}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {editing === index ? (
                                        <>
                                            <input
                                                type="text"
                                                value={flight.destination}
                                                onChange={(e) => updateFlight(index, 'destination', e.target.value)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                            {errors[index]?.destination && <p className="text-red-500 text-sm">{errors[index].destination}</p>}
                                        </>
                                    ) : (
                                        flight.destination
                                    )}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {editing === index ? (
                                        <>
                                            <input
                                                type="datetime-local"
                                                value={flight.departureTime ? new Date(flight.departureTime).toISOString().slice(0, 16) : ''}
                                                onChange={(e) => updateFlight(index, 'departureTime', e.target.value)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                            {errors[index]?.departureTime && <p className="text-red-500 text-sm">{errors[index].departureTime}</p>}
                                        </>
                                    ) : (
                                        flight.departureTime ? new Date(flight.departureTime).toLocaleString() : ''
                                    )}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {editing === index ? (
                                        <>
                                            <input
                                                type="datetime-local"
                                                value={flight.arrivalTime ? new Date(flight.arrivalTime).toISOString().slice(0, 16) : ''}
                                                onChange={(e) => updateFlight(index, 'arrivalTime', e.target.value)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                            {errors[index]?.arrivalTime && <p className="text-red-500 text-sm">{errors[index].arrivalTime}</p>}
                                        </>
                                    ) : (
                                        flight.arrivalTime ? new Date(flight.arrivalTime).toLocaleString() : ''
                                    )}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {editing === index ? (
                                        <>
                                            <input
                                                type="number"
                                                value={flight.durationMinutes}
                                                onChange={(e) => updateFlight(index, 'durationMinutes', parseInt(e.target.value) || 0)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                            {errors[index]?.durationMinutes && <p className="text-red-500 text-sm">{errors[index].durationMinutes}</p>}
                                        </>
                                    ) : (
                                        flight.durationMinutes
                                    )}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {editing === index ? (
                                        <>
                                            <input
                                                type="number"
                                                value={flight.basePriceCents}
                                                onChange={(e) => updateFlight(index, 'basePriceCents', parseInt(e.target.value) || 0)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                            {errors[index]?.basePriceCents && <p className="text-red-500 text-sm">{errors[index].basePriceCents}</p>}
                                        </>
                                    ) : (
                                        flight.basePriceCents
                                    )}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {editing === index ? (
                                        <>
                                            <input
                                                type="number"
                                                value={flight.seatsTotal}
                                                onChange={(e) => updateFlight(index, 'seatsTotal', parseInt(e.target.value) || 0)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                            {errors[index]?.seatsTotal && <p className="text-red-500 text-sm">{errors[index].seatsTotal}</p>}
                                        </>
                                    ) : (
                                        flight.seatsTotal
                                    )}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {editing === index ? (
                                        <>
                                            <input
                                                type="number"
                                                value={flight.seatsAvailable}
                                                onChange={(e) => updateFlight(index, 'seatsAvailable', parseInt(e.target.value) || 0)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                            {errors[index]?.seatsAvailable && <p className="text-red-500 text-sm">{errors[index].seatsAvailable}</p>}
                                        </>
                                    ) : (
                                        flight.seatsAvailable
                                    )}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {editing === index ? (
                                        <div className="flex space-x-2">
                                            <Button text="Save" color="bg-green-500" onClick={() => handleSave(index)}/>
                                            <Button text="Cancel" color="bg-red-600" onClick={handleCancel}/>
                                        </div>
                                    ) : (
                                        <div className="flex space-x-2">
                                            <Button text="Edit" color="bg-blue-500" onClick={() => handleEdit(index)}/>
                                            <Button text="Delete" color="bg-red-500"
                                                    onClick={() => {
                                                        setDeleteIndex(index);
                                                        setWindowOpen(true);
                                                    }}/>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmationModal
                isOpen={windowOpen}
                onConfirm={handleDelete}
                onCancel={() => {
                    setDeleteIndex(null);
                    setWindowOpen(false);
                }}
                title="Confirm Deletion"
                message="Are you sure you want to delete this flight?"
                isLoading={loadingDelete}
            />
        </div>
    );
}

export default Flights;