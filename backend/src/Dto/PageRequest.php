<?php

declare(strict_types=1);

namespace App\Dto;


class PageRequest
{
    public function __construct(
        public ?int $page = null
    ) {
    }
}
