<?php

declare(strict_types=1);

namespace App\Exception;

use Symfony\Component\Validator\Exception\ValidationFailedException;

class ValidationFailedExceptionHandler
{
    /**
     * @return ValidationViolation[]
     */
    public function handle(ValidationFailedException $exception): array
    {
        $violations = [];
        foreach ($exception->getViolations() as $violation) {
            $property = $violation->getPropertyPath();
            if (preg_match('/^\[(\d+)\]\.(.+)$/', $property, $matches)) {
                $index = $matches[1];
                $propertyName = $matches[2];
            } else {
                $index = 0;
                $propertyName = $property;
            }

            $violations[] = new ValidationViolation(
                $propertyName,
                $violation->getMessage(),
                $index
            );
        }

        return $violations;
    }
}
