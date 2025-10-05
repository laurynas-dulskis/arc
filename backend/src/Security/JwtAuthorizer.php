<?php

declare(strict_types=1);

namespace App\Security;

use App\Service\PublicKeyService;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use UnexpectedValueException;

class JwtAuthorizer
{
    public function __construct(
        private readonly PublicKeyService $publicKeyService,
        #[Autowire('%jwt_algorithm%')]
        private readonly string $jwtAlgorithm,
        private readonly LoggerInterface $logger,
        private readonly Base64UrlDecoder $base64UrlDecoder,
    ) {
    }

    public function authorize(string $jwt): void
    {
        $parts = explode('.', $jwt);
        if (3 !== count($parts)) {
            throw new UnauthorizedHttpException('Bearer', 'Invalid JWT format');
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

        try {
            $header = json_decode($this->base64UrlDecoder->decode($encodedHeader), true);
            $payload = json_decode($this->base64UrlDecoder->decode($encodedPayload), true);
            $signature = $this->base64UrlDecoder->decode($encodedSignature);
        } catch (UnexpectedValueException $exception) {
            throw new UnauthorizedHttpException('Bearer', $exception->getMessage());
        }

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

        if (!isset($payload['exp'])) {
            throw new UnauthorizedHttpException('Bearer', 'JWT token does not have an expiration set');
        }

        if (time() >= $payload['exp']) {
            throw new UnauthorizedHttpException('Bearer', 'JWT token expired');
        }

        if (!isset($header['alg']) || $header['alg'] !== $this->jwtAlgorithm) {
            throw new UnauthorizedHttpException('Bearer', 'Unsupported JWT algorithm');
        }

        $verified = openssl_verify(
            $encodedHeader.'.'.$encodedPayload,
            $signature,
            $this->publicKeyService->getPublicKey(),
            OPENSSL_ALGO_SHA256
        );

        if (1 !== $verified) {
            throw new UnauthorizedHttpException('Bearer', 'Invalid JWT signature');
        }

        $this->logger->info('User authorized: ', [
            'id' => $payload['sub'],
            'email' => $payload['email'],
            'role' => $payload['role'],
        ]);
    }
}
