<?php

declare(strict_types=1);

namespace App\Enum;

enum ServiceType: string
{
    case Baggage = 'Baggage';
    case SeatSelection = 'SeatSelection';
    case Meal = 'Meal';
    case Insurance = 'Insurance';

    public static function values(): array
    {
        return array_map(static fn (self $type) => $type->value, self::cases());
    }
}
