<?php

declare(strict_types=1);

namespace App\Normalizer;

use App\Entity\Flight;

class FlightNormalizer
{
    public function normalize(Flight $flight): array
    {
        return [
            'id' => $flight->getId(),
            'flightNumber' => $flight->getFlightNumber(),
            'origin' => $flight->getOrigin(),
            'destination' => $flight->getDestination(),
            'departureTime' => $flight->getDepartureTime()->format('Y-m-d'),
            'arrivalTime' => $flight->getArrivalTime()->format('Y-m-d'),
            'durationMinutes' => $flight->getDurationMinutes(),
            'basePricePerCents' => $flight->getBasePriceCents(),
            'seatsTotal' => $flight->getSeatsTotal(),
            'seatsAvailable' => $flight->getSeatsAvailable(),
        ];
    }
}
