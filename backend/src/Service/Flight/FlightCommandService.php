<?php

declare(strict_types=1);

namespace App\Service\Flight;

use App\Dto\Flight\FlightCreateRequest;
use App\Dto\Flight\FlightUpdateRequest;
use App\Entity\Flight;
use Doctrine\ORM\EntityManagerInterface;

class FlightCommandService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
    ) {
    }

    public function create(FlightCreateRequest $request): int
    {
        $flight = new Flight();
        $flight
            ->setFlightNumber($request->flightNumber)
            ->setOrigin($request->origin)
            ->setDestination($request->destination)
            ->setDepartureTime($request->departureTime)
            ->setArrivalTime($request->arrivalTime)
            ->setDurationMinutes($request->durationMinutes)
            ->setSeatsTotal($request->seatsTotal)
            ->setBasePriceCentsEconomy($request->basePriceCentsEconomy)
            ->setBasePriceCentsBusiness($request->basePriceCentsBusiness)
            ->setBasePriceCentsFirstClass($request->basePriceCentsFirstClass)
            ->setSeatsEconomy($request->seatsEconomy)
            ->setSeatsBusiness($request->seatsBusiness)
            ->setSeatsFirstClass($request->seatsFirstClass)
            ->setSeatsAvailableEconomy($request->seatsAvailableEconomy)
            ->setSeatsAvailableBusiness($request->seatsAvailableBusiness)
            ->setSeatsAvailableFirstClass($request->seatsAvailableFirstClass)
            ->setNumberOfLayovers($request->numberOfLayovers)
        ;

        $this->entityManager->persist($flight);
        $this->entityManager->flush();

        return $flight->getId();
    }

    public function update(FlightUpdateRequest $request, Flight $flight): int
    {
        $flight
            ->setFlightNumber($request->flightNumber)
            ->setOrigin($request->origin)
            ->setDestination($request->destination)
            ->setDepartureTime($request->departureTime)
            ->setArrivalTime($request->arrivalTime)
            ->setDurationMinutes($request->durationMinutes)
            ->setSeatsTotal($request->seatsTotal)
            ->setBasePriceCentsEconomy($request->basePriceCentsEconomy)
            ->setBasePriceCentsBusiness($request->basePriceCentsBusiness)
            ->setBasePriceCentsFirstClass($request->basePriceCentsFirstClass)
            ->setSeatsEconomy($request->seatsEconomy)
            ->setSeatsBusiness($request->seatsBusiness)
            ->setSeatsFirstClass($request->seatsFirstClass)
            ->setSeatsAvailableEconomy($request->seatsAvailableEconomy)
            ->setSeatsAvailableBusiness($request->seatsAvailableBusiness)
            ->setSeatsAvailableFirstClass($request->seatsAvailableFirstClass)
            ->setNumberOfLayovers($request->numberOfLayovers)
        ;

        $this->entityManager->flush();

        return $flight->getId();
    }

    public function delete(Flight $flight): void
    {
        $this->entityManager->remove($flight);
        $this->entityManager->flush();
    }
}
