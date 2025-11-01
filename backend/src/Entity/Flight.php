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

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private ?int $numberOfLayovers = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?DateTimeImmutable $departureTime = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?DateTimeImmutable $arrivalTime = null;

    #[ORM\Column(type: 'integer')]
    private ?int $durationMinutes = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private ?int $basePriceCentsEconomy = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private ?int $basePriceCentsBusiness = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private ?int $basePriceCentsFirstClass = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private ?int $seatsEconomy = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private ?int $seatsBusiness = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private ?int $seatsFirstClass = null;

    #[ORM\Column(type: 'integer')]
    private ?int $seatsTotal = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private ?int $seatsAvailableEconomy = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private ?int $seatsAvailableBusiness = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private ?int $seatsAvailableFirstClass = null;

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

    public function getSeatsTotal(): ?int
    {
        return $this->seatsTotal;
    }

    public function setSeatsTotal(int $seatsTotal): self
    {
        $this->seatsTotal = $seatsTotal;

        return $this;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getNumberOfLayovers(): ?int
    {
        return $this->numberOfLayovers;
    }

    public function setNumberOfLayovers(int $numberOfLayovers): self
    {
        $this->numberOfLayovers = $numberOfLayovers;

        return $this;
    }

    public function getBasePriceCentsEconomy(): ?int
    {
        return $this->basePriceCentsEconomy;
    }

    public function setBasePriceCentsEconomy(int $basePriceCentsEconomy): self
    {
        $this->basePriceCentsEconomy = $basePriceCentsEconomy;

        return $this;
    }

    public function getBasePriceCentsBusiness(): ?int
    {
        return $this->basePriceCentsBusiness;
    }

    public function setBasePriceCentsBusiness(int $basePriceCentsBusiness): self
    {
        $this->basePriceCentsBusiness = $basePriceCentsBusiness;

        return $this;
    }

    public function getBasePriceCentsFirstClass(): ?int
    {
        return $this->basePriceCentsFirstClass;
    }

    public function setBasePriceCentsFirstClass(int $basePriceCentsFirstClass): self
    {
        $this->basePriceCentsFirstClass = $basePriceCentsFirstClass;

        return $this;
    }

    public function getSeatsEconomy(): ?int
    {
        return $this->seatsEconomy;
    }

    public function setSeatsEconomy(int $seatsEconomy): self
    {
        $this->seatsEconomy = $seatsEconomy;

        return $this;
    }

    public function getSeatsBusiness(): ?int
    {
        return $this->seatsBusiness;
    }

    public function setSeatsBusiness(int $seatsBusiness): self
    {
        $this->seatsBusiness = $seatsBusiness;

        return $this;
    }

    public function getSeatsFirstClass(): ?int
    {
        return $this->seatsFirstClass;
    }

    public function setSeatsFirstClass(int $seatsFirstClass): self
    {
        $this->seatsFirstClass = $seatsFirstClass;

        return $this;
    }

    public function getSeatsAvailableEconomy(): ?int
    {
        return $this->seatsAvailableEconomy;
    }

    public function setSeatsAvailableEconomy(int $seatsAvailableEconomy): self
    {
        $this->seatsAvailableEconomy = $seatsAvailableEconomy;

        return $this;
    }

    public function getSeatsAvailableBusiness(): ?int
    {
        return $this->seatsAvailableBusiness;
    }

    public function setSeatsAvailableBusiness(int $seatsAvailableBusiness): self
    {
        $this->seatsAvailableBusiness = $seatsAvailableBusiness;

        return $this;
    }

    public function getSeatsAvailableFirstClass(): ?int
    {
        return $this->seatsAvailableFirstClass;
    }

    public function setSeatsAvailableFirstClass(int $seatsAvailableFirstClass): self
    {
        $this->seatsAvailableFirstClass = $seatsAvailableFirstClass;

        return $this;
    }
}
