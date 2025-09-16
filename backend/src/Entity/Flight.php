<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\FlightRepository;
use Doctrine\ORM\Mapping as ORM;
use DateTimeImmutable;

#[ORM\Entity(repositoryClass: FlightRepository::class)]
class Flight
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string')]
    private ?string $flightNumber = null;

    #[ORM\Column(type: 'string')]
    private ?string $origin = null;

    #[ORM\Column(type: 'string')]
    private ?string $destination = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?DateTimeImmutable $departureTime = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?DateTimeImmutable $arrivalTime = null;

    #[ORM\Column(type: 'integer')]
    private ?int $durationMinutes = null;

    #[ORM\Column(type: 'integer')]
    private ?int $basePriceCents = null;

    #[ORM\Column(type: 'integer')]
    private ?int $seatsTotal = null;

    #[ORM\Column(type: 'integer')]
    private ?int $seatsAvailable = null;

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

    public function getFlightNumber(): ?string
    {
        return $this->flightNumber;
    }

    public function setFlightNumber(string $flightNumber): self
    {
        $this->flightNumber = $flightNumber;

        return $this;
    }

    public function getOrigin(): ?string
    {
        return $this->origin;
    }

    public function setOrigin(string $origin): self
    {
        $this->origin = $origin;

        return $this;
    }

    public function getDestination(): ?string
    {
        return $this->destination;
    }

    public function setDestination(string $destination): self
    {
        $this->destination = $destination;

        return $this;
    }

    public function getDepartureTime(): ?DateTimeImmutable
    {
        return $this->departureTime;
    }

    public function setDepartureTime(DateTimeImmutable $departureTime): self
    {
        $this->departureTime = $departureTime;

        return $this;
    }

    public function getArrivalTime(): ?DateTimeImmutable
    {
        return $this->arrivalTime;
    }

    public function setArrivalTime(DateTimeImmutable $arrivalTime): self
    {
        $this->arrivalTime = $arrivalTime;

        return $this;
    }

    public function getDurationMinutes(): ?int
    {
        return $this->durationMinutes;
    }

    public function setDurationMinutes(int $durationMinutes): self
    {
        $this->durationMinutes = $durationMinutes;

        return $this;
    }

    public function getBasePriceCents(): ?int
    {
        return $this->basePriceCents;
    }

    public function setBasePriceCents(int $basePriceCents): self
    {
        $this->basePriceCents = $basePriceCents;

        return $this;
    }

    public function getSeatsTotal(): ?int
    {
        return $this->seatsTotal;
    }

    public function setSeatsTotal(int $seatsTotal): self
    {
        $this->seatsTotal = $seatsTotal;

        return $this;
    }

    public function getSeatsAvailable(): ?int
    {
        return $this->seatsAvailable;
    }

    public function setSeatsAvailable(int $seatsAvailable): self
    {
        $this->seatsAvailable = $seatsAvailable;

        return $this;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }
}
