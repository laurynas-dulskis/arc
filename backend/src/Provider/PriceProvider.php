<?php

declare(strict_types=1);

namespace App\Provider;

use App\Entity\Flight;

class PriceProvider
{
    private const SEAT_PRICE_INCREASE_FACTOR = 0.05;
    private const FULL_PRICE = 1;

    public function getEconomyPrice(Flight $flight): int
    {
        if ($flight->getSeatsAvailableEconomy() < 1){
            return (int) round($flight->getBasePriceCentsEconomy() * ($flight->getSeatsEconomy() * self::SEAT_PRICE_INCREASE_FACTOR + self::FULL_PRICE));
        }

        return (int) round(
            $flight->getBasePriceCentsEconomy() * ($flight->getSeatsEconomy()/$flight->getSeatsAvailableEconomy() * self::SEAT_PRICE_INCREASE_FACTOR + self::FULL_PRICE)
        );
    }

    public function getBusinessPrice(Flight $flight): int
    {
        if ($flight->getSeatsAvailableBusiness() < 1){
            return (int) round($flight->getBasePriceCentsBusiness() * ($flight->getSeatsBusiness() * self::SEAT_PRICE_INCREASE_FACTOR + self::FULL_PRICE));
        }

        return (int) round(
            $flight->getBasePriceCentsBusiness() * ($flight->getSeatsBusiness()/$flight->getSeatsAvailableBusiness() * self::SEAT_PRICE_INCREASE_FACTOR + self::FULL_PRICE)
        );
    }

    public function getFirstClassPrice(Flight $flight): int
    {
        if ($flight->getSeatsAvailableFirstClass() < 1){
            return (int) round($flight->getBasePriceCentsFirstClass() * ($flight->getSeatsFirstClass() * self::SEAT_PRICE_INCREASE_FACTOR + self::FULL_PRICE));
        }

        return (int) round(
            $flight->getBasePriceCentsFirstClass() * ($flight->getSeatsFirstClass()/$flight->getSeatsAvailableFirstClass() * self::SEAT_PRICE_INCREASE_FACTOR + self::FULL_PRICE)
        );
    }
}
