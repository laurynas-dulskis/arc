<?php

declare(strict_types=1);

namespace App\Repository;

use App\Dto\Flight\FlightFilterRequest;
use App\Entity\Flight;
use DateTimeImmutable;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class FlightRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Flight::class);
    }

    public function findById(int $id): ?Flight
    {
        return $this->find($id);
    }

    /**
     * @return Flight[]
     */
    public function findAllFlights(FlightFilterRequest $request, int $limit = 10): array
    {
        $queryBuilder = $this->createQueryBuilder('f');

        if (null !== $request->from) {
            $queryBuilder->andWhere('f.origin = :origin')
                ->setParameter('origin', $request->from)
            ;
        }

        if (null !== $request->to) {
            $queryBuilder->andWhere('f.destination = :destination')
                ->setParameter('destination', $request->to)
            ;
        }

        if (null !== $request->dateFrom) {
            $queryBuilder->andWhere('f.departureTime >= :dateFrom')
                ->setParameter('dateFrom', $request->dateFrom)
            ;
        }

        if (null !== $request->dateTo) {
            $queryBuilder->andWhere('f.arrivalTime <= :dateTo')
                ->setParameter('dateTo', $request->dateTo)
            ;
        }

        $page = 1;
        if (null !== $request->page) {
            $page = max(1, $request->page);
        }

        $offset = ($page - 1) * $limit;

        return $queryBuilder
            ->andWhere('f.departureTime > :now')
            ->setParameter('now', new DateTimeImmutable())
            ->addOrderBy('f.departureTime', 'ASC')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult()
        ;
    }

    public function findAllFlightsPagesCount(FlightFilterRequest $request, int $limit = 10): int
    {
        $queryBuilder = $this->createQueryBuilder('f');

        if (null !== $request->from) {
            $queryBuilder->andWhere('f.origin = :origin')
                ->setParameter('origin', $request->from)
            ;
        }

        if (null !== $request->to) {
            $queryBuilder->andWhere('f.destination = :destination')
                ->setParameter('destination', $request->to)
            ;
        }

        if (null !== $request->dateFrom) {
            $queryBuilder->andWhere('f.departureTime >= :dateFrom')
                ->setParameter('dateFrom', $request->dateFrom)
            ;
        }

        if (null !== $request->dateTo) {
            $queryBuilder->andWhere('f.arrivalTime <= :dateTo')
                ->setParameter('dateTo', $request->dateTo)
            ;
        }

        $totalFlights = (int) $queryBuilder
            ->select('COUNT(f.id)')
            ->andWhere('f.departureTime > :now')
            ->setParameter('now', new DateTimeImmutable())
            ->getQuery()
            ->getSingleScalarResult()
        ;

        return (int) ceil($totalFlights / $limit);
    }
}
