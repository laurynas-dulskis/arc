<?php

declare(strict_types=1);

namespace App\Enum;

enum FlightClass: string
{
    case Economy = 'economy';
    case Business = 'business';
    case First = 'first';

    public static function values(): array
    {
        return array_map(static fn (self $status) => $status->value, self::cases());
    }
}
