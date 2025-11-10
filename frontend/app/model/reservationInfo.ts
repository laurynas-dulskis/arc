export interface TicketInfo {
    id: number;
    passengerName: string | null;
    class: string;
    passengerDob: string | null;
    price: number;
    seat: string | null;
    extraBags: number;
}

export interface ReservationInfo {
    id: number;
    status: string;
    createdAt: string;
    user: string;
    route: string;
    departureTime: string;
    arrivalTime: string;
    numberOfLayovers: number;
    flightNumber: string;
    reservationExpiryTime: string;
    tickets: TicketInfo[];
}