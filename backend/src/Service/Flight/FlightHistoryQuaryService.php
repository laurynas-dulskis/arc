<?php

declare(strict_types=1);

namespace App\Service\Flight;

use App\Repository\FlightRepository;
use App\Repository\ReservationRepository;
use App\Repository\TicketRepository;
use App\Security\UserToken;

class FlightHistoryQuaryService
{
    public function __construct(
        private readonly ReservationRepository $reservationRepository,
        private readonly TicketRepository $ticketRepository,
    ){
    }

    public function getMyFlightHistory(UserToken $userToken): array
    {
        $data = [];

        $reservations = $this->reservationRepository->findHistoricByUserId($userToken->id);
        foreach ($reservations as $reservation) {
            $tickets = $this->ticketRepository->findByReservationId($reservation->getId());

            foreach ($tickets as $ticket) {
                if ($ticket->getFlight()->getDepartureTime() < new \DateTime()) {
                    $data[] = [
                        'flightNumber' => $ticket->getFlight()->getFlightNumber() ?: '',
                        'origin' => $ticket->getFlight()->getOrigin() ?: '',
                        'destination' => $ticket->getFlight()->getDestination() ?: '',
                        'departureTime' => $ticket->getFlight()->getDepartureTime()?->format('Y-m-d H:i') ?: '',
                        'passengerName' => $ticket->getPassengerName() ?: '',
                        'seatClass' => $ticket->getSeatClass() ?: '',
                        'price' => $ticket->getPriceFinalCents() / 100 ?: 0,
                    ];
                }
            }
        }

        return $data;
    }
}
