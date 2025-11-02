<?php

declare(strict_types=1);

namespace App\Controller;

use App\Dto\Reservation\UserReservationCreateRequest;
use App\Security\UserToken;
use App\Service\Reservation\ReservationComandService;
use App\Service\Reservation\ReservationQueryService;
use App\Validator\AccessValidator;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryString;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/reservations')]
class ReservationController
{
    public function __construct(
        private readonly ReservationQueryService $reservationQueryService,
        private readonly ReservationComandService $reservationComandService,
        private readonly AccessValidator $accessValidator,
    ) {
    }

    #[Route(name: 'create_reservation', methods: ['POST'])]
    public function create(
        #[MapRequestPayload]
        UserReservationCreateRequest $userReservationCreateRequest,
        UserToken $userToken
    ): JsonResponse {
        $this->reservationComandService->createReservationForUser($userToken, $userReservationCreateRequest);

        return new JsonResponse(
            [],
            Response::HTTP_OK
        );
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
