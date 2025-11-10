<?php

declare(strict_types=1);

namespace App\Controller;

use App\Dto\PageRequest;
use App\Dto\Reservation\ReservationConfirmRequest;
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
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/reservations')]
class ReservationController
{
    public function __construct(
        private readonly ReservationQueryService $reservationQueryService,
        private readonly ReservationComandService $reservationComandService,
        private readonly AccessValidator $accessValidator,
        private readonly ValidatorInterface $validator,
    ) {
    }

    #[Route(name: 'create_reservation', methods: ['POST'])]
    public function create(
        #[MapRequestPayload]
        UserReservationCreateRequest $userReservationCreateRequest,
        UserToken $userToken,
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

    #[Route('/my', name: 'get_all_my_reservations', methods: ['GET'])]
    public function getAllMy(
        #[MapQueryString(validationFailedStatusCode: Response::HTTP_UNPROCESSABLE_ENTITY)]
        PageRequest $request,
        UserToken $userToken
    ): JsonResponse {
        return new JsonResponse(
            $this->reservationQueryService->getAllMy($userToken, $request),
            Response::HTTP_OK
        );
    }

    #[Route('/my/pages', name: 'get_all_my_reservations_pages', methods: ['GET'])]
    public function getAllMyPages(
        UserToken $userToken
    ): JsonResponse {
        return new JsonResponse(
                $this->reservationQueryService->getAllMyPages($userToken),
            Response::HTTP_OK
        );
    }

    #[Route('/{reservationId}', name: 'get_info', methods: ['GET'])]
    public function getInfo(int $reservationId, UserToken $userToken): JsonResponse
    {
        return new JsonResponse(
            $this->reservationQueryService->getInfo($reservationId, $userToken),
            Response::HTTP_OK
        );
    }

    #[Route('/{reservationId}', name: 'get_cancel', methods: ['DELETE'])]
    public function cancel(int $reservationId, UserToken $userToken): JsonResponse
    {
        $this->reservationComandService->cancel($reservationId, $userToken);

        return new JsonResponse(
            [],
            Response::HTTP_OK
        );
    }

    #[Route('/{reservationId}/confirm', name: 'confirm', methods: ['POST'])]
    public function confirm(
        #[MapRequestPayload(type: ReservationConfirmRequest::class)]
        array $reservationConfirmRequest,
        int $reservationId,
        UserToken $userToken,
    ): JsonResponse {
        $violations = $this->validator->validate($reservationConfirmRequest, new Assert\All([
            new Assert\Type(type: ReservationConfirmRequest::class),
        ]));

        if (count($violations) > 0) {
            return new JsonResponse(['errors' => (string) $violations], Response::HTTP_BAD_REQUEST);
        }

        return new JsonResponse(
            [
                'paymentUrl' => $this->reservationComandService->confirm($reservationId, $userToken, $reservationConfirmRequest)
            ],
            Response::HTTP_OK
        );
    }
}
