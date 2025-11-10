<?php

declare(strict_types=1);

namespace App\Repository;

use App\Dto\PageRequest;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function findAllCustom(PageRequest $request, int $limit = 1): array{
        $page = 1;
        if (null !== $request->page) {
            $page = max(1, $request->page);
        }

        $offset = ($page - 1) * $limit;

        return $this->createQueryBuilder('u')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult()
        ;
    }

    public function findAllCustomPagesCount(int $limit = 1): int {
        return (int) ceil( $this->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->getQuery()
                ->getSingleScalarResult() / $limit);

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
