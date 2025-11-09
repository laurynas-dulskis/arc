import React, {useEffect, useState} from "react";
import {getMyHistory} from "~/clients/historyClient";
import Spinner from "~/components/spinner";
import UserNavigationHeader from "~/components/userNavigationHeader";
import {showToast} from "~/utils/toastUtils";
import type {History} from "~/model/history";
import {getUserInfo, updateUserInfo} from "~/clients/usersClient";
import {getAccessTokenData, logout} from "~/utils/authUtils";
import {handleBackendError} from "~/utils/errorUtils";
import {API_ENDPOINTS} from "~/constants/api";
import Button from "~/components/button";

export function ProfilePage() {
    const [isFetchingHistory, setIsFetchingHistory] = React.useState(true);
    const [history, setHistory] = React.useState<History[]>([]);
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
                const {email, firstName, lastName, phoneNumber} = userData;
                setFormData(prev => ({...prev, email, firstName, lastName, phoneNumber}));
            })
            .catch(() => {
                // Error already handled in getUserInfo
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        const {email, firstName, lastName, phoneNumber} = formData;
        setIsFormValid(
            email.trim() !== "" &&
            firstName.trim() !== "" &&
            lastName.trim() !== "" &&
            phoneNumber.trim() !== ""
        );
    }, [formData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
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


    React.useEffect(() => {
        setIsFetchingHistory(true);

        getMyHistory()
            .then((data: History[]) => {
                if (data.length === 0) {
                    showToast("No history found", "info");
                }

                setHistory(data);
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                setIsFetchingHistory(false);
            });
    }, []);

    return (
        <div className="flex flex-col items-center bg-gray-50 min-h-screen pt-8 pb-6">
            <UserNavigationHeader/>
            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Form Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white shadow-lg rounded-xl p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="firstName">
                                        First Name
                                    </label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">
                                        Last Name
                                    </label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1"
                                           htmlFor="phoneNumber">
                                        Phone Number
                                    </label>
                                    <input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div className="pt-2">
                                    <Button
                                        text="Save Changes"
                                        color="bg-blue-600"
                                        type="submit"
                                        onClick={() => {
                                        }}
                                        disabled={isLoading || !isFormValid}
                                    />
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* History Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white shadow-lg rounded-xl p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Flight History</h2>
                            {isFetchingHistory ? (
                                <div className="flex justify-center items-center h-64">
                                    <Spinner/>
                                </div>
                            ) : (
                                <>
                                    {history.length === 0 ? (
                                        <div className="text-center py-16">
                                            <p className="text-gray-500 text-lg">You have no flight history.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-100">
                                                <tr>
                                                    <th scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Passenger
                                                    </th>
                                                    <th scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Origin
                                                    </th>
                                                    <th scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Destination
                                                    </th>
                                                    <th scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Departure
                                                    </th>
                                                    <th scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Class
                                                    </th>
                                                    <th scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Price
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                {history.map((item) => (
                                                    <tr key={item.flightNumber}
                                                        className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.passengerName}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.origin}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.destination}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.departureTime}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.seatClass}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.price} Eur</td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ProfilePage;