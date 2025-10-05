<?php

declare(strict_types=1);

namespace App\Security;

use App\Enum\UserRole;

class UserToken
{
    public function __construct(
        public readonly int $id,
        public readonly string $email,
        public readonly string $name,
        public readonly string $surname,
        public readonly UserRole $role,
        public readonly bool $signupCompleted,
    ) {
    }
}
