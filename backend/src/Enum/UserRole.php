<?php

declare(strict_types=1);

namespace App\Enum;

enum UserRole: string
{
    case User = 'User';
    case Admin = 'Admin';

    public static function values(): array
    {
        return array_map(static fn (self $role) => $role->value, self::cases());
    }
}
