export interface Reservation {
    id: number;
    status: string;
    createdAt: string;
    user: string;
    route: string;
    departureTime: string;
    arrivalTime: string;
}