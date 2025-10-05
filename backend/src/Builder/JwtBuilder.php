<?php

declare(strict_types=1);

namespace App\Builder;

use App\Enum\UserRole;
use App\Service\PrivateKeyService;
use RuntimeException;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class JwtBuilder
{
    private ?int $userId = null;
    private ?string $userEmail = null;
    private ?string $userName = null;
    private ?string $userSurname = null;
    private ?UserRole $userRole = null;
    private ?bool $signupCompleted = null;

    public function __construct(
        private readonly PrivateKeyService $privateKeyService,
        #[Autowire('%jwt_expiration_in_seconds%')]
        private readonly int $jwtExpirationInSeconds,
        private readonly string $jwtAlgorithm = 'RS256',
        private readonly string $jwtTokenType = 'JWT',
    ) {
    }

    public function setId(int $userId): self
    {
        $this->userId = $userId;

        return $this;
    }

    public function setEmail(string $userEmail): self
    {
        $this->userEmail = $userEmail;

        return $this;
    }

    public function setRole(UserRole $userRole): self
    {
        $this->userRole = $userRole;

        return $this;
    }

    public function setName(string $userName): self
    {
        $this->userName = $userName;

        return $this;
    }

    public function setSurname(string $userSurname): self
    {
        $this->userSurname = $userSurname;

        return $this;
    }

    public function setSignupCompleted(bool $signupCompleted): self
    {
        $this->signupCompleted = $signupCompleted;

        return $this;
    }

    public function build(): string
    {
        if (
            null === $this->userId
            || null === $this->userEmail
            || null === $this->userRole
            || null === $this->userName
            || null === $this->userSurname
            || null === $this->signupCompleted
        ) {
            throw new RuntimeException('User info must be set before building the JWT');
        }

        $base64UrlHeader = $this->base64UrlEncode(json_encode(
            [
                'alg' => $this->jwtAlgorithm,
                'typ' => $this->jwtTokenType,
            ]
        ));

        $base64UrlPayload = $this->base64UrlEncode(json_encode(
            [
                'sub' => $this->userId,
                'email' => $this->userEmail,
                'name' => $this->userName,
                'surname' => $this->userSurname,
                'role' => $this->userRole->value,
                'signupCompleted' => $this->signupCompleted,
                'iat' => time(),
                'exp' => time() + $this->jwtExpirationInSeconds,
            ]
        ));

        $signature = '';
        openssl_sign(
            $base64UrlHeader.'.'.$base64UrlPayload,
            $signature,
            $this->privateKeyService->getPrivateKey(),
            OPENSSL_ALGO_SHA256
        );

        $base64UrlSignature = $this->base64UrlEncode($signature);

        return $base64UrlHeader.'.'.$base64UrlPayload.'.'.$base64UrlSignature;
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
