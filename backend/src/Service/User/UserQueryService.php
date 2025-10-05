<?php

declare(strict_types=1);

namespace App\Service\User;

use App\Exception\EntityNotFoundException;
use App\Normalizer\UserSignupDetailsNormalizer;
use App\Repository\UserRepository;

class UserQueryService
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly UserSignupDetailsNormalizer $userSignupDetailsNormalizer,
    ) {
    }

    public function getOneSignUpDetails(int $userId): array
    {
        $user = $this->userRepository->findById($userId);

        if (null === $user) {
            throw new EntityNotFoundException('Flight not found', ['id' => $userId]);
        }

        return $this->userSignupDetailsNormalizer->normalize($user);
    }
}
