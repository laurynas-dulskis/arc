<?php

declare(strict_types=1);

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class GoogleCallbackRequest
{
    public function __construct(
        #[Assert\NotBlank]
        public readonly ?string $code = null,

        #[Assert\NotBlank]
        public readonly ?string $state = null,
    ) {
    }
}
