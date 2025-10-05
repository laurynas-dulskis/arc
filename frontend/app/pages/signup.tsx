import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "~/components/button";
import { showToast } from "~/utils/toastUtils";
import {getAccessTokenData, logout} from "~/utils/authUtils";
import { API_ENDPOINTS } from "~/constants/api";
import {handleBackendError} from "~/utils/errorUtils";
import {getUserInfo, updateUserInfo} from "~/clients/usersClient";

export function SignUp() {
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        phoneNumber: ""
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        const userId = getAccessTokenData(false)?.sub;

        if (!userId) {
            showToast("User information not found", "error");
            return;
        }

        setIsLoading(true);
        getUserInfo(userId)
            .then(userData => {
                const { email, firstName, lastName } = userData;
                setFormData(prev => ({ ...prev, email, firstName, lastName }));
            })
            .catch(() => {
                // Error already handled in getUserInfo
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        const { email, firstName, lastName, phoneNumber } = formData;
        setIsFormValid(
            email.trim() !== "" &&
            firstName.trim() !== "" &&
            lastName.trim() !== "" &&
            phoneNumber.trim() !== ""
        );
    }, [formData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Form submitted", formData);

        const errors: Record<string, string> = {};

        if (!formData.email.trim()) {
            errors.email = "Email cannot be empty";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Please enter a valid email address";
        }

        if (!formData.firstName.trim()) {
            errors.firstName = "First name cannot be empty";
        } else if (formData.firstName.length < 3 || formData.firstName.length > 30) {
            errors.firstName = "First name must be between 3 and 30 characters";
        }

        if (!formData.lastName.trim()) {
            errors.lastName = "Last name cannot be empty";
        } else if (formData.lastName.length < 3 || formData.lastName.length > 30) {
            errors.lastName = "Last name must be between 3 and 30 characters";
        }

        if (!formData.phoneNumber.trim()) {
            errors.phoneNumber = "Phone number cannot be empty";
        } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,10}[-\s.]?[0-9]{1,10}$/.test(formData.phoneNumber)) {
            errors.phoneNumber = "Please enter a valid phone number";
        }

        if (Object.keys(errors).length > 0) {
            for (const [field, message] of Object.entries(errors)) {
                showToast(message, "error");
            }
            return;
        }

        try {
            setIsLoading(true);
            const userId = getAccessTokenData(false)?.sub;

            if (!userId) {
                showToast("User information not found", "error");
                return;
            }

            await updateUserInfo(userId, formData);

            showToast("Your profile has been updated successfully", "success");

            window.location.href = API_ENDPOINTS.AUTH.GOOGLE;
        } catch (error) {
            handleBackendError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center bg-gray-50 min-h-screen py-12">
            <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                        First Name
                    </label>
                    <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                        Last Name
                    </label>
                    <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                        Phone Number
                    </label>
                    <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <Button
                        text="Logout"
                        color="bg-red-600"
                        onClick={logout}
                    />
                    <Button
                        text="Sign up"
                        color="bg-blue-600"
                        type="submit"
                        onClick={() => {}}
                        disabled={isLoading || !isFormValid}
                    />
                </div>
            </form>
        </div>
    );
}

export default SignUp;