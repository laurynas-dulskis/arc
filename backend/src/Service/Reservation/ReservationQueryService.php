<?php

declare(strict_types=1);

namespace App\Service\Reservation;

use App\Exception\EntityNotFoundException;
use App\Normalizer\ReservationInfoNormalizer;
use App\Normalizer\ReservationNormalizer;
use App\Repository\ReservationRepository;
use App\Repository\TicketRepository;
use App\Security\UserToken;

class ReservationQueryService
{
    public function __construct(
        private readonly ReservationRepository $reservationRepository,
        private readonly TicketRepository $ticketRepository,
        private readonly ReservationNormalizer $reservationNormalizer,
        private readonly ReservationInfoNormalizer $reservationInfoNormalizer,
    ) {
    }

    public function getAll(): array
    {
        $reservations = $this->reservationRepository->findAll();

        $data = [];
        foreach ($reservations as $reservation) {
            $tickets = $this->ticketRepository->findByReservationId($reservation->getId());

            if ([] !== $tickets) {
                $flight = $tickets[0]->getFlight();

                $data[] = $this->reservationNormalizer->normalize($reservation, $flight);
            }
        }

        return $data;
    }

    public function getAllMy(UserToken $userToken): array
    {
        $reservations = $this->reservationRepository->findByUserId($userToken->id);

        $data = [];
        foreach ($reservations as $reservation) {
            $tickets = $this->ticketRepository->findByReservationId($reservation->getId());

            if ([] !== $tickets) {
                $flight = $tickets[0]->getFlight();

                $data[] = $this->reservationNormalizer->normalize($reservation, $flight);
            }
        }

        return $data;
    }

    public function getInfo(int $reservationId, UserToken $userToken): array
    {
        $reservation = $this->reservationRepository->findByIdAndUserId($reservationId, $userToken->id);
        if (null === $reservation) {
            throw new EntityNotFoundException('Reservation not found', ['id' => $reservationId]);
        }

        $tickets = $this->ticketRepository->findByReservationId($reservation->getId());
        $flight = $tickets[0]->getFlight();

        return $this->reservationInfoNormalizer->normalize($reservation, $flight, $tickets);
    }
}
