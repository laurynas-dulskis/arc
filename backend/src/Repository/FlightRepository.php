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
    public function findAllFlights(FlightFilterRequest $request): array
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

        return $queryBuilder
            ->andWhere('f.departureTime > :now')
            ->setParameter('now', new DateTimeImmutable())
            ->addOrderBy('f.departureTime', 'ASC')
            ->getQuery()
            ->getResult()
        ;
    }
}
