<?php

declare(strict_types=1);

namespace App\Normalizer;

use App\Entity\Flight;
use App\Entity\Reservation;
use App\Entity\Ticket;

class ReservationInfoNormalizer
{
    /**
     * @param Ticket[] $tickets
     */
    public function normalize(Reservation $reservation, Flight $flight, array $tickets): array
    {
        $ticketsData = [];

        /** @var Ticket $ticket */
        foreach ($tickets as $ticket) {
            $ticketsData[] = [
                'id' => $ticket->getId(),
                'passengerName' => $ticket->getPassengerName(),
                'class' => $ticket->getSeatClass(),
                'passengerDob' => $ticket->getPassengerDob()?->format(DATE_ATOM),
                'price' => $ticket->getPriceFinalCents(),
                'seat' => $ticket->getSeatNumber(),
            ];
        }

        return [
            'id' => $reservation->getId(),
            'status' => $reservation->getStatus()->value,
            'createdAt' => $reservation->getCreatedAt()->format(DATE_ATOM),
            'user' => $reservation->getUser()?->getFirstName().' '.$reservation->getUser()?->getLastName().' ('.$reservation->getUser()?->getEmail().')',
            'route' => $flight->getOrigin().' -> '.$flight->getDestination(),
            'departureTime' => $flight->getDepartureTime()->format(DATE_ATOM),
            'arrivalTime' => $flight->getArrivalTime()->format(DATE_ATOM),
            'numberOfLayovers' => $flight->getNumberOfLayovers(),
            'flightNumber' => $flight->getFlightNumber(),
            'reservationExpiryTime' => $reservation->getCreatedAt()->modify('+3 hours')->format(DATE_ATOM),
            'tickets' => $ticketsData,
        ];
    }
}
