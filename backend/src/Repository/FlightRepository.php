<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Flight;
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
    public function findAllFlights(): array
    {
        return $this->createQueryBuilder('f')
            ->getQuery()
            ->getResult()
        ;
    }
}
