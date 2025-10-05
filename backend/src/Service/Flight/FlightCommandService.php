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
            ->setBasePriceCents($request->basePriceCents)
            ->setSeatsTotal($request->seatsTotal)
            ->setSeatsAvailable($request->seatsAvailable)
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
            ->setBasePriceCents($request->basePriceCents)
            ->setSeatsTotal($request->seatsTotal)
            ->setSeatsAvailable($request->seatsAvailable)
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
