<?php

declare(strict_types=1);

namespace App\Controller;

use App\Security\UserToken;
use App\Service\BoardingPass\BoardingPassQueryService;
use App\Validator\AccessValidator;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/boarding')]
class BoardingPassController
{
    public function __construct(
        private readonly AccessValidator $accessValidator,
        private readonly BoardingPassQueryService $boardingPassQueryService,
    ){
    }

    #[Route('/all/{id}', name: 'get_flight_boarding_passes', methods: ['GET'])]
    public function getCollectionAll(
        int $id,
        UserToken $userToken,
    ): JsonResponse {
        $this->accessValidator->validateIsAgent($userToken);

        return new JsonResponse(
            $this->boardingPassQueryService->getAll($id),
            Response::HTTP_OK
        );
    }
}
