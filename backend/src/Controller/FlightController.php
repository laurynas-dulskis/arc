<?php

declare(strict_types=1);

namespace App\Controller;

use App\Dto\Flight\FlightCreateRequest;
use App\Dto\Flight\FlightUpdateRequest;
use App\Entity\Flight;
use App\Service\Flight\FlightCommandService;
use App\Service\Flight\FlightQueryService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/flights')]
class FlightController
{
    public function __construct(
        private readonly FlightQueryService $flightQueryService,
        private readonly FlightCommandService $flightCommandService,
    ) {
    }

    #[Route(name: 'flight_create', methods: ['POST'])]
    public function create(#[MapRequestPayload] FlightCreateRequest $request): JsonResponse
    {
        return new JsonResponse(
            $this->flightQueryService->getOne(
                $this->flightCommandService->create($request)
            ),
            Response::HTTP_CREATED
        );
    }

    #[Route(name: 'flight_get_collection', methods: ['GET'])]
    public function getCollection(): JsonResponse
    {
        return new JsonResponse(
            $this->flightQueryService->getAll(),
            Response::HTTP_OK
        );
    }

    #[Route('/{id}', name: 'flight_update', methods: ['PUT'])]
    public function update(#[MapRequestPayload] FlightUpdateRequest $request, Flight $flight): JsonResponse
    {
        return new JsonResponse(
            $this->flightQueryService->getOne(
                $this->flightCommandService->update($request, $flight)
            ),
            Response::HTTP_OK
        );
    }

    #[Route('/{id}', name: 'flight_delete', methods: ['DELETE'])]
    public function delete(Flight $flight): JsonResponse
    {
        $this->flightCommandService->delete($flight);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
