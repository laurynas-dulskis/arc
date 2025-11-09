<?php

declare(strict_types=1);

namespace App\handler;

use App\Entity\Reservation;
use App\Enum\ReservationStatus;
use App\Repository\ReservationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Stripe\Checkout\Session;
use Stripe\Stripe;

class PaymentHandler
{
    public function __construct(
        private readonly ReservationRepository $reservationRepository,
        private readonly EntityManagerInterface $entityManager,
    ){

    }

    public function handle(string $paymentId): void
    {
        Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);
        $session = Session::retrieve($paymentId);

        $orderId = $session->client_reference_id;

        if ($session->status !== 'complete'){
            throw new \LogicException('Payment not completed');
        };

        $reservation = $this->reservationRepository->findById($orderId);

        if (null === $reservation) {
            throw new \LogicException('Reservation not found');
        }

        $reservation->setStatus(ReservationStatus::Paid);
        $this->entityManager->flush();
    }
}
