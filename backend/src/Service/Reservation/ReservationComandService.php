<?php

declare(strict_types=1);

namespace App\Service\Reservation;

use App\Dto\Reservation\ReservationConfirmRequest;
use App\Dto\Reservation\UserReservationCreateRequest;
use App\Entity\Reservation;
use App\Entity\Ticket;
use App\Enum\FlightClass;
use App\Enum\ReservationStatus;
use App\Exception\EntityNotFoundException;
use App\Normalizer\ReservationNormalizer;
use App\Repository\FlightRepository;
use App\Repository\ReservationRepository;
use App\Repository\TicketRepository;
use App\Repository\UserRepository;
use App\Security\UserToken;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class ReservationComandService
{
    public function __construct(
        private readonly FlightRepository $flightRepository,
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly ReservationRepository $reservationRepository,
        private readonly TicketRepository $ticketRepository,
        private readonly MailerInterface $mailer,
        #[Autowire('%env(FORM_EMAIL)%')]
        private readonly string $emailFromAddress
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

    public function cancel(int $reservationId, UserToken $userToken): void
    {
        $reservation = $this->reservationRepository->findByIdAndUserId($reservationId, $userToken->id);
        if ($reservation === null) {
            throw new EntityNotFoundException('Reservation not found', ['id' => $reservationId]);
        }

        if ($reservation->getStatus() === ReservationStatus::Cancelled) {
            throw new \LogicException('Reservation is already cancelled');
        }

        if ($reservation->getStatus() === ReservationStatus::Paid) {
            throw new \LogicException('Reservation is already paid and cannot be cancelled');
        }

        $tickets = $this->ticketRepository->findByReservationId($reservationId);
        $flight = $tickets[0]->getFlight();

        $this->entityManager->beginTransaction();
        try {
            foreach ($tickets as $ticket) {
                $seatClass = $ticket->getSeatClass();
                if ($seatClass === FlightClass::Economy->value) {
                    $flight->setSeatsAvailableEconomy($flight->getSeatsAvailableEconomy() + 1);
                } elseif ($seatClass === FlightClass::Business->value) {
                    $flight->setSeatsAvailableBusiness($flight->getSeatsAvailableBusiness() + 1);
                } elseif ($seatClass === FlightClass::First->value) {
                    $flight->setSeatsAvailableFirstClass($flight->getSeatsAvailableFirstClass() + 1);
                }

                $this->entityManager->flush();
            }

            $reservation->setStatus(ReservationStatus::Cancelled);
            $this->entityManager->flush();

            $this->entityManager->commit();
        }catch(\Throwable $exception) {
            $this->entityManager->rollback();
            throw $exception;
        }
    }

    /**
     * @param ReservationConfirmRequest[] $reservationConfirmRequest
     */
    public function confirm(
        int $reservationId,
        UserToken $userToken,
        array $reservationConfirmRequest
    ): void {
        $reservation = $this->reservationRepository->findByIdAndUserId($reservationId, $userToken->id);
        if ($reservation === null) {
            throw new EntityNotFoundException('Reservation not found', ['id' => $reservationId]);
        }

        if ($reservation->getStatus() === ReservationStatus::Cancelled) {
            throw new \LogicException('Reservation is already cancelled');
        }

        if ($reservation->getStatus() === ReservationStatus::Paid) {
            throw new \LogicException('Reservation is already paid and cannot be cancelled');
        }

        $this->entityManager->beginTransaction();
        try {
            foreach ($reservationConfirmRequest as $request) {
                $ticket = $this->ticketRepository->findByTicketId($request->ticketId);

                if ($ticket === null || $ticket->getReservation()->getId() !== $reservation->getId()) {
                    throw new EntityNotFoundException('Ticket not found for this reservation', ['id' => $request->ticketId]);
                }

                $ticket
                    ->setPassengerName($request->passengerName)
                    ->setPassengerDob($request->passengerDob);

                $this->entityManager->flush();
            }

            $reservation->setStatus(ReservationStatus::Paid);
            $this->entityManager->flush();

            $email = (new TemplatedEmail())
                ->from($this->emailFromAddress)
                ->to($userToken->email)
                ->subject('Reservation Confirmed')
                ->htmlTemplate('emails/ConfirmReservation.html.twig')
                ->context([
                    'username' => $userToken->name,
                    'reservationId' => $reservation->getId(),
                    'ticketCount' => count($reservationConfirmRequest),
                    'passengerNames' => array_map(fn($r) => $r->passengerName, $reservationConfirmRequest)
                ]);

            $this->mailer->send($email);

            $this->entityManager->commit();
        }catch(\Throwable $exception) {
            $this->entityManager->rollback();

            throw $exception;
        }
    }
}
