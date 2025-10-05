<?php

declare(strict_types=1);

namespace App\Normalizer;

use App\Exception\ValidationViolation;

class ValidationViolationNormalizer
{
    public function normalize(ValidationViolation $validationViolation): array
    {
        return [
            'index' => $validationViolation->index,
            'property_name' => $validationViolation->propertyName,
            'message' => $validationViolation->message,
        ];
    }
}
