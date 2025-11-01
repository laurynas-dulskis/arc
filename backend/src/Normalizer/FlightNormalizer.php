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
            'departureTime' => $flight->getDepartureTime()->format('Y-m-d h:i:s'),
            'arrivalTime' => $flight->getArrivalTime()->format('Y-m-d h:i:s'),
            'durationMinutes' => $flight->getDurationMinutes(),
            'seatsTotal' => $flight->getSeatsTotal(),
            'numberOfLayovers' => $flight->getNumberOfLayovers(),
            'basePriceCentsEconomy' => $flight->getBasePriceCentsEconomy(),
            'basePriceCentsBusiness' => $flight->getBasePriceCentsBusiness(),
            'basePriceCentsFirstClass' => $flight->getBasePriceCentsFirstClass(),
            'seatsEconomy' => $flight->getSeatsEconomy(),
            'seatsBusiness' => $flight->getSeatsBusiness(),
            'seatsFirstClass' => $flight->getSeatsFirstClass(),
            'seatsAvailableEconomy' => $flight->getSeatsAvailableEconomy(),
            'seatsAvailableBusiness' => $flight->getSeatsAvailableBusiness(),
            'seatsAvailableFirstClass' => $flight->getSeatsAvailableFirstClass(),
        ];
    }
}
