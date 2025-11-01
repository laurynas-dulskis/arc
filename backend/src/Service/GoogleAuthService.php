<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\User;
use App\Enum\UserRole;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use League\OAuth2\Client\Provider\Google;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class GoogleAuthService
{
    public function __construct(
        #[Autowire('%google_client_id%')]
        private readonly string $googleClientId,
        #[Autowire('%google_redirect_uri%')]
        private readonly string $googleRedirectUri,
        #[Autowire('%google_client_secret%')]
        private readonly string $googleClientSecret,
        private readonly JwtService $jwtService,
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly RequestStack $requestStack,
    ) {
    }

    public function getAuthorizationUrl(): string
    {
        $provider = new Google([
            'clientId' => $this->googleClientId,
            'clientSecret' => $this->googleClientSecret,
            'redirectUri' => $this->googleRedirectUri,
        ]);

        $authorizationUrl = $provider->getAuthorizationUrl();
        $this->requestStack->getSession()->set('oauth2state', $provider->getState());

        return $authorizationUrl;
    }

    public function authenticate(string $code, string $state): Cookie
    {
        if (!$this->isValidState($state)) {
            throw new UnauthorizedHttpException('Invalid state parameter');
        }

        $provider = new Google([
            'clientId' => $this->googleClientId,
            'clientSecret' => $this->googleClientSecret,
            'redirectUri' => $this->googleRedirectUri,
        ]);

        $accessToken = $provider->getAccessToken('authorization_code', [
            'code' => $code,
        ]);

        $resourceOwner = $provider->getResourceOwner($accessToken);
        $googleUser = $resourceOwner->toArray();

        $user = $this->userRepository->findByGoogleId($googleUser['sub']);

        if (null === $user) {
            $user = new User();
            $user->setGoogleId($googleUser['sub'])
                ->setEmail($googleUser['email'])
                ->setFirstName($googleUser['given_name'])
                ->setLastName($googleUser['family_name'] ?? '')
                ->setRole(UserRole::User)
            ;

            $this->entityManager->persist($user);
            $this->entityManager->flush();
        }

        if (UserRole::Disabled === $user->getRole()) {
            throw new UnauthorizedHttpException('User account is disabled');
        }

        $jwtToken = $this->jwtService->createAccessToken($user);

        return new Cookie(
            'access_token',
            $jwtToken,
            strtotime('+8 hours'),
            '/',
            null,
            null,
            false
        );
    }

    private function isValidState(string $state): bool
    {
        $session = $this->requestStack->getSession();
        $storedState = $session->get('oauth2state');

        if (null === $storedState || $storedState !== $state) {
            return false;
        }

        $session->remove('oauth2state');

        return true;
    }
}
