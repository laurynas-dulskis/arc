<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Security\JwtAuthorizer;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use UnexpectedValueException;

class RequestListener
{
    private array $excludedPaths = [
        [
            'path' => '/auth',
            'method' => 'get',
        ],
        [
            'path' => '/auth/google-callback',
            'method' => 'get',
        ],
        [
            'path' => '/flights',
            'method' => 'get',
        ],
        [
            'path' => '/flights/pages',
            'method' => 'get',
        ],
    ];

    public function __construct(
        private readonly JwtAuthorizer $JwtAuthorizer,
    ) {
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();

        foreach ($this->excludedPaths as $excludedPath) {
            if (
                $request->getPathInfo() === $excludedPath['path']
                && strtolower($request->getMethod()) === strtolower($excludedPath['method'])
            ) {
                return;
            }
        }

        if (!$request->cookies->has('access_token')) {
            throw new UnauthorizedHttpException('Bearer', 'Missing access_token cookie');
        }

        try {
            $this->JwtAuthorizer->authorize(
                $request->cookies->get('access_token')
            );
        } catch (UnexpectedValueException $exception) {
            throw new UnauthorizedHttpException('Bearer', $exception->getMessage());
        }
    }
}
