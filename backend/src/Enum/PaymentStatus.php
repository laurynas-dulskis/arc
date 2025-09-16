<?php

declare(strict_types=1);

namespace App\Enum;

enum PaymentStatus: string
{
    case Pending = 'Pending';
    case Successful = 'Successful';
    case Failed = 'Failed';

    public static function values(): array
    {
        return array_map(static fn (self $status) => $status->value, self::cases());
    }
}
