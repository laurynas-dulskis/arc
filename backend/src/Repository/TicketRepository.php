<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Ticket;
use App\Enum\ReservationStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class TicketRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Ticket::class);
    }

    /**
     * @return Ticket[]
     */
    public function findPaidByFlightId(int $flightId): array
    {
        return $this->createQueryBuilder('t')
            ->join('t.reservation', 'r')
            ->where('t.flight = :flightId')
            ->andWhere('r.status = :status')
            ->setParameter('flightId', $flightId)
            ->setParameter('status', ReservationStatus::Paid->value)
            ->orderBy('t.id', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Ticket[]
     */
    public function findByReservationId(int $reservationId): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.reservation = :reservationId')
            ->setParameter('reservationId', $reservationId)
            ->orderBy('t.id', 'ASC')
            ->getQuery()
            ->getResult()
        ;
    }

    public function findByTicketId(int $ticketId): ?Ticket
    {
        return $this->createQueryBuilder('t')
            ->where('t.id = :ticketId')
            ->setParameter('ticketId', $ticketId)
            ->orderBy('t.id', 'ASC')
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
}
