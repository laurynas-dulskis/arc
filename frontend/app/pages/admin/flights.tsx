import React, { useState } from "react";
import { ensureAdminAccess } from "~/utils/authUtils";
import Button from "~/components/button";
import AdminNavigationHeader from "~/components/adminNavigationHeader";
import { adminDeleteFlight, adminUpdateFlight, getAllFlights, adminCreateFlight, getAllFlightsAll } from "~/clients/flightsClient";
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

    const emptyNewFlight: Partial<Flight> = {
        flightNumber: '',
        origin: '',
        destination: '',
        departureTime: '',
        arrivalTime: '',
        durationMinutes: 0,
        basePriceCentsEconomy: 0,
        basePriceCentsBusiness: 0,
        basePriceCentsFirstClass: 0,
        seatsEconomy: 0,
        seatsBusiness: 0,
        seatsFirstClass: 0,
        numberOfLayovers: 0,
    };

    const [newFlight, setNewFlight] = useState<Partial<Flight>>(emptyNewFlight);
    const [newFlightErrors, setNewFlightErrors] = useState<Partial<Record<keyof Flight, string>>>({});
    const [loadingAdd, setLoadingAdd] = useState(false);

    React.useEffect(() => {
        setIsAdmin(ensureAdminAccess());

        getAllFlightsAll()
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

    const isValidDateString = (v: any) => {
        if (!v && v !== 0) return false;
        const t = Date.parse(String(v));
        return !isNaN(t);
    };

    const validateFlight = (flight: Partial<Flight>): Partial<Record<keyof Flight, string>> => {
        const errs: Partial<Record<keyof Flight, string>> = {};

        // flightNumber: NotBlank, Length(min:5), Type string
        const fn = (flight.flightNumber ?? '').toString();
        if (!fn.trim()) {
            errs.flightNumber = "Flight number cannot be empty";
        } else if (fn.length < 5) {
            errs.flightNumber = "Flight number must be at least 5 characters long";
        }

        // origin/destination: NotBlank, Regex /^[A-Z]{3}$/, Type string
        const origin = (flight.origin ?? '').toString();
        if (!origin.trim()) {
            errs.origin = "Origin cannot be empty";
        } else if (!/^[A-Z]{3}$/.test(origin)) {
            errs.origin = "Origin must be exactly 3 uppercase letters";
        }

        const destination = (flight.destination ?? '').toString();
        if (!destination.trim()) {
            errs.destination = "Destination cannot be empty";
        } else if (!/^[A-Z]{3}$/.test(destination)) {
            errs.destination = "Destination must be exactly 3 uppercase letters";
        }

        // departureTime / arrivalTime: NotNull, must be valid date
        if (!flight.departureTime) {
            errs.departureTime = "Departure time cannot be empty";
        } else if (!isValidDateString(flight.departureTime)) {
            errs.departureTime = "Departure time must be a valid date/time";
        }

        if (!flight.arrivalTime) {
            errs.arrivalTime = "Arrival time cannot be empty";
        } else if (!isValidDateString(flight.arrivalTime)) {
            errs.arrivalTime = "Arrival time must be a valid date/time";
        }

        if (isValidDateString(flight.departureTime) && isValidDateString(flight.arrivalTime)) {
            const d1 = new Date(String(flight.departureTime));
            const d2 = new Date(String(flight.arrivalTime));
            if (d1 >= d2) {
                errs.departureTime = "Departure time must be before arrival time";
            }
        }

        // durationMinutes: NotNull, GreaterThan(0), Type int
        const dur = Number(flight.durationMinutes);
        if (flight.durationMinutes === null || flight.durationMinutes === undefined || isNaN(dur)) {
            errs.durationMinutes = "Duration is required";
        } else if (!Number.isInteger(dur) || dur <= 0) {
            errs.durationMinutes = "Duration must be a positive integer";
        }

        // base prices: NotNull, GreaterThan(0), Type int
        const bE = Number((flight as any).basePriceCentsEconomy);
        if ((flight as any).basePriceCentsEconomy === null || (flight as any).basePriceCentsEconomy === undefined || isNaN(bE)) {
            errs.basePriceCentsEconomy = "Economy base price is required";
        } else if (!Number.isInteger(bE) || bE <= 0) {
            errs.basePriceCentsEconomy = "Economy base price must be a positive integer";
        }

        const bB = Number((flight as any).basePriceCentsBusiness);
        if ((flight as any).basePriceCentsBusiness === null || (flight as any).basePriceCentsBusiness === undefined || isNaN(bB)) {
            errs.basePriceCentsBusiness = "Business base price is required";
        } else if (!Number.isInteger(bB) || bB <= 0) {
            errs.basePriceCentsBusiness = "Business base price must be a positive integer";
        }

        const bF = Number((flight as any).basePriceCentsFirstClass);
        if ((flight as any).basePriceCentsFirstClass === null || (flight as any).basePriceCentsFirstClass === undefined || isNaN(bF)) {
            errs.basePriceCentsFirstClass = "First class base price is required";
        } else if (!Number.isInteger(bF) || bF <= 0) {
            errs.basePriceCentsFirstClass = "First class base price must be a positive integer";
        }

        // seats per class: NotNull, GreaterThanOrEqual(0), Type int
        const sE = Number((flight as any).seatsEconomy);
        if ((flight as any).seatsEconomy === null || (flight as any).seatsEconomy === undefined || isNaN(sE)) {
            errs.seatsEconomy = "Economy seats is required";
        } else if (!Number.isInteger(sE) || sE < 0) {
            errs.seatsEconomy = "Economy seats must be an integer >= 0";
        }

        const sB = Number((flight as any).seatsBusiness);
        if ((flight as any).seatsBusiness === null || (flight as any).seatsBusiness === undefined || isNaN(sB)) {
            errs.seatsBusiness = "Business seats is required";
        } else if (!Number.isInteger(sB) || sB < 0) {
            errs.seatsBusiness = "Business seats must be an integer >= 0";
        }

        const sF = Number((flight as any).seatsFirstClass);
        if ((flight as any).seatsFirstClass === null || (flight as any).seatsFirstClass === undefined || isNaN(sF)) {
            errs.seatsFirstClass = "First class seats is required";
        } else if (!Number.isInteger(sF) || sF < 0) {
            errs.seatsFirstClass = "First class seats must be an integer >= 0";
        }

        // numberOfLayovers: NotNull, GreaterThanOrEqual(0), Type int
        const lays = Number((flight as any).numberOfLayovers);
        if ((flight as any).numberOfLayovers === null || (flight as any).numberOfLayovers === undefined || isNaN(lays)) {
            errs.numberOfLayovers = "Number of layovers is required";
        } else if (!Number.isInteger(lays) || lays < 0) {
            errs.numberOfLayovers = "Number of layovers must be an integer >= 0";
        }

        return errs;
    };

    const handleEdit = (index: number) => {
        setEditing(index);
        setOriginalFlight({ ...flights[index] });
        setErrors(prev => {
            const newE = { ...prev };
            delete newE[index];
            return newE;
        });
    };

    const handleSave = (index: number) => {
        const flight = flights[index];
        const errs = validateFlight(flight);
        if (Object.keys(errs).length > 0) {
            setErrors(prev => ({ ...prev, [index]: errs }));
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
            const newE = { ...prev };
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
        const errs = validateFlight(newFlight);
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
                setNewFlight(emptyNewFlight);
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
        setNewFlight(emptyNewFlight);
        setNewFlightErrors({});
    };

    const updateNewFlight = (field: keyof Flight, value: any) => {
        setNewFlight(prev => ({ ...prev, [field]: value }));
    };

    const updateFlight = (index: number, field: keyof Flight, value: any) => {
        setFlights(flights.map((flight, i) => i === index ? { ...flight, [field]: value } : flight));
    };

    const toLocalDateTimeValue = (v: any) => {
        if (!v) return '';
        const d = new Date(String(v));
        if (isNaN(d.getTime())) return '';
        const iso = d.toISOString();
        return iso.slice(0, 16);
    };

    return (
        <div className="flex flex-col items-center bg-gray-50 min-h-screen pt-8 pb-6">
            <AdminNavigationHeader />
            {isAdmin ? <h1 className="text-4xl font-bold text-gray-700 pb-10">Admin Flight Panel</h1> : null}

            {loading ? (
                <Spinner />
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
                                <th className="px-4 py-2 text-left text-gray-700">Base Price Economy (cents)</th>
                                <th className="px-4 py-2 text-left text-gray-700">Base Price Business (cents)</th>
                                <th className="px-4 py-2 text-left text-gray-700">Base Price First (cents)</th>
                                <th className="px-4 py-2 text-left text-gray-700">Seats Economy</th>
                                <th className="px-4 py-2 text-left text-gray-700">Seats Business</th>
                                <th className="px-4 py-2 text-left text-gray-700">Seats First</th>
                                <th className="px-4 py-2 text-left text-gray-700">Layovers</th>
                                <th className="px-4 py-2 text-left text-gray-700">
                                    Actions
                                    <div className="mt-2">
                                        <Button text="Add Flight" color="bg-green-500" onClick={() => setAdding(true)} />
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
                                            value={newFlight.flightNumber as string}
                                            onChange={(e) => updateNewFlight('flightNumber', e.target.value)}
                                            className="border rounded px-2 py-1 w-full"
                                            placeholder="Flight Number"
                                        />
                                        {newFlightErrors.flightNumber && <p className="text-red-500 text-sm">{newFlightErrors.flightNumber}</p>}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">
                                        <input
                                            type="text"
                                            value={newFlight.origin as string}
                                            onChange={(e) => updateNewFlight('origin', e.target.value)}
                                            className="border rounded px-2 py-1 w-full"
                                            placeholder="Origin"
                                        />
                                        {newFlightErrors.origin && <p className="text-red-500 text-sm">{newFlightErrors.origin}</p>}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">
                                        <input
                                            type="text"
                                            value={newFlight.destination as string}
                                            onChange={(e) => updateNewFlight('destination', e.target.value)}
                                            className="border rounded px-2 py-1 w-full"
                                            placeholder="Destination"
                                        />
                                        {newFlightErrors.destination && <p className="text-red-500 text-sm">{newFlightErrors.destination}</p>}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">
                                        <input
                                            type="datetime-local"
                                            value={toLocalDateTimeValue(newFlight.departureTime)}
                                            onChange={(e) => updateNewFlight('departureTime', e.target.value)}
                                            className="border rounded px-2 py-1 w-full"
                                        />
                                        {newFlightErrors.departureTime && <p className="text-red-500 text-sm">{newFlightErrors.departureTime}</p>}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">
                                        <input
                                            type="datetime-local"
                                            value={toLocalDateTimeValue(newFlight.arrivalTime)}
                                            onChange={(e) => updateNewFlight('arrivalTime', e.target.value)}
                                            className="border rounded px-2 py-1 w-full"
                                        />
                                        {newFlightErrors.arrivalTime && <p className="text-red-500 text-sm">{newFlightErrors.arrivalTime}</p>}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">
                                        <input
                                            type="number"
                                            value={newFlight.durationMinutes as number}
                                            onChange={(e) => updateNewFlight('durationMinutes', parseInt(e.target.value) || 0)}
                                            className="border rounded px-2 py-1 w-full"
                                            placeholder="Duration (min)"
                                        />
                                        {newFlightErrors.durationMinutes && <p className="text-red-500 text-sm">{newFlightErrors.durationMinutes}</p>}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">
                                        <input
                                            type="number"
                                            value={(newFlight as any).basePriceCentsEconomy as number}
                                            onChange={(e) => updateNewFlight('basePriceCentsEconomy' as any, parseInt(e.target.value) || 0)}
                                            className="border rounded px-2 py-1 w-full"
                                            placeholder="Economy (cents)"
                                        />
                                        {newFlightErrors.basePriceCentsEconomy && <p className="text-red-500 text-sm">{newFlightErrors.basePriceCentsEconomy}</p>}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">
                                        <input
                                            type="number"
                                            value={(newFlight as any).basePriceCentsBusiness as number}
                                            onChange={(e) => updateNewFlight('basePriceCentsBusiness' as any, parseInt(e.target.value) || 0)}
                                            className="border rounded px-2 py-1 w-full"
                                            placeholder="Business (cents)"
                                        />
                                        {newFlightErrors.basePriceCentsBusiness && <p className="text-red-500 text-sm">{newFlightErrors.basePriceCentsBusiness}</p>}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">
                                        <input
                                            type="number"
                                            value={(newFlight as any).basePriceCentsFirstClass as number}
                                            onChange={(e) => updateNewFlight('basePriceCentsFirstClass' as any, parseInt(e.target.value) || 0)}
                                            className="border rounded px-2 py-1 w-full"
                                            placeholder="First (cents)"
                                        />
                                        {newFlightErrors.basePriceCentsFirstClass && <p className="text-red-500 text-sm">{newFlightErrors.basePriceCentsFirstClass}</p>}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">
                                        <input
                                            type="number"
                                            value={(newFlight as any).seatsEconomy as number}
                                            onChange={(e) => updateNewFlight('seatsEconomy' as any, parseInt(e.target.value) || 0)}
                                            className="border rounded px-2 py-1 w-full"
                                            placeholder="Seats Economy"
                                        />
                                        {newFlightErrors.seatsEconomy && <p className="text-red-500 text-sm">{newFlightErrors.seatsEconomy}</p>}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">
                                        <input
                                            type="number"
                                            value={(newFlight as any).seatsBusiness as number}
                                            onChange={(e) => updateNewFlight('seatsBusiness' as any, parseInt(e.target.value) || 0)}
                                            className="border rounded px-2 py-1 w-full"
                                            placeholder="Seats Business"
                                        />
                                        {newFlightErrors.seatsBusiness && <p className="text-red-500 text-sm">{newFlightErrors.seatsBusiness}</p>}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">
                                        <input
                                            type="number"
                                            value={(newFlight as any).seatsFirstClass as number}
                                            onChange={(e) => updateNewFlight('seatsFirstClass' as any, parseInt(e.target.value) || 0)}
                                            className="border rounded px-2 py-1 w-full"
                                            placeholder="Seats First"
                                        />
                                        {newFlightErrors.seatsFirstClass && <p className="text-red-500 text-sm">{newFlightErrors.seatsFirstClass}</p>}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">
                                        <input
                                            type="number"
                                            value={(newFlight as any).numberOfLayovers as number}
                                            onChange={(e) => updateNewFlight('numberOfLayovers' as any, parseInt(e.target.value) || 0)}
                                            className="border rounded px-2 py-1 w-full"
                                            placeholder="Layovers"
                                        />
                                        {newFlightErrors.numberOfLayovers && <p className="text-red-500 text-sm">{newFlightErrors.numberOfLayovers}</p>}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">
                                        <div className="flex space-x-2">
                                            <Button text="Save" color="bg-green-500" onClick={handleSaveNew} disabled={loadingAdd} />
                                            <Button text="Cancel" color="bg-red-600" onClick={handleCancelNew} disabled={loadingAdd} />
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
                                                    value={flight.flightNumber as string}
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
                                                    value={flight.origin as string}
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
                                                    value={flight.destination as string}
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
                                                    value={toLocalDateTimeValue(flight.departureTime)}
                                                    onChange={(e) => updateFlight(index, 'departureTime', e.target.value)}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                                {errors[index]?.departureTime && <p className="text-red-500 text-sm">{errors[index].departureTime}</p>}
                                            </>
                                        ) : (
                                            flight.departureTime ? new Date(String(flight.departureTime)).toLocaleString() : ''
                                        )}
                                    </td>

                                    <td className="px-4 py-2 text-gray-700">
                                        {editing === index ? (
                                            <>
                                                <input
                                                    type="datetime-local"
                                                    value={toLocalDateTimeValue(flight.arrivalTime)}
                                                    onChange={(e) => updateFlight(index, 'arrivalTime', e.target.value)}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                                {errors[index]?.arrivalTime && <p className="text-red-500 text-sm">{errors[index].arrivalTime}</p>}
                                            </>
                                        ) : (
                                            flight.arrivalTime ? new Date(String(flight.arrivalTime)).toLocaleString() : ''
                                        )}
                                    </td>

                                    <td className="px-4 py-2 text-gray-700">
                                        {editing === index ? (
                                            <>
                                                <input
                                                    type="number"
                                                    value={flight.durationMinutes as number}
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
                                                    value={(flight as any).basePriceCentsEconomy as number}
                                                    onChange={(e) => updateFlight(index, 'basePriceCentsEconomy' as any, parseInt(e.target.value) || 0)}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                                {errors[index]?.basePriceCentsEconomy && <p className="text-red-500 text-sm">{errors[index].basePriceCentsEconomy}</p>}
                                            </>
                                        ) : (
                                            (flight as any).basePriceCentsEconomy
                                        )}
                                    </td>

                                    <td className="px-4 py-2 text-gray-700">
                                        {editing === index ? (
                                            <>
                                                <input
                                                    type="number"
                                                    value={(flight as any).basePriceCentsBusiness as number}
                                                    onChange={(e) => updateFlight(index, 'basePriceCentsBusiness' as any, parseInt(e.target.value) || 0)}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                                {errors[index]?.basePriceCentsBusiness && <p className="text-red-500 text-sm">{errors[index].basePriceCentsBusiness}</p>}
                                            </>
                                        ) : (
                                            (flight as any).basePriceCentsBusiness
                                        )}
                                    </td>

                                    <td className="px-4 py-2 text-gray-700">
                                        {editing === index ? (
                                            <>
                                                <input
                                                    type="number"
                                                    value={(flight as any).basePriceCentsFirstClass as number}
                                                    onChange={(e) => updateFlight(index, 'basePriceCentsFirstClass' as any, parseInt(e.target.value) || 0)}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                                {errors[index]?.basePriceCentsFirstClass && <p className="text-red-500 text-sm">{errors[index].basePriceCentsFirstClass}</p>}
                                            </>
                                        ) : (
                                            (flight as any).basePriceCentsFirstClass
                                        )}
                                    </td>

                                    <td className="px-4 py-2 text-gray-700">
                                        {editing === index ? (
                                            <>
                                                <input
                                                    type="number"
                                                    value={(flight as any).seatsEconomy as number}
                                                    onChange={(e) => updateFlight(index, 'seatsEconomy' as any, parseInt(e.target.value) || 0)}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                                {errors[index]?.seatsEconomy && <p className="text-red-500 text-sm">{errors[index].seatsEconomy}</p>}
                                            </>
                                        ) : (
                                            (flight as any).seatsEconomy
                                        )}
                                    </td>

                                    <td className="px-4 py-2 text-gray-700">
                                        {editing === index ? (
                                            <>
                                                <input
                                                    type="number"
                                                    value={(flight as any).seatsBusiness as number}
                                                    onChange={(e) => updateFlight(index, 'seatsBusiness' as any, parseInt(e.target.value) || 0)}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                                {errors[index]?.seatsBusiness && <p className="text-red-500 text-sm">{errors[index].seatsBusiness}</p>}
                                            </>
                                        ) : (
                                            (flight as any).seatsBusiness
                                        )}
                                    </td>

                                    <td className="px-4 py-2 text-gray-700">
                                        {editing === index ? (
                                            <>
                                                <input
                                                    type="number"
                                                    value={(flight as any).seatsFirstClass as number}
                                                    onChange={(e) => updateFlight(index, 'seatsFirstClass' as any, parseInt(e.target.value) || 0)}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                                {errors[index]?.seatsFirstClass && <p className="text-red-500 text-sm">{errors[index].seatsFirstClass}</p>}
                                            </>
                                        ) : (
                                            (flight as any).seatsFirstClass
                                        )}
                                    </td>

                                    <td className="px-4 py-2 text-gray-700">
                                        {editing === index ? (
                                            <>
                                                <input
                                                    type="number"
                                                    value={(flight as any).numberOfLayovers as number}
                                                    onChange={(e) => updateFlight(index, 'numberOfLayovers' as any, parseInt(e.target.value) || 0)}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                                {errors[index]?.numberOfLayovers && <p className="text-red-500 text-sm">{errors[index].numberOfLayovers}</p>}
                                            </>
                                        ) : (
                                            (flight as any).numberOfLayovers
                                        )}
                                    </td>

                                    <td className="px-4 py-2 text-gray-700">
                                        {editing === index ? (
                                            <div className="flex space-x-2">
                                                <Button text="Save" color="bg-green-500" onClick={() => handleSave(index)} />
                                                <Button text="Cancel" color="bg-red-600" onClick={handleCancel} />
                                            </div>
                                        ) : (
                                            <div className="flex space-x-2">
                                                <Button text="Edit" color="bg-blue-500" onClick={() => handleEdit(index)} />
                                                <Button text="Delete" color="bg-red-500"
                                                    onClick={() => {
                                                        setDeleteIndex(index);
                                                        setWindowOpen(true);
                                                    }} />
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