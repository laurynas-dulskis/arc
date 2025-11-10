<?php

declare(strict_types=1);

namespace App\Service\User;

use App\Dto\PageRequest;
use App\Exception\EntityNotFoundException;
use App\Normalizer\UserNormalizer;
use App\Normalizer\UserSignupDetailsNormalizer;
use App\Repository\UserRepository;

class UserQueryService
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly UserSignupDetailsNormalizer $userSignupDetailsNormalizer,
        private readonly UserNormalizer $userNormalizer,
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

    public function getAll(PageRequest $request): array
    {
        $users = $this->userRepository->findAllCustom($request);

        return array_map(
            fn ($user) => $this->userNormalizer->normalize($user),
            $users
        );
    }

    public function getAllPagesCount(): array
    {
        return [
            'pages' => $this->userRepository->findAllCustomPagesCount(),
        ];
    }

    public function getOne(int $userId): array
    {
        $user = $this->userRepository->findById($userId);
        if (null === $user) {
            throw new EntityNotFoundException('Flight not found', ['id' => $userId]);
        }

        return $this->userNormalizer->normalize($user);
    }
}
