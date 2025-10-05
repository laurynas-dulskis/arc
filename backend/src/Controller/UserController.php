<?php

declare(strict_types=1);

namespace App\Controller;

use App\Dto\User\UserSignupDetailsRequest;
use App\Security\UserToken;
use App\Service\User\UserComandService;
use App\Service\User\UserQueryService;
use App\Validator\AccessValidator;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/users')]
class UserController
{
    public function __construct(
        private readonly UserQueryService $userQueryService,
        private readonly UserComandService $userComandService,
        private readonly AccessValidator $accessValidator,
    ) {
    }

    #[Route('/signup/{userId}', name: 'user_get_signup_details', methods: ['GET'])]
    public function getDetails(int $userId, UserToken $userToken): JsonResponse
    {
        $this->accessValidator->validateTokenBelongsToUserId($userToken, $userId);

        return new JsonResponse(
            $this->userQueryService->getOneSignUpDetails($userId),
            Response::HTTP_OK
        );
    }

    #[Route('/signup/{userId}', name: 'update_user_details', methods: ['PUT'])]
    public function updateDetails(
        int $userId,
        UserToken $userToken,
        #[MapRequestPayload] UserSignupDetailsRequest $request): JsonResponse
    {
        $this->accessValidator->validateTokenBelongsToUserId($userToken, $userId);

        return new JsonResponse(
            $this->userQueryService->getOneSignUpDetails(
                $this->userComandService->updateDetails($request, $userId)
            ),
            Response::HTTP_OK
        );
    }
}
