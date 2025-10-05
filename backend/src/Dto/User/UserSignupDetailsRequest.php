<?php

declare(strict_types=1);

namespace App\Dto\User;

use Symfony\Component\Validator\Constraints as Assert;

class UserSignupDetailsRequest
{
    #[Assert\NotBlank]
    #[Assert\Email(message: "The email '{{ value }}' is not a valid email.")]
    public ?string $email = null;

    #[Assert\NotBlank]
    #[Assert\Length(
        min: 3,
        max: 30,
        minMessage: "First name must be at least {{ limit }} characters long",
        maxMessage: "First name cannot be longer than {{ limit }} characters"
    )]
    public ?string $firstName = null;

    #[Assert\NotBlank]
    #[Assert\Length(
        min: 3,
        max: 30,
        minMessage: "Last name must be at least {{ limit }} characters long",
        maxMessage: "Last name cannot be longer than {{ limit }} characters"
    )]
    public ?string $lastName = null;

    #[Assert\NotBlank]
    #[Assert\Regex(
        pattern: '/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,10}[-\s\.]?[0-9]{1,10}$/',
        message: "The phone number '{{ value }}' is not valid."
    )]
    public ?string $phoneNumber = null;
}
