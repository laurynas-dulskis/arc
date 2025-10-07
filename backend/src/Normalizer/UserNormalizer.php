<?php

declare(strict_types=1);

namespace App\Normalizer;

use App\Entity\User;

class UserNormalizer
{
    public function normalize(User $user): array
    {
        return [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'phoneNumber' => $user->getPhoneNumber(),
            'role' => $user->getRole(),
            'signupCompleted' => $user->isSignupCompleted(),
        ];
    }
}
