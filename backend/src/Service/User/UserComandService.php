<?php

declare(strict_types=1);

namespace App\Service\User;

use App\Dto\User\UserSignupDetailsRequest;
use App\Dto\User\UserUpdateRequest;
use App\Enum\UserRole;
use App\Exception\EntityNotFoundException;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;

class UserComandService
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager,
    ) {
    }

    public function updateDetails(UserSignupDetailsRequest $request, int $userId): int
    {
        $user = $this->userRepository->findById($userId);

        if (null === $user) {
            throw new EntityNotFoundException('User not found', ['id' => $userId]);
        }

        $user
            ->setFirstName($request->firstName)
            ->setLastName($request->lastName)
            ->setEmail($request->email)
            ->setPhoneNumber($request->phoneNumber)
            ->setSignupCompleted(true)
        ;

        $this->entityManager->flush();

        return $userId;
    }

    public function update(UserUpdateRequest $request, int $userId): int
    {
        $user = $this->userRepository->findById($userId);

        if (null === $user) {
            throw new EntityNotFoundException('User not found', ['id' => $userId]);
        }

        $user
            ->setFirstName($request->firstName)
            ->setLastName($request->lastName)
            ->setEmail($request->email)
            ->setPhoneNumber($request->phoneNumber)
            ->setRole(UserRole::from($request->role))
            ->setSignupCompleted($request->signupCompleted)
        ;

        $this->entityManager->flush();

        return $userId;
    }

    public function delete(int $userId): void
    {
        $user = $this->userRepository->findById($userId);

        if (null === $user) {
            throw new EntityNotFoundException('User not found', ['id' => $userId]);
        }

        $this->entityManager->remove($user);
        $this->entityManager->flush();
    }
}
