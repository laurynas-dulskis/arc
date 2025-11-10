<?php

declare(strict_types=1);

namespace App\Enum;

enum ReportType: string
{
    case Routes = 'routes';
    case Flights = 'flights';

    public static function values(): array
    {
        return array_map(static fn (self $status) => $status->value, self::cases());
    }
}