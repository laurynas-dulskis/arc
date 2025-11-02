<?php

declare(strict_types=1);

namespace App\Dto\Reservation;

use Symfony\Component\Validator\Constraints as Assert;

class UserReservationCreateRequest
{
    #[Assert\NotBlank]
    #[Assert\GreaterThanOrEqual(0)]
    public ?int $flightId = null;

    #[Assert\NotBlank]
    #[Assert\GreaterThanOrEqual(0)]
    public ?int $selectedEconomy = null;

    #[Assert\NotBlank]
    #[Assert\GreaterThanOrEqual(0)]
    public ?int $selectedBusiness = null;

    #[Assert\NotBlank]
    #[Assert\GreaterThanOrEqual(0)]
    public ?int $selectedFirstClass = null;
}
