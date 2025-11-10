<?php

declare(strict_types=1);

namespace App\Repository;

use App\Dto\PageRequest;
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

    /**
     * @return Reservation[]
     */
    public function findHistoricByUserId(int $userId, PageRequest $request, int $limit = 3): array
    {
        $page = 1;
        if (null !== $request->page) {
            $page = max(1, $request->page);
        }

        $offset = ($page - 1) * $limit;

        return $this->createQueryBuilder('r')
            ->where('r.user = :userId')
            ->andWhere('r.status IN (:statuses)')
            ->andWhere('r.createdAt > :cutoffDate')
            ->setFirstResult($offset)
            ->setParameter('userId', $userId)
            ->setParameter('statuses', [
                ReservationStatus::Paid->value,
            ])
            ->setParameter('cutoffDate', new \DateTimeImmutable('-5 year'))
            ->orderBy('r.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findHistoricByUserIdUnlimited(int $userId): array{
        {
            return $this->createQueryBuilder('r')
                ->where('r.user = :userId')
                ->andWhere('r.status IN (:statuses)')
                ->andWhere('r.createdAt > :cutoffDate')
                ->setParameter('userId', $userId)
                ->setParameter('statuses', [
                    ReservationStatus::Paid->value,
                ])
                ->setParameter('cutoffDate', new \DateTimeImmutable('-5 year'))
                ->orderBy('r.createdAt', 'DESC')
                ->getQuery()
                ->getResult();
        }
    }

    public function findHistoricByUserIdPagesCount(int $userId, int $limit = 3): int
    {
        return (int) ceil(
            $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.user = :userId')
            ->andWhere('r.status IN (:statuses)')
            ->andWhere('r.createdAt > :cutoffDate')
            ->setParameter('userId', $userId)
            ->setParameter('statuses', [
                ReservationStatus::Paid->value,
            ])
            ->setParameter('cutoffDate', new \DateTimeImmutable('-5 year'))
            ->getQuery()
            ->getSingleScalarResult() / $limit
        );
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

    public function findByUserId(int $userId, PageRequest $request, int $limit = 5): array
    {
        $page = 1;
        if (null !== $request->page) {
            $page = max(1, $request->page);
        }

        $offset = ($page - 1) * $limit;

        return $this->createQueryBuilder('r')
            ->where('r.user = :userId')
            ->setFirstResult($offset)
            ->setParameter('userId', $userId)
            ->orderBy('r.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult()
        ;
    }

    public function findByUserIdPagesCount(int $userId, int $limit = 5): int
    {
        return (int) ceil($this->createQueryBuilder('r')
            ->where('r.user = :userId')
            ->select('COUNT(r.id)')
            ->setParameter('userId', $userId)
            ->getQuery()
                ->getSingleScalarResult() / $limit);
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
