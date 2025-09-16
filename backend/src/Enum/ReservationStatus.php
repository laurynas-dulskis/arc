<?php

declare(strict_types=1);

namespace App\Enum;

enum ReservationStatus: string
{
    case Reserved = 'Reserved';
    case Paid = 'Paid';
    case Cancelled = 'Cancelled';

    public static function values(): array
    {
        return array_map(static fn (self $status) => $status->value, self::cases());
    }
}
