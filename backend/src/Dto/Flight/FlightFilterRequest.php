<?php

declare(strict_types=1);

namespace App\Dto\Flight;

use DateTimeImmutable;

class FlightFilterRequest
{
    public ?string $from = null;

    public ?string $to = null;

    public ?DateTimeImmutable $dateFrom = null;

    public ?DateTimeImmutable $dateTo = null;
}
