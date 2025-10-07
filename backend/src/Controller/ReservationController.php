<?php

declare(strict_types=1);

namespace App\Controller;

use App\Security\UserToken;
use App\Service\Reservation\ReservationQueryService;
use App\Validator\AccessValidator;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/reservations')]
class ReservationController
{
    public function __construct(
        private readonly ReservationQueryService $reservationQueryService,
        private readonly AccessValidator $accessValidator,
    ) {
    }

    #[Route(name: 'get_all_reservations', methods: ['GET'])]
    public function getAll(UserToken $userToken): JsonResponse
    {
        $this->accessValidator->validateIsAdmin($userToken);

        return new JsonResponse(
            $this->reservationQueryService->getAll(),
            Response::HTTP_OK
        );
    }
}
