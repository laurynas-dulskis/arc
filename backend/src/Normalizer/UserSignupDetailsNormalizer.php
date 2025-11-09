<?php

declare(strict_types=1);

namespace App\Normalizer;

use App\Entity\User;

class UserSignupDetailsNormalizer
{
    public function normalize(User $user): array
    {
        return [
            'email' => $user->getEmail(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'phoneNumber' => $user->getPhoneNumber(),
        ];
    }
}
