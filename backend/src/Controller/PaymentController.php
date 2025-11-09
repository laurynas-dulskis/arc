<?php

declare(strict_types=1);

namespace App\Controller;

use App\handler\PaymentHandler;
use App\Security\UserToken;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/payments')]
class PaymentController
{
    public function __construct(
        private readonly PaymentHandler $paymentHandler,
    ) {
    }

    #[Route('/{paymentId}', name: 'payment_callback', methods: ['POST'])]
    public function cancel(string $paymentId, UserToken $userToken): JsonResponse
    {
        $this->paymentHandler->handle($paymentId);

        return new JsonResponse(
            [],
            Response::HTTP_OK
        );
    }
}
