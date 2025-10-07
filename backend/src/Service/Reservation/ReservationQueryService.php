<?php

declare(strict_types=1);

namespace App\Service\Reservation;

use App\Normalizer\ReservationNormalizer;
use App\Repository\ReservationRepository;

class ReservationQueryService
{
    public function __construct(
        private readonly ReservationRepository $reservationRepository,
        private readonly ReservationNormalizer $reservationNormalizer,
    ) {
    }

    public function getAll(): array
    {
        $reservations = $this->reservationRepository->findAll();

        return array_map(
            fn ($reservation) => $this->reservationNormalizer->normalize($reservation),
            $reservations
        );
    }
}
