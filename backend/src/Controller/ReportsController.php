<?php

declare(strict_types=1);

namespace App\Controller;
use App\Dto\Report\ReportsRequest;
use App\Dto\Reservation\UserReservationCreateRequest;
use App\Security\UserToken;
use App\Service\ReportGenerationService;
use App\Validator\AccessValidator;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/reports')]
class ReportsController
{
    public function __construct(
        private readonly AccessValidator $accessValidator,
        private readonly ReportGenerationService $reportGenerationService,
    ) {
    }

    #[Route(name: 'generate_report', methods: ['POST'])]
    public function getAll(
        #[MapRequestPayload]
        ReportsRequest $reportsRequest,
        UserToken $userToken
    ): JsonResponse {
        $this->accessValidator->validateIsAdmin($userToken);

        $this->reportGenerationService->generateReport($reportsRequest, $userToken);

        return new JsonResponse(
            [],
            Response::HTTP_OK
        );
    }
}
