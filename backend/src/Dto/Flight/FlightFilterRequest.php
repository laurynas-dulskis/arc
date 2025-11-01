<?php

declare(strict_types=1);

namespace App\Dto\Flight;

use App\Enum\FlightClass;
use DateTimeImmutable;
use Symfony\Component\Validator\Constraints as Assert;

class FlightFilterRequest
{
    public ?string $from = null;

    public ?string $to = null;

    public ?DateTimeImmutable $dateFrom = null;

    public ?DateTimeImmutable $dateTo = null;

    #[Assert\GreaterThan(0)]
    public ?int $seatCount = null;

    #[Assert\Choice(
        callback: [FlightClass::class, 'values'],
        message: 'Class must be one of: {{ choices }}'
    )]
    public ?string $class = null;

    #[Assert\Regex(
        pattern: '/^\d+-\d+$/',
        message: "The price range '{{ value }}' is not valid. It should be in the format 'min-max'."
    )]
    public ?string $priceRange = null;

    public ?string $sort = null;

    public ?int $page = null;
}
