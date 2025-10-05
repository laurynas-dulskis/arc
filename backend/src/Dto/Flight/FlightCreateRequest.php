<?php

declare(strict_types=1);

namespace App\Dto\Flight;

use DateTimeImmutable;
use Symfony\Component\Validator\Constraints as Assert;

class FlightCreateRequest
{
    #[Assert\NotBlank]
    #[Assert\Type('string')]
    public ?string $flightNumber = null;

    #[Assert\NotBlank]
    #[Assert\Type('string')]
    public ?string $origin = null;

    #[Assert\NotBlank]
    #[Assert\Type('string')]
    public ?string $destination = null;

    #[Assert\NotNull]
    #[Assert\Type(DateTimeImmutable::class)]
    public ?DateTimeImmutable $departureTime = null;

    #[Assert\NotNull]
    #[Assert\Type(DateTimeImmutable::class)]
    public ?DateTimeImmutable $arrivalTime = null;

    #[Assert\NotNull]
    #[Assert\Type('int')]
    public ?int $durationMinutes = null;

    #[Assert\NotNull]
    #[Assert\Type('int')]
    public ?int $basePriceCents = null;

    #[Assert\NotNull]
    #[Assert\Type('int')]
    public ?int $seatsTotal = null;

    #[Assert\NotNull]
    #[Assert\Type('int')]
    public ?int $seatsAvailable = null;
}
