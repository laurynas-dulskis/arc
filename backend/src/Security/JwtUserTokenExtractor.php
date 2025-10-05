<?php

declare(strict_types=1);

namespace App\Security;

use App\Enum\UserRole;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Throwable;

class JwtUserTokenExtractor
{
    public function __construct(
        private readonly Base64UrlDecoder $base64UrlDecoder,
    ) {
    }

    public function extractUserFromRequest(Request $request): UserToken
    {
        if (!$request->cookies->has('access_token')) {
            throw new UnauthorizedHttpException('Bearer', 'Missing access_token cookie');
        }

        $parts = explode(
            '.',
            $request->cookies->get('access_token')
        );

        if (3 !== count($parts)) {
            throw new UnauthorizedHttpException('Bearer', 'Invalid JWT format');
        }

        $payload = json_decode($this->base64UrlDecoder->decode($parts[1]), true);

        if (!isset($payload['sub'])) {
            throw new UnauthorizedHttpException('Bearer', 'JWT token does not have a subject set');
        }

        if (!isset($payload['email'])) {
            throw new UnauthorizedHttpException('Bearer', 'JWT token does not have an email set');
        }

        if (!isset($payload['role'])) {
            throw new UnauthorizedHttpException('Bearer', 'JWT token does not have roles set');
        }

        if (!isset($payload['name'])) {
            throw new UnauthorizedHttpException('Bearer', 'JWT token does not have a name set');
        }

        if (!isset($payload['surname'])) {
            throw new UnauthorizedHttpException('Bearer', 'JWT token does not have a surname set');
        }

        if (!isset($payload['signupCompleted'])) {
            throw new UnauthorizedHttpException('Bearer', 'JWT token does not have signupCompleted set');
        }
        try {
            return new UserToken(
                $payload['sub'],
                $payload['email'],
                $payload['name'],
                $payload['surname'],
                UserRole::from($payload['role']),
                $payload['signupCompleted'],
            );
        } catch (Throwable $exception) {
            throw new UnauthorizedHttpException('Bearer', $exception->getMessage());
        }
    }
}
