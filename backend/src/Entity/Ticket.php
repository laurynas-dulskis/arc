<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\TicketRepository;
use Doctrine\ORM\Mapping as ORM;
use DateTimeImmutable;

#[ORM\Entity(repositoryClass: TicketRepository::class)]
class Ticket
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Reservation $reservation = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Flight $flight = null;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $passengerName = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?DateTimeImmutable $passengerDob = null;

    #[ORM\Column(type: 'string')]
    private ?string $seatClass = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $seatNumber = null;

    #[ORM\Column(type: 'integer')]
    private ?int $priceFinalCents = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getReservation(): ?Reservation
    {
        return $this->reservation;
    }

    public function setReservation(Reservation $reservation): self
    {
        $this->reservation = $reservation;

        return $this;
    }

    public function getFlight(): ?Flight
    {
        return $this->flight;
    }

    public function setFlight(Flight $flight): self
    {
        $this->flight = $flight;

        return $this;
    }

    public function getPassengerName(): ?string
    {
        return $this->passengerName;
    }

    public function setPassengerName(string $passengerName): self
    {
        $this->passengerName = $passengerName;

        return $this;
    }

    public function getPassengerDob(): ?DateTimeImmutable
    {
        return $this->passengerDob;
    }

    public function setPassengerDob(DateTimeImmutable $passengerDob): self
    {
        $this->passengerDob = $passengerDob;

        return $this;
    }

    public function getSeatClass(): ?string
    {
        return $this->seatClass;
    }

    public function setSeatClass(string $seatClass): self
    {
        $this->seatClass = $seatClass;

        return $this;
    }

    public function getSeatNumber(): ?int
    {
        return $this->seatNumber;
    }

    public function setSeatNumber(int $seatNumber): self
    {
        $this->seatNumber = $seatNumber;

        return $this;
    }

    public function getPriceFinalCents(): ?float
    {
        return $this->priceFinalCents;
    }

    public function setPriceFinalCents(int $priceFinalCents): self
    {
        $this->priceFinalCents = $priceFinalCents;

        return $this;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }
}
