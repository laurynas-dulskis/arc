<?php

declare(strict_types=1);

namespace App\Dto\Flight;

use DateTimeImmutable;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

class FlightUpdateRequest
{
    #[Assert\NotBlank]
    #[Assert\Length(min: 5)]
    #[Assert\Type('string')]
    public ?string $flightNumber = null;

    #[Assert\NotBlank]
    #[Assert\Regex(pattern: '/^[A-Z]{3}$/')]
    #[Assert\Type('string')]
    public ?string $origin = null;

    #[Assert\NotBlank]
    #[Assert\Regex(pattern: '/^[A-Z]{3}$/')]
    #[Assert\Type('string')]
    public ?string $destination = null;

    #[Assert\NotNull]
    #[Assert\Type(DateTimeImmutable::class)]
    public ?DateTimeImmutable $departureTime = null;

    #[Assert\NotNull]
    #[Assert\Type(DateTimeImmutable::class)]
    public ?DateTimeImmutable $arrivalTime = null;

    #[Assert\NotNull]
    #[Assert\GreaterThan(0)]
    #[Assert\Type('int')]
    public ?int $durationMinutes = null;

    #[Assert\NotNull]
    #[Assert\GreaterThan(0)]
    #[Assert\Type('int')]
    public ?int $basePriceCents = null;

    #[Assert\NotNull]
    #[Assert\GreaterThan(0)]
    #[Assert\Type('int')]
    public ?int $seatsTotal = null;

    #[Assert\NotNull]
    #[Assert\GreaterThanOrEqual(0)]
    #[Assert\Type('int')]
    public ?int $seatsAvailable = null;

    #[Assert\Callback]
    public function validateTimes(ExecutionContextInterface $context): void
    {
        if ($this->departureTime && $this->arrivalTime && $this->departureTime >= $this->arrivalTime) {
            $context->buildViolation('Departure time must be before arrival time')
                ->atPath('departureTime')
                ->addViolation()
            ;
        }
    }
}
