<?php

declare(strict_types=1);

namespace App\Service;

use App\Dto\Report\ReportsRequest;
use App\Enum\ReportType;
use App\Enum\ReservationStatus;
use App\Repository\FlightRepository;
use App\Repository\ReservationRepository;
use App\Repository\TicketRepository;
use App\Security\UserToken;
use DateTimeImmutable;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\MailerInterface;

class ReportGenerationService
{

    public function __construct(
        private readonly MailerInterface $mailer,
        #[Autowire('%env(FORM_EMAIL)%')]
        private readonly string $emailFromAddress,
        private readonly FLightRepository $flightRepository,
        private readonly TicketRepository $ticketRepository,
    ){
    }

    public function generateReport(ReportsRequest $reportsRequest, UserToken $userToken): void
    {
        if ($reportsRequest->reportType === ReportType::Flights->value) {
            $flights = $this->flightRepository->findFlightsBetweenDates(
                $reportsRequest->flightsFrom,
                $reportsRequest->flightsTo
            );

            $data = [
                'generatedAt' => (new DateTimeImmutable())->format('Y-m-d H:i:s'),
                'reportType' => 'Flights Report',
                'numberOfFlights' => count($flights),
                'flights' => []
            ];

            foreach ($flights as $flight) {
                $tickets = $this->ticketRepository->findPaidByFlightId($flight->getId());

                $flightData = [
                    'flightNumber' => $flight->getFlightNumber(),
                    'origin' => $flight->getOrigin(),
                    'destination' => $flight->getDestination(),
                    'departureTime' => $flight->getDepartureTime()->format('Y-m-d H:i:s'),
                    'arrivalTime' => $flight->getArrivalTime()->format('Y-m-d H:i:s'),
                    'basePriceEconomy' => $flight->getBasePriceCentsEconomy()/100 . ' Euro',
                    'basePriceBusiness' => $flight->getBasePriceCentsBusiness()/100 . ' Euro',
                    'basePriceFirstClass' => $flight->getBasePriceCentsFirstClass()/100 . ' Euro',
                    'totalSeats' => $flight->getSeatsTotal(),
                    'availableSeatsEconomy' => $flight->getSeatsAvailableEconomy(),
                    'availableSeatsBusiness' => $flight->getSeatsAvailableBusiness(),
                    'availableSeatsFirstClass' => $flight->getSeatsAvailableFirstClass(),
                    'tickets' => []
                ];

                $paidMoneyCents = 0;
                $reservedMoneyCents = 0;
                $ticketsSoldCount = 0;

                foreach ($tickets as $ticket) {
                    if($ticket->getReservation()->getStatus() === ReservationStatus::Cancelled){
                        continue;
                    }

                    if($ticket->getReservation()->getStatus() === ReservationStatus::Paid){
                        $paidMoneyCents += $ticket->getPriceFinalCents();
                    }

                    if ($ticket->getReservation()->getStatus() === ReservationStatus::Reserved){
                        $reservedMoneyCents += $ticket->getPriceFinalCents();
                    }

                    $ticketsSoldCount++;

                    $flightData['tickets'][] = [
                        'passengerName' => $ticket->getPassengerName(),
                        'seatClass' => $ticket->getSeatClass(),
                        'priceFinalCents' => $ticket->getPriceFinalCents() / 100 . ' Euro',
                        'reservationStatus' => $ticket->getReservation()->getStatus()->value,
                        'passengerDob' => $ticket->getPassengerDob() ? $ticket->getPassengerDob()->format('Y-m-d') : null,
                    ];
                }

                $flightData['totalRevenueExpected'] = ($paidMoneyCents + $reservedMoneyCents)/100 . ' Euro';
                $flightData['totalRevenueCollected'] = $paidMoneyCents/100 . ' Euro';
                $flightData['totalRevenueReserved'] = $reservedMoneyCents/100 . ' Euro';
                $flightData['numberOfTicketsSold'] = $ticketsSoldCount;

                $data['flights'][] = $flightData;
            }

            $email = (new TemplatedEmail())
                ->from($this->emailFromAddress)
                ->to($userToken->email)
                ->subject('Flight Report')
                ->htmlTemplate('reports/FlightsReport.html.twig')
                ->context($data)
            ;

            $this->mailer->send($email);
        } elseif ($reportsRequest->reportType === ReportType::Routes->value) {
            $flights = $this->flightRepository->findFlightsBetweenDates(
                $reportsRequest->flightsFrom,
                $reportsRequest->flightsTo
            );

            $data = [
                'generatedAt' => (new DateTimeImmutable())->format('Y-m-d H:i:s'),
                'reportType' => 'Routes Report',
                'numberOfFlights' => count($flights),
                'routes' => []
            ];

            $routesData = [];

            foreach ($flights as $flight) {
                $tickets = $this->ticketRepository->findPaidByFlightId($flight->getId());

                $route = $flight->getOrigin() . ' -> ' . $flight->getDestination();

                if(!isset($routesData[$route])){
                    $routesData[$route] = [
                        'flightCount' =>  1,
                        'totalTicketsSold' => 0,
                        'totalRevenueCollected' => 0,
                        'totalRevenueExpected' => 0,
                        'origin' => $flight->getOrigin(),
                        'destination' => $flight->getDestination(),
                    ];
                }else{
                    $routesData[$route]['flightCount'] =  $routesData[$route]['flightCount'] + 1;
                }

                $paidMoneyCents = 0;
                $reservedMoneyCents = 0;
                $ticketsSoldCount = 0;

                foreach ($tickets as $ticket) {
                    if($ticket->getReservation()->getStatus() === ReservationStatus::Cancelled){
                        continue;
                    }

                    if($ticket->getReservation()->getStatus() === ReservationStatus::Paid){
                        $paidMoneyCents += $ticket->getPriceFinalCents();
                    }

                    if ($ticket->getReservation()->getStatus() === ReservationStatus::Reserved){
                        $reservedMoneyCents += $ticket->getPriceFinalCents();
                    }

                    $ticketsSoldCount++;

                }

                $routesData[$route]['totalTicketsSold'] += $ticketsSoldCount;
                $routesData[$route]['totalRevenueCollected'] += $paidMoneyCents;
                $routesData[$route]['totalRevenueExpected'] += ($paidMoneyCents + $reservedMoneyCents);
            }

            foreach ($routesData as $route => $routeData) {
                $data['routes'][] = [
                    'route' => $routeData['origin'] . ' -> ' . $routeData['destination'],
                    'flightCount' => $routeData['flightCount'],
                    'totalTicketsSold' => $routeData['totalTicketsSold'],
                    'totalRevenueCollected' => $routeData['totalRevenueCollected']/100 . ' Euro',
                    'totalRevenueExpected' => $routeData['totalRevenueExpected']/100 . ' Euro',
                ];
            }

            usort($data['routes'], function ($a, $b) {
                return $b['totalTicketsSold'] <=> $a['totalTicketsSold'];
            });

            $email = (new TemplatedEmail())
                ->from($this->emailFromAddress)
                ->to($userToken->email)
                ->subject('Routes Report')
                ->htmlTemplate('reports/RoutesReport.html.twig')
                ->context($data)
            ;

            $this->mailer->send($email);
        } else {
            throw new \InvalidArgumentException('Invalid report type');
        }
    }
}
