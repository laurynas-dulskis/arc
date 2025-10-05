<?php

declare(strict_types=1);

namespace App\Security;

use UnexpectedValueException;

class Base64UrlDecoder
{
    public function decode(string $data): string
    {
        $decodedData = base64_decode(strtr($data, '-_', '+/'), true);

        if (false === $decodedData) {
            throw new UnexpectedValueException('Invalid base64url encoding');
        }

        return $decodedData;
    }
}
