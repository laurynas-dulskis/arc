<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Reservation;
use App\Enum\ReservationStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ReservationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Reservation::class);
    }

    public function findById(string $id): ?Reservation
    {
        return $this->createQueryBuilder('r')
            ->where('r.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }

    public function findByUserId(int $userId): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.user = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult()
        ;
    }

    public function findByIdAndUserId(int $reservationId, int $userId): ?Reservation
    {
        return $this->createQueryBuilder('r')
            ->where('r.id = :reservationId')
            ->andWhere('r.user = :userId')
            ->setParameter('reservationId', $reservationId)
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }

    public function findOldReservationsToClean(): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.createdAt < :cutoffDate')
            ->andWhere('r.status = :status')
            ->setParameter('cutoffDate', new \DateTimeImmutable('-3 hours'))
            ->setParameter('status', ReservationStatus::Reserved->value)
            ->getQuery()
            ->getResult()
        ;
    }
}
