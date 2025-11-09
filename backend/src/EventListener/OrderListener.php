<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Entity\Reservation;
use App\Repository\TicketRepository;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\MailerInterface;

class OrderListener
{
    public function __construct(
        private readonly MailerInterface $mailer,
        #[Autowire('%env(FORM_EMAIL)%')]
        private readonly string $emailFromAddress,
        private readonly TicketRepository $ticketRepository,
    ){
    }

    public function preUpdate(PreUpdateEventArgs $args): void
    {
        $entity = $args->getObject();

        if (!$entity instanceof Reservation) {
            return;
        }

        if ($args->hasChangedField('status')) {
            $old = $args->getOldValue('status');
            $new = $args->getNewValue('status');

            if ($old === $new) {
                return;
            }

            $tickets = $this->ticketRepository->findByReservationId($entity->getId());

            $email = (new TemplatedEmail())
                ->from($this->emailFromAddress)
                ->to($entity->getUser()->getEmail())
                ->subject('Reservation Status Updated')
                ->htmlTemplate('emails/ConfirmReservation.html.twig')
                ->context([
                    'status' => $new,
                    'username' => $entity->getUser()->getFirstName(),
                    'reservationId' => $entity->getId(),
                    'ticketCount' => count($tickets),
                    'tickets' => array_map(static fn ($r) => [
                        'passengerName' => $r->getPassengerName(),
                        'seatClass' => $r->getSeatClass(),
                        'priceFinalCents' => $r->getPriceFinalCents() / 100,
                    ], $tickets),
                ])
            ;

            $this->mailer->send($email);
        }
    }
}
