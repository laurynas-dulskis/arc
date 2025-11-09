<?php

declare(strict_types=1);

namespace App\Validator;

use App\Enum\UserRole;
use App\Exception\EntityNotFoundException;
use App\Repository\UserRepository;
use App\Security\UserToken;
use Exception;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class AccessValidator
{
    public function __construct(
        private readonly UserRepository $userRepository,
    ) {
    }

    public function validateTokenBelongsToUserId(UserToken $token, int $userId): void
    {
        $user = $this->userRepository->findById($userId);

        if (null === $user) {
            throw new EntityNotFoundException('User not found', ['id' => $userId]);
        }

        if ($token->id !== $userId) {
            throw new UnauthorizedHttpException('Bearer', 'Access denied');
        }
    }

    public function validateTokenDoesNotBelongsToUserId(UserToken $token, int $userId): void
    {
        $user = $this->userRepository->findById($userId);

        if (null === $user) {
            throw new EntityNotFoundException('User not found', ['id' => $userId]);
        }

        if ($token->id === $userId) {
            throw new Exception('Users cannot perform this action on themselves');
        }
    }

    public function validateIsAdmin(UserToken $token): void
    {
        if (UserRole::Admin !== $token->role) {
            throw new UnauthorizedHttpException('Bearer', 'Access denied');
        }
    }

    public function validateIsAgent(UserToken $token): void
    {
        if (UserRole::BoardingAgent === $token->role) {
          return;
        }

        if (UserRole::Admin === $token->role) {
            return;
        }

        throw new UnauthorizedHttpException('Bearer', 'Access denied');
    }
}
