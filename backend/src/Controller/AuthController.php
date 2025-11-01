<?php

declare(strict_types=1);

namespace App\Controller;

use App\Response\JsonRedirectResponse;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpKernel\Attribute\MapQueryString;
use Symfony\Component\HttpFoundation\Response;
use App\Service\GoogleAuthService;
use App\Dto\GoogleCallbackRequest;
use Throwable;

#[Route('/auth')]
class AuthController
{
    public function __construct(
        private readonly GoogleAuthService $googleAuthService,
        #[Autowire('%portal_url%')]
        private readonly string $portalUrl,
    ) {
    }

    #[Route(methods: ['GET'])]
    public function redirectToGoogle(): JsonRedirectResponse
    {
        return new JsonRedirectResponse($this->googleAuthService->getAuthorizationUrl());
    }

    #[Route('/google-callback', methods: ['GET'])]
    public function handleGoogleCallback(
        #[MapQueryString(
            validationFailedStatusCode: Response::HTTP_BAD_REQUEST
        )] GoogleCallbackRequest $googleCallbackRequest,
    ): JsonRedirectResponse {
        try {
            $accessTokenCookie = $this->googleAuthService->authenticate(
                $googleCallbackRequest->code,
                $googleCallbackRequest->state
            );

            $response = new JsonRedirectResponse($this->portalUrl);
            $response->headers->setCookie($accessTokenCookie);

            return $response;
        } catch (Throwable $e) {
            return new JsonRedirectResponse(
                $this->portalUrl.'?error='.urlencode('You dont have access to this application.'),
            );
        }
    }
}
