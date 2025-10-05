<?php

declare(strict_types=1);

namespace App\Service;

use Symfony\Component\Config\Definition\Exception\InvalidConfigurationException;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class PrivateKeyService
{
    public function __construct(
        #[Autowire('%jwt_private_key_path%')]
        private readonly string $privateKeyPath,
    ) {
    }

    public function getPrivateKey(): string
    {
        if (!is_string($this->privateKeyPath) || !file_exists($this->privateKeyPath)) {
            throw new InvalidConfigurationException('Private key configuration issue or file not found');
        }

        return file_get_contents($this->privateKeyPath);
    }
}
