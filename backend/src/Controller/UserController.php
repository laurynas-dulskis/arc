<?php

declare(strict_types=1);

namespace App\Controller;

use App\Dto\User\UserSignupDetailsRequest;
use App\Dto\User\UserUpdateRequest;
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

    #[Route(name: 'get_all', methods: ['GET'])]
    public function getAll(UserToken $userToken): JsonResponse
    {
        $this->accessValidator->validateIsAdmin($userToken);

        return new JsonResponse(
            $this->userQueryService->getAll(),
            Response::HTTP_OK
        );
    }

    #[Route('/{userId}', name: 'update_user', methods: ['PUT'])]
    public function updateUser(
        int $userId,
        UserToken $userToken,
        #[MapRequestPayload] UserUpdateRequest $request,
    ): JsonResponse {
        $this->accessValidator->validateIsAdmin($userToken);
        $this->accessValidator->validateTokenDoesNotBelongsToUserId($userToken, $userId);

        return new JsonResponse(
            $this->userQueryService->getOne(
                $this->userComandService->update($request, $userId)
            ),
            Response::HTTP_OK
        );
    }

    #[Route('/{userId}', name: 'delete_user', methods: ['DELETE'])]
    public function deleteUser(int $userId, UserToken $userToken): JsonResponse
    {
        $this->accessValidator->validateIsAdmin($userToken);
        $this->accessValidator->validateTokenDoesNotBelongsToUserId($userToken, $userId);

        $this->userComandService->delete($userId);

        return new JsonResponse(status: Response::HTTP_NO_CONTENT);
    }
}
