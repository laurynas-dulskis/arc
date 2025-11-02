<?php

declare(strict_types=1);

namespace App\Service\Reservation;

use App\Dto\Reservation\UserReservationCreateRequest;
use App\Entity\Reservation;
use App\Entity\Ticket;
use App\Enum\FlightClass;
use App\Enum\ReservationStatus;
use App\Exception\EntityNotFoundException;
use App\Normalizer\ReservationNormalizer;
use App\Repository\FlightRepository;
use App\Repository\ReservationRepository;
use App\Repository\UserRepository;
use App\Security\UserToken;
use Doctrine\ORM\EntityManagerInterface;

class ReservationComandService
{
    public function __construct(
        private readonly FlightRepository $flightRepository,
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager,
    ) {
    }

    public function createReservationForUser(UserToken $userToken, UserReservationCreateRequest $userReservationCreateRequest): void
    {
        $user = $this->userRepository->findById($userToken->id);
        if ($user === null) {
            throw new EntityNotFoundException(
                'User not found',
                ['id' => $userToken->id]
            );
        }

        $flight = $this->flightRepository->findById($userReservationCreateRequest->flightId);
        if ($flight === null) {
            throw new EntityNotFoundException(
                'Flight not found',
                ['id' => $userReservationCreateRequest->flightId]
            );
        }

        if ($flight->getSeatsAvailableEconomy() - $userReservationCreateRequest->selectedEconomy < 0) {
            throw new \LogicException('Not enough economy seats available');
        }

        if ($flight->getSeatsAvailableBusiness() - $userReservationCreateRequest->selectedBusiness < 0) {
            throw new \LogicException('Not enough business seats available');
        }

        if ($flight->getSeatsAvailableFirstClass() - $userReservationCreateRequest->selectedFirstClass < 0) {
            throw new \LogicException('Not enough first class seats available');
        }

        $this->entityManager->beginTransaction();
        try {
            $reservation = (new Reservation())
                ->setStatus(ReservationStatus::Reserved)
                ->setUser($user);

            $this->entityManager->persist($reservation);
            $this->entityManager->flush();

            for ($i = 0; $i < $userReservationCreateRequest->selectedEconomy; $i++) {
                $ticket = (new Ticket())
                    ->setReservation($reservation)
                    ->setFlight($flight)
                    ->setPriceFinalCents($flight->getBasePriceCentsEconomy())
                    ->setSeatClass(FlightClass::Economy->value);

                $this->entityManager->persist($ticket);
                $this->entityManager->flush();
            }

            for ($i = 0; $i < $userReservationCreateRequest->selectedBusiness; $i++) {
                $ticket = (new Ticket())
                    ->setReservation($reservation)
                    ->setFlight($flight)
                    ->setPriceFinalCents($flight->getBasePriceCentsBusiness())
                    ->setSeatClass(FlightClass::Business->value);

                $this->entityManager->persist($ticket);
                $this->entityManager->flush();
            }

            for ($i = 0; $i < $userReservationCreateRequest->selectedFirstClass; $i++) {
                $ticket = (new Ticket())
                    ->setReservation($reservation)
                    ->setFlight($flight)
                    ->setPriceFinalCents($flight->getBasePriceCentsFirstClass())
                    ->setSeatClass(FlightClass::First->value);

                $this->entityManager->persist($ticket);
                $this->entityManager->flush();
            }

            $flight
                ->setSeatsAvailableEconomy($flight->getSeatsAvailableEconomy() - $userReservationCreateRequest->selectedEconomy)
                ->setSeatsAvailableBusiness($flight->getSeatsAvailableBusiness() - $userReservationCreateRequest->selectedBusiness)
                ->setSeatsAvailableFirstClass($flight->getSeatsAvailableFirstClass() - $userReservationCreateRequest->selectedFirstClass);

            $this->entityManager->flush();

            $this->entityManager->commit();
        }catch(\Throwable $exception) {
            $this->entityManager->rollback();
            throw $exception;
        }
    }
}
