<?php

declare(strict_types=1);

namespace App\Exception;

use Exception;

class EntityNotFoundException extends Exception
{
    private array $context = [];

    public function __construct(string $message, array $context)
    {
        parent::__construct($message);
        $this->context = $context;
    }

    public function getContext(): array
    {
        return $this->context;
    }
}
