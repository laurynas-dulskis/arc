<?php

declare(strict_types=1);

namespace App\Response;

use Symfony\Component\HttpFoundation\JsonResponse;

class JsonRedirectResponse extends JsonResponse
{
    public function __construct(string $redirectUrl, array $headers = [])
    {
        $data = ['redirect' => $redirectUrl];
        $headers['Location'] = $redirectUrl;

        parent::__construct($data, 302, $headers);
    }
}
