<?php

declare(strict_types=1);

namespace App\Service\Flight;

use App\Dto\PageRequest;
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

    public function getMyFlightHistory(UserToken $userToken, PageRequest $request): array
    {
        $data = [];

        $reservations = $this->reservationRepository->findHistoricByUserIdUnlimited($userToken->id);
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

        $page = 1;
        if (null !== $request->page) {
            $page = max(1, $request->page);
        }

        $offset = ($page - 1) * 3;

        $newData = array_slice($data, $offset, 3);

        return $newData;
    }

    public function getMyFlightHistoryPages(UserToken $userToken): array
    {
        $data = 0;

        $reservations = $this->reservationRepository->findHistoricByUserIdUnlimited($userToken->id);
        foreach ($reservations as $reservation) {
            $tickets = $this->ticketRepository->findByReservationId($reservation->getId());

            foreach ($tickets as $ticket) {
                if ($ticket->getFlight()->getDepartureTime() < new \DateTime()) {
                    $data++;
                }
            }
        }

        return [
            'pages' => (int) ceil($data / 3),
        ];
    }
}
