<?php

declare(strict_types=1);

namespace App\Service\Flight;

use App\Dto\Flight\FlightFilterRequest;
use App\Exception\EntityNotFoundException;
use App\Normalizer\FlightNormalizer;
use App\Repository\FlightRepository;
use App\Repository\ReservationRepository;
use App\Repository\TicketRepository;

class FlightQueryService
{
    public function __construct(
        private readonly FlightRepository $flightRepository,
        private readonly FlightNormalizer $flightNormalizer,
        private readonly TicketRepository $ticketRepository,
    ) {
    }

    public function getSeats(string $id): array
    {
        $takenSeats = [];
        $reservationTickets = $this->ticketRepository->findByReservationId((int) $id);
        if ($reservationTickets === []) {
            throw new EntityNotFoundException('Tickets not found for reservation', ['id' => $id]);
        }

        $tickets = $this->ticketRepository->findFlightId($reservationTickets[0]->getFlight()->getId());
        foreach ($tickets as $ticket) {
            if ($ticket->getSeatNumber() !== null) {
                $takenSeats[] = $ticket->getSeatNumber();
            }
        }

        return [
            'takenSeats' => $takenSeats,
        ];
    }

    public function getOne(int $id): array
    {
        $flight = $this->flightRepository->findById($id);

        if (null === $flight) {
            throw new EntityNotFoundException('Flight not found', ['id' => $id]);
        }

        return $this->flightNormalizer->normalize($flight);
    }

    public function getAll(FlightFilterRequest $request): array
    {
        $flights = [];
        foreach ($this->flightRepository->findAllFlights($request) as $flight) {
            $flights[] = $this->flightNormalizer->normalize($flight);
        }

        return $flights;
    }

    public function getAllAll(): array
    {
        $flights = [];
        foreach ($this->flightRepository->findAllFlightsAll() as $flight) {
            $flights[] = $this->flightNormalizer->normalize($flight);
        }

        return $flights;
    }

    public function getAllFlightsPagesCount(FlightFilterRequest $request): array
    {
        return [
            'pages' => $this->flightRepository->findAllFlightsPagesCount($request),
        ];
    }
}
