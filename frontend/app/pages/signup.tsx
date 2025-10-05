import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "~/components/button";
import { showToast } from "~/utils/toastUtils";
import { logout } from "~/utils/authUtils";
import { API_ENDPOINTS } from "~/constants/api";

export function SignUp() {
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        phoneNumber: ""
    });

    useEffect(() => {
        axios.get(API_ENDPOINTS.USERS.SIGNUP).then(response => {
            const { email, firstName, lastName } = response.data;
            setFormData(prev => ({ ...prev, email, firstName, lastName }));
        }).catch(error => {
            showToast("Failed to fetch prefilled data", "error");
            console.error("Failed to fetch prefilled data", error);
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted", formData);
        // Add form submission logic here
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
                            onClick={
                                logout
                            }
                    />
                    <Button
                        text="Sign up"
                        color="bg-blue-600"
                        onClick={() => {
                            showToast("Signing up...", "info");
                        }}
                    />
                </div>
            </form>
        </div>
    );
}

export default SignUp;