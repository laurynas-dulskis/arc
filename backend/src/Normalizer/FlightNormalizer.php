<?php

declare(strict_types=1);

namespace App\Normalizer;

use App\Entity\Flight;
use App\Provider\PriceProvider;

class FlightNormalizer
{
    public function __construct(
        private readonly PriceProvider $priceProvider,
    )
    {
    }

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
            'basePriceCentsEconomy' => $this->priceProvider->getEconomyPrice($flight),
            'basePriceCentsBusiness' => $this->priceProvider->getBusinessPrice($flight),
            'basePriceCentsFirstClass' => $this->priceProvider->getFirstClassPrice($flight),
            'seatsEconomy' => $flight->getSeatsEconomy(),
            'seatsBusiness' => $flight->getSeatsBusiness(),
            'seatsFirstClass' => $flight->getSeatsFirstClass(),
            'seatsAvailableEconomy' => $flight->getSeatsAvailableEconomy(),
            'seatsAvailableBusiness' => $flight->getSeatsAvailableBusiness(),
            'seatsAvailableFirstClass' => $flight->getSeatsAvailableFirstClass(),
        ];
    }
}
