<?php

declare(strict_types=1);

namespace App\Normalizer;

use App\Entity\Reservation;

class ReservationNormalizer
{
    public function normalize(Reservation $reservation): array
    {
        return [
            'id' => $reservation->getId(),
            'status' => $reservation->getStatus()->value,
            'createdAt' => $reservation->getCreatedAt()->format(DATE_ATOM),
            'user' => $reservation->getUser()?->getFirstName().' '.$reservation->getUser()?->getLastName().' ('.$reservation->getUser()?->getEmail().')',
        ];
    }
}
