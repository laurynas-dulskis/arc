<?php

declare(strict_types=1);

namespace App\Exception;

use Exception;

class ValidationException extends Exception
{
    private array $violations = [];

    /**
     * @param ValidationViolation[] $violations
     */
    public function __construct(string $message, array $violations)
    {
        parent::__construct($message);
        $this->violations = $violations;
    }

    /**
     * @return ValidationViolation[]
     */
    public function getViolations(): array
    {
        return $this->violations;
    }
}
