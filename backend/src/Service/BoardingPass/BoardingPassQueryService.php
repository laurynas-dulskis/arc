<?php

declare(strict_types=1);

namespace App\Service\BoardingPass;

use App\Exception\EntityNotFoundException;
use App\Repository\FlightRepository;
use App\Repository\TicketRepository;

class BoardingPassQueryService
{
    public function __construct(
        private readonly FLightRepository $flightRepository,
        private readonly TicketRepository $ticketRepository,
    ){
    }

    public function getAll(int $flightId): array
    {
        $flight = $this->flightRepository->findById($flightId);
        if ($flight === null) {
            throw new EntityNotFoundException('Flight not found', ['id' => $flightId]);
        }

        $tickets = $this->ticketRepository->findPaidByFlightId($flightId);
        $ticketsData = [];

        foreach ($tickets as $ticket) {
            $ticketsData[] = [
                'departureAirport' => $flight->getOrigin()?: '',
                'arrivalAirport' => $flight->getDestination()?: '',
                'flightNumber' => $flight->getFlightNumber()?: '',
                'date' => $flight->getDepartureTime()->format('j M'),
                'boardingTime' => $flight->getDepartureTime()->modify('-30 minutes')->format('H:i'),
                'gate' => 'A1',
                'seat' => $ticket->getSeatClass() ?: '',
                'pnr' => $flight->getId().'-'.$ticket->getReservation()->getId().'-'.$ticket->getId(),
                'passengerName' => $ticket->getPassengerName()?: ''
            ];
        }

        return $ticketsData;
    }
}
