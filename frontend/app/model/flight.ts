export interface Flight {
    id: number;
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
