<?php

declare(strict_types=1);

namespace App\Service;

use Symfony\Component\Config\Definition\Exception\InvalidConfigurationException;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class PublicKeyService
{
    public function __construct(
        #[Autowire('%jwt_public_key_path%')]
        private readonly string $publicKeyPath,
    ) {
    }

    public function getPublicKey(): string
    {
        if (!is_string($this->publicKeyPath) || !file_exists($this->publicKeyPath)) {
            throw new InvalidConfigurationException('Public key configuration issue or file not found');
        }

        return file_get_contents($this->publicKeyPath);
    }
}
