<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Exception\EntityNotFoundException;
use App\Exception\ValidationException;
use App\Exception\ValidationFailedExceptionHandler;
use App\Normalizer\ValidationViolationNormalizer;
use InvalidArgumentException;
use Psr\Log\LoggerInterface;
use Symfony\Component\Config\Definition\Exception\InvalidConfigurationException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Validator\Exception\ValidationFailedException;

class ExceptionListener
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly ValidationFailedExceptionHandler $exceptionProcessor,
        private readonly ValidationViolationNormalizer $violationNormalizer,
    ) {
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        $exceptionType = get_class($exception);

        switch ($exceptionType) {
            case NotFoundHttpException::class:
                $this->logger->warning('Unknown route error: ', [
                    'error_message' => $exception->getMessage(),
                ]);

                $event->setResponse(
                    new JsonResponse([
                        'error' => 'Not Found',
                    ], Response::HTTP_NOT_FOUND)
                );

                break;
            case EntityNotFoundException::class:
                $context = $exception->getContext();
                $context['error_message'] = $exception->getMessage();
                $this->logger->warning('Resource not found', $context);

                $event->setResponse(
                    new JsonResponse([
                        'error' => 'Resource Not Found',
                    ], Response::HTTP_NOT_FOUND)
                );

                break;
            case ValidationException::class:
                $violations = [];
                foreach ($exception->getViolations() as $violation) {
                    $violations[] = $this->violationNormalizer->normalize($violation);
                }

                $this->logger->warning($exception->getMessage(), $violations);

                $event->setResponse(
                    new JsonResponse(
                        [
                            'error' => 'Validation Error',
                            'validation_errors' => $violations,
                        ],
                        Response::HTTP_UNPROCESSABLE_ENTITY)
                );

                break;
            case UnauthorizedHttpException::class:
                $this->logger->warning('Access authorization error: ', [
                    'error_message' => $exception->getMessage(),
                ]);

                $event->setResponse(
                    new JsonResponse([
                        'error' => $exception->getMessage(),
                    ], Response::HTTP_UNAUTHORIZED)
                );

                break;
            case UnprocessableEntityHttpException::class:
                $previous = $exception->getPrevious();

                if ($previous instanceof ValidationFailedException) {
                    $violations = [];
                    foreach ($this->exceptionProcessor->handle($previous) as $violation) {
                        $violations[] = $this->violationNormalizer->normalize($violation);
                    }

                    $this->logger->warning('Validation error: ', $violations);

                    $event->setResponse(
                        new JsonResponse(
                            [
                                'error' => 'Validation Error',
                                'validation_errors' => $violations,
                            ],
                            Response::HTTP_UNPROCESSABLE_ENTITY)
                    );

                    break;
                }

                $this->logger->error('Validation violations are missing', [
                    'error_message' => $exception->getMessage(),
                    'trace' => $exception->getTraceAsString(),
                ]);

                $event->setResponse(
                    new JsonResponse([
                        'error' => 'Bad Request',
                    ], Response::HTTP_UNPROCESSABLE_ENTITY)
                );

                break;
            case InvalidArgumentException::class:
                $this->logger->warning('Invalid argument error: ', [
                    'error_message' => $exception->getMessage(),
                ]);

                $event->setResponse(
                    new JsonResponse([
                        'error' => 'Bad Request',
                        'message' => $exception->getMessage()],
                        Response::HTTP_BAD_REQUEST)
                );

                break;
            case InvalidConfigurationException::class:
                $this->logger->error('Configuration error: ', [
                    'error_message' => $exception->getMessage(),
                ]);

                $event->setResponse(
                    new JsonResponse([
                        'error' => 'Server Configuration Error',
                    ], Response::HTTP_INTERNAL_SERVER_ERROR)
                );

                break;
            case BadRequestHttpException::class:
                $this->logger->warning('Bad request error: ', [
                    'error_message' => $exception->getMessage(),
                ]);

                $event->setResponse(
                    new JsonResponse([
                        'error' => $exception->getMessage(),
                    ], Response::HTTP_BAD_REQUEST)
                );

                break;
            case HttpException::class:
                $this->logger->warning('Endpoint mapping error: ', [
                    'error_message' => $exception->getMessage(),
                ]);

                $event->setResponse(
                    new JsonResponse([
                        'error' => 'Bad Request',
                    ], Response::HTTP_BAD_REQUEST)
                );

                break;
            default:
                $this->logger->error('Unhandled exception caught: ', [
                    'error_message' => $exception->getMessage(),
                    'trace' => $exception->getTraceAsString(),
                ]);

                $event->setResponse(
                    new JsonResponse([
                        'error' => $exception->getMessage(),
                    ], Response::HTTP_INTERNAL_SERVER_ERROR)
                );

                break;
        }
    }
}
