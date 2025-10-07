<?php

declare(strict_types=1);

namespace App\Controller;

use App\Dto\Flight\FlightCreateRequest;
use App\Dto\Flight\FlightFilterRequest;
use App\Dto\Flight\FlightUpdateRequest;
use App\Entity\Flight;
use App\Security\UserToken;
use App\Service\Flight\FlightCommandService;
use App\Service\Flight\FlightQueryService;
use App\Validator\AccessValidator;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryString;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/flights')]
class FlightController
{
    public function __construct(
        private readonly FlightQueryService $flightQueryService,
        private readonly FlightCommandService $flightCommandService,
        private readonly AccessValidator $accessValidator,
    ) {
    }

    #[Route(name: 'flight_get_collection', methods: ['GET'])]
    public function getCollection(
        #[MapQueryString(validationFailedStatusCode: Response::HTTP_UNPROCESSABLE_ENTITY)]
        FlightFilterRequest $request,
    ): JsonResponse {
        return new JsonResponse(
            $this->flightQueryService->getAll($request),
            Response::HTTP_OK
        );
    }

    #[Route(name: 'flight_create', methods: ['POST'])]
    public function create(
        #[MapRequestPayload] FlightCreateRequest $request,
        UserToken $userToken,
    ): JsonResponse {
        $this->accessValidator->validateIsAdmin($userToken);

        return new JsonResponse(
            $this->flightQueryService->getOne(
                $this->flightCommandService->create($request)
            ),
            Response::HTTP_CREATED
        );
    }

    #[Route('/{id}', name: 'flight_update', methods: ['PUT'])]
    public function update(
        #[MapRequestPayload] FlightUpdateRequest $request,
        Flight $flight,
        UserToken $userToken,
    ): JsonResponse {
        $this->accessValidator->validateIsAdmin($userToken);

        return new JsonResponse(
            $this->flightQueryService->getOne(
                $this->flightCommandService->update($request, $flight)
            ),
            Response::HTTP_OK
        );
    }

    #[Route('/{id}', name: 'flight_delete', methods: ['DELETE'])]
    public function delete(
        Flight $flight,
        UserToken $userToken,
    ): JsonResponse {
        $this->accessValidator->validateIsAdmin($userToken);

        $this->flightCommandService->delete($flight);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
