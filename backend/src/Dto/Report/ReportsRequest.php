<?php

declare(strict_types=1);

namespace App\Dto\Report;

use App\Enum\ReportType;
use DateTimeImmutable;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

class ReportsRequest
{
    #[Assert\NotBlank]
    #[Assert\Choice(
        callback: [ReportType::class, 'values'],
        message: 'Report must be one of: {{ choices }}'
    )]
    public ?string $reportType = null;

    #[Assert\NotNull]
    #[Assert\Type(DateTimeImmutable::class)]
    public ?DateTimeImmutable $flightsFrom = null;

    #[Assert\NotNull]
    #[Assert\Type(DateTimeImmutable::class)]
    public ?DateTimeImmutable $flightsTo = null;

    #[Assert\Callback]
    public function validateTimes(ExecutionContextInterface $context): void
    {
        if ($this->flightsFrom && $this->flightsTo && $this->flightsFrom >= $this->flightsTo) {
            $context->buildViolation('From time must be before to time')
                ->atPath('time')
                ->addViolation()
            ;
        }
    }
}
