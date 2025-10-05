<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function findByGoogleId(string $googleId): ?User
    {
        return $this->createQueryBuilder('u')
            ->where('u.googleId = :googleId')
            ->setParameter('googleId', $googleId)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }

    public function findById(int $id): ?User
    {
        return $this->createQueryBuilder('u')
            ->where('u.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
}
