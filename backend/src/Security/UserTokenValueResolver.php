<?php

declare(strict_types=1);

namespace App\Security;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\ControllerMetadata\ArgumentMetadata;

class UserTokenValueResolver
{
    public function __construct(
        private readonly JwtUserTokenExtractor $jwtUserTokenExtractor,
    ) {
    }

    public function resolve(Request $request, ArgumentMetadata $argument): iterable
    {
        if (UserToken::class !== $argument->getType()) {
            return [];
        }

        yield $this->jwtUserTokenExtractor->extractUserFromRequest($request);
    }
}
