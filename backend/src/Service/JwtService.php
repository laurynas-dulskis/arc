<?php

declare(strict_types=1);

namespace App\Service;

use App\Builder\JwtBuilder;
use App\Entity\User;

class JwtService
{
    public function __construct(
        private readonly JwtBuilder $builder,
    ) {
    }

    public function createAccessToken(User $user): string
    {
        return $this->builder
            ->setId($user->getId())
            ->setEmail($user->getEmail())
            ->setName($user->getFirstName())
            ->setSurname($user->getLastName())
            ->setRole($user->getRole())
            ->setSignupCompleted($user->isSignupCompleted())
            ->build()
        ;
    }
}
