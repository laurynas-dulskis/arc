import React from "react";
import Button from "./button";
import SignInButton from "./signInButton";
import { getAccessTokenData, logout, isAdmin } from "../utils/authUtils";
import { ROUTES } from "../constants/routes";

interface HeroSectionProps {
    isSigningIn: boolean;
    handleGoogleSignIn: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ isSigningIn, handleGoogleSignIn }) => {
    return (
        <header className="flex flex-col items-center w-full px-6">
            <div className="w-full max-w-5xl flex justify-end mb-4">
                {getAccessTokenData() !== null ? (
                    <div>
                        <div className="mb-4 text-gray-700">
                            <span className="italic">Logged in as:</span>{" "}
                            <span className="font-semibold">
                                {getAccessTokenData()?.name} {getAccessTokenData()?.surname}
                            </span>
                        </div>
                        <div className="flex justify-end ml-4">
                            {isAdmin() ? (
                                <Button
                                    text="Admin Panel"
                                    color="bg-blue-600 ml-4"
                                    onClick={() => (window.location.href = ROUTES.ADMIN_PANEL)}
                                />
                            ) : null}
                            <Button
                                text="Logout"
                                color="bg-red-600 ml-4"
                                onClick={logout}
                            />
                        </div>
                    </div>
                ) : (
                    <SignInButton isSigningIn={isSigningIn} onClick={handleGoogleSignIn} />
                )}
            </div>

            <h1 className="text-4xl font-bold text-gray-800">Flights</h1>
        </header>
    );
};

export default HeroSection;