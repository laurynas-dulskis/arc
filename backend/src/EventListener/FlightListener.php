<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Entity\Flight;
use App\Entity\Reservation;
use App\Enum\FlightClass;
use App\Repository\TicketRepository;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\MailerInterface;

class FlightListener
{
    public function __construct(
        private readonly MailerInterface $mailer,
        #[Autowire('%env(FORM_EMAIL)%')]
        private readonly string $emailFromAddress,
        #[Autowire('%env(ADMIN_EMAIL)%')]
        private readonly string $emailToAddress,
    ){
    }

    public function preUpdate(PreUpdateEventArgs $args): void
    {
        $entity = $args->getObject();

        if (!$entity instanceof Flight) {
            return;
        }

        $class = null;

        if ($args->hasChangedField('seatsAvailableEconomy')) {
            $old = $args->getOldValue('seatsAvailableEconomy');
            $new = $args->getNewValue('seatsAvailableEconomy');

            if ($old === $new) {
                return;
            }

            if ($new !== 0) {
                return;
            }

            $class = FlightClass::Economy;
        }

        if ($args->hasChangedField('seatsAvailableBusiness')) {
            $old = $args->getOldValue('seatsAvailableBusiness');
            $new = $args->getNewValue('seatsAvailableBusiness');

            if ($old === $new) {
                return;
            }

            if ($new !== 0) {
                return;
            }

            $class = FlightClass::Business;
        }

        if ($args->hasChangedField('seatsAvailableFirstClass')) {
            $old = $args->getOldValue('seatsAvailableFirstClass');
            $new = $args->getNewValue('seatsAvailableFirstClass');

            if ($old === $new) {
                return;
            }

            if ($new !== 0) {
                return;
            }

            $class = FlightClass::First;
        }

        if ($class === null) {
            return;
        }

        $email = (new TemplatedEmail())
            ->from($this->emailFromAddress)
            ->to($this->emailToAddress)
            ->subject('Flight Class Fully Booked')
            ->htmlTemplate('emails/FlightBooked.html.twig')
            ->context([
                'flightNumber' => $entity->getFlightNumber(),
                'class' => $class->value,
                    'origin' => $entity->getOrigin(),
                    'destination' => $entity->getDestination(),
                    'departureTime' => $entity->getDepartureTime()->format('Y-m-d h:i:s'),

                ]
            )
        ;

        $this->mailer->send($email);
    }
}
