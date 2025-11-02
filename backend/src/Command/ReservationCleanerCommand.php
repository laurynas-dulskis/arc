<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\Reservation;
use App\Enum\FlightClass;
use App\Enum\ReservationStatus;
use App\Repository\ReservationRepository;
use App\Repository\TicketRepository;
use Doctrine\ORM\EntityManagerInterface;
use LogicException;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Throwable;

#[AsCommand(
    name: 'app:reservation:clean',
    description: 'Cleans up old reservations from the system',
)]
class ReservationCleanerCommand extends Command
{
    public function __construct(
        private readonly ReservationRepository $reservationsRepository,
        private readonly TicketRepository $ticketRepository,
        private readonly EntityManagerInterface $entityManager,
    ) {
        parent::__construct();
    }

    public function execute(InputInterface $input, OutputInterface $output): int
    {
        /** @var Reservation[] $reservations */
        $reservations = $this->reservationsRepository->findOldReservationsToClean();

        $output->writeln('Found '.count($reservations).' old reservations to clean.');
        foreach ($reservations as $reservation) {
            if (ReservationStatus::Cancelled === $reservation->getStatus()) {
                throw new LogicException('Reservation is already cancelled');
            }

            if (ReservationStatus::Paid === $reservation->getStatus()) {
                throw new LogicException('Reservation is already paid and cannot be cancelled');
            }

            $tickets = $this->ticketRepository->findByReservationId($reservation->getId());
            $flight = $tickets[0]->getFlight();

            $this->entityManager->beginTransaction();
            try {
                foreach ($tickets as $ticket) {
                    $output->writeln('Cancelling ticket with ID '.$ticket->getId());

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

                $output->writeln('Cancelling reservation with ID '.$reservation->getId());
                $reservation->setStatus(ReservationStatus::Cancelled);
                $this->entityManager->flush();

                $this->entityManager->commit();
            } catch (Throwable $exception) {
                $this->entityManager->rollback();

                $output->writeln('<error>'.$exception->getMessage().'</error>');
            }
        }

        $output->writeln('Reservation cleanup completed.');

        return Command::SUCCESS;
    }
}
