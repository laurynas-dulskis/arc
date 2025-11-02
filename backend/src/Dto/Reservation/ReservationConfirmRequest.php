<?php

declare(strict_types=1);

namespace App\Dto\Reservation;

use DateTimeImmutable;
use Symfony\Component\Validator\Constraints as Assert;

class ReservationConfirmRequest
{
    #[Assert\NotBlank]
    #[Assert\GreaterThanOrEqual(0)]
    public ?int $ticketId = null;

    #[Assert\NotBlank]
    #[Assert\Regex(pattern: '/^[a-zA-Z\s]+$/', message: 'Passenger name must contain only letters and spaces.')]
    public ?string $passengerName = null;

    #[Assert\NotBlank]
    #[Assert\Type(DateTimeImmutable::class)]
    #[Assert\LessThan('today', message: 'Passenger date of birth must be in the past.')]
    public ?DateTimeImmutable $passengerDob = null;
}
