<?php

declare(strict_types=1);

namespace App\Controller;

use App\Security\UserToken;
use App\Service\Flight\FlightHistoryQuaryService;
use App\Validator\AccessValidator;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/history')]
class HistoryController
{
    public function __construct(
        private readonly FlightHistoryQuaryService $flightHistoryQuaryService,
    ){
    }
    #[Route('/my', name: 'get_my_flight_history', methods: ['GET'])]
    public function getCollectionAll(
        UserToken $userToken,
    ): JsonResponse {

        return new JsonResponse(
            $this->flightHistoryQuaryService->getMyFlightHistory($userToken),
            Response::HTTP_OK
        );
    }
}
