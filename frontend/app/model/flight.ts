export interface Flight {
    id: number;
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    durationMinutes: number;
    seatsTotal: number;
    numberOfLayovers: number;
    basePriceCentsEconomy: number;
    basePriceCentsBusiness: number;
    basePriceCentsFirstClass: number;
    seatsAvailableEconomy: number;
    seatsAvailableBusiness: number;
    seatsAvailableFirstClass: number;
    seatsEconomy: number;
    seatsBusiness: number;
    seatsFirstClass: number;
}
