<?php

declare(strict_types=1);

namespace App\Exception;

class ValidationViolation
{
    public function __construct(
        public readonly string $propertyName,
        public readonly string $message,
        public readonly int $index = 0,
    ) {
    }
}
