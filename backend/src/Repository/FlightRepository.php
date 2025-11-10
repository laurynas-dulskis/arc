<?php

declare(strict_types=1);

namespace App\Repository;

use App\Dto\Flight\FlightFilterRequest;
use App\Entity\Flight;
use App\Enum\FlightClass;
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

    public function findAllFlightsAll(): array
    {
        return $this->createQueryBuilder('f')
            ->orderBy('f.departureTime', 'DESC')
            ->getQuery()
            ->getResult()
        ;
    }

    /**
     * @return Flight[]
     */
    public function findFlightsBetweenDates(DateTimeImmutable $from, DateTimeImmutable $to): array{
        return $this->createQueryBuilder('f')
            ->andWhere('f.departureTime >= :from')
            ->andWhere('f.arrivalTime <= :to')
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->orderBy('f.departureTime', 'DESC')
            ->getQuery()
            ->getResult()
        ;
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

        if (null !== $request->class) {
            switch ($request->class) {
                case FlightClass::Economy->value:
                    if (null !== $request->seatCount) {
                        $queryBuilder->andWhere('f.seatsEconomy >= :seatCount')
                            ->setParameter('seatCount', $request->seatCount)
                        ;
                    }
                    if (null !== $request->priceRange) {
                        [$minPrice, $maxPrice] = explode('-', $request->priceRange);
                        $queryBuilder->andWhere('f.basePriceCentsEconomy BETWEEN :minPrice AND :maxPrice')
                            ->setParameter('minPrice', (int) $minPrice * 100)
                            ->setParameter('maxPrice', (int) $maxPrice * 100)
                        ;
                    }
                    break;
                case FlightClass::Business->value:
                    if (null !== $request->seatCount) {
                        $queryBuilder->andWhere('f.seatsBusiness >= :seatCount')
                            ->setParameter('seatCount', $request->seatCount)
                        ;
                    }
                    if (null !== $request->priceRange) {
                        [$minPrice, $maxPrice] = explode('-', $request->priceRange);
                        $queryBuilder->andWhere('f.basePriceCentsBusiness BETWEEN :minPrice AND :maxPrice')
                            ->setParameter('minPrice', (int) $minPrice * 100)
                            ->setParameter('maxPrice', (int) $maxPrice * 100)
                        ;
                    }
                    break;
                case FlightClass::First->value:
                    if (null !== $request->seatCount) {
                        $queryBuilder->andWhere('f.seatsFirstClass >= :seatCount')
                            ->setParameter('seatCount', $request->seatCount)
                        ;
                    }
                    if (null !== $request->priceRange) {
                        [$minPrice, $maxPrice] = explode('-', $request->priceRange);
                        $queryBuilder->andWhere('f.basePriceCentsFirstClass BETWEEN :minPrice AND :maxPrice')
                            ->setParameter('minPrice', (int) $minPrice * 100)
                            ->setParameter('maxPrice', (int) $maxPrice * 100)
                        ;
                    }
                    break;
            }
        } else {
            if (null !== $request->seatCount) {
                $queryBuilder->andWhere('f.seatsEconomy >= :seatCount OR f.seatsBusiness >= :seatCount OR f.seatsFirstClass >= :seatCount')
                    ->setParameter('seatCount', $request->seatCount)
                ;
            }

            if (null !== $request->priceRange) {
                [$minPrice, $maxPrice] = explode('-', $request->priceRange);
                $queryBuilder->andWhere('(f.basePriceCentsEconomy BETWEEN :minPrice AND :maxPrice) OR (f.basePriceCentsBusiness BETWEEN :minPrice AND :maxPrice) OR (f.basePriceCentsFirstClass BETWEEN :minPrice AND :maxPrice)')
                    ->setParameter('minPrice', (int) $minPrice * 100)
                    ->setParameter('maxPrice', (int) $maxPrice * 100)
                ;
            }
        }

        $page = 1;
        if (null !== $request->page) {
            $page = max(1, $request->page);
        }

        $offset = ($page - 1) * $limit;

        if ('cheapest' === $request->sort) {
            $queryBuilder
                ->addOrderBy('f.basePriceCentsEconomy', 'ASC')
                ->addOrderBy('f.basePriceCentsBusiness', 'ASC')
                ->addOrderBy('f.basePriceCentsFirstClass', 'ASC')
            ;
        }

        if ('most_expensive' === $request->sort) {
            $queryBuilder
                ->addOrderBy('f.basePriceCentsFirstClass', 'DESC')
                ->addOrderBy('f.basePriceCentsBusiness', 'DESC')
                ->addOrderBy('f.basePriceCentsEconomy', 'DESC')
            ;
        }

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

        if (null !== $request->class) {
            switch ($request->class) {
                case FlightClass::Economy->value:
                    if (null !== $request->seatCount) {
                        $queryBuilder->andWhere('f.seatsEconomy >= :seatCount')
                            ->setParameter('seatCount', $request->seatCount)
                        ;
                    }
                    if (null !== $request->priceRange) {
                        [$minPrice, $maxPrice] = explode('-', $request->priceRange);
                        $queryBuilder->andWhere('f.basePriceCentsEconomy BETWEEN :minPrice AND :maxPrice')
                            ->setParameter('minPrice', (int) $minPrice * 100)
                            ->setParameter('maxPrice', (int) $maxPrice * 100)
                        ;
                    }
                    break;
                case FlightClass::Business->value:
                    if (null !== $request->seatCount) {
                        $queryBuilder->andWhere('f.seatsBusiness >= :seatCount')
                            ->setParameter('seatCount', $request->seatCount)
                        ;
                    }
                    if (null !== $request->priceRange) {
                        [$minPrice, $maxPrice] = explode('-', $request->priceRange);
                        $queryBuilder->andWhere('f.basePriceCentsBusiness BETWEEN :minPrice AND :maxPrice')
                            ->setParameter('minPrice', (int) $minPrice * 100)
                            ->setParameter('maxPrice', (int) $maxPrice * 100)
                        ;
                    }
                    break;
                case FlightClass::First->value:
                    if (null !== $request->seatCount) {
                        $queryBuilder->andWhere('f.seatsFirstClass >= :seatCount')
                            ->setParameter('seatCount', $request->seatCount)
                        ;
                    }
                    if (null !== $request->priceRange) {
                        [$minPrice, $maxPrice] = explode('-', $request->priceRange);
                        $queryBuilder->andWhere('f.basePriceCentsFirstClass BETWEEN :minPrice AND :maxPrice')
                            ->setParameter('minPrice', (int) $minPrice * 100)
                            ->setParameter('maxPrice', (int) $maxPrice * 100)
                        ;
                    }
                    break;
            }
        } else {
            if (null !== $request->seatCount) {
                $queryBuilder->andWhere('f.seatsEconomy >= :seatCount OR f.seatsBusiness >= :seatCount OR f.seatsFirstClass >= :seatCount')
                    ->setParameter('seatCount', $request->seatCount)
                ;
            }

            if (null !== $request->priceRange) {
                [$minPrice, $maxPrice] = explode('-', $request->priceRange);
                $queryBuilder->andWhere('(f.basePriceCentsEconomy BETWEEN :minPrice AND :maxPrice) OR (f.basePriceCentsBusiness BETWEEN :minPrice AND :maxPrice) OR (f.basePriceCentsFirstClass BETWEEN :minPrice AND :maxPrice)')
                    ->setParameter('minPrice', (int) $minPrice * 100)
                    ->setParameter('maxPrice', (int) $maxPrice * 100)
                ;
            }
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
