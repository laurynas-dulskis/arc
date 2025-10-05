<?php

declare(strict_types=1);

namespace App\Service\Flight;

use App\Exception\EntityNotFoundException;
use App\Normalizer\FlightNormalizer;
use App\Repository\FlightRepository;

class FlightQueryService
{
    public function __construct(
        private readonly FlightRepository $flightRepository,
        private readonly FlightNormalizer $flightNormalizer,
    ) {
    }

    public function getOne(int $id): array
    {
        $flight = $this->flightRepository->findById($id);

        if (null === $flight) {
            throw new EntityNotFoundException('Flight not found', ['id' => $id]);
        }

        return $this->flightNormalizer->normalize($flight);
    }

    public function getAll(): array
    {
        $flights = [];
        foreach ($this->flightRepository->findAllFlights() as $flight) {
            $flights[] = $this->flightNormalizer->normalize($flight);
        }

        return $flights;
    }
}
