<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\Flight\FlightQueryService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/flights')]
class FlightController
{
    public function __construct(
        private readonly FlightQueryService $flightQueryService,
    ) {
    }

    #[Route(name: 'project_get_collection', methods: ['GET'])]
    public function getCollection(): JsonResponse
    {
        return new JsonResponse(
            $this->flightQueryService->getAll(),
            Response::HTTP_OK
        );
    }
}
