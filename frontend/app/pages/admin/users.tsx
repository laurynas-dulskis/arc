import React, {useState} from "react";
import {ensureAdminAccess} from "~/utils/authUtils";
import Button from "~/components/button";
import AdminNavigationHeader from "~/components/adminNavigationHeader";
import ConfirmationModal from "~/components/confirmationModal";
import {UserRoles} from "~/constants/userRoles";
import {adminDeleteUser, adminGetAllUsers, adminGetAllUsersPagesCount, adminUpdateUser} from "~/clients/usersClient";
import {showToast} from "~/utils/toastUtils";
import Spinner from "~/components/spinner";
import type {User} from "~/model/user";

export function Users() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [editing, setEditing] = useState<number | null>(null);
    const [errors, setErrors] = useState<Record<number, Partial<Record<keyof User, string>>>>({});
    const [originalUser, setOriginalUser] = useState<User | null>(null);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [windowOpen, setWindowOpen] = useState(false);
    const [numberOfPages, setNumberOfPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);


    React.useEffect(() => {
        setIsAdmin(ensureAdminAccess());

        const bootstrap = async () => {
            try {
                const pages = await adminGetAllUsersPagesCount();
                setNumberOfPages(pages || 1);

                const data: User[] = await adminGetAllUsers(1);
                if (data.length === 0) {
                    showToast("No users found", "info");
                }
                setUsers(data);
                setCurrentPage(1);
            } catch (err) {
                console.error(err);
                showToast("Failed to load users", "error");
            } finally {
                setLoading(false);
            }
        };

        bootstrap();
    }, []);

    const changePage = async (page: number) => {
        if (page < 1 || page > numberOfPages) return;
        setLoading(true);
        try {
            const data: User[] = await adminGetAllUsers(page);
            if (data.length === 0) {
                showToast("No users found", "info");
            }
            setUsers(data);
            setCurrentPage(page);
        } catch (err) {
            console.error(err);
            showToast("Failed to load users", "error");
        } finally {
            setLoading(false);
        }
    };

    const validateUser = (user: User): Partial<Record<keyof User, string>> => {
        const errors: Partial<Record<keyof User, string>> = {};

        if (!user.email.trim()) {
            errors.email = "Email cannot be empty";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            errors.email = "Please enter a valid email address";
        }

        if (!user.firstName.trim()) {
            errors.firstName = "First name cannot be empty";
        } else if (user.firstName.length < 3 || user.firstName.length > 30) {
            errors.firstName = "First name must be between 3 and 30 characters";
        }

        if (!user.lastName.trim()) {
            errors.lastName = "Last name cannot be empty";
        } else if (user.lastName.length < 3 || user.lastName.length > 30) {
            errors.lastName = "Last name must be between 3 and 30 characters";
        }

        if (!user.phoneNumber.trim()) {
            errors.phoneNumber = "Phone number cannot be empty";
        } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,10}[-\s.]?[0-9]{1,10}$/.test(user.phoneNumber)) {
            errors.phoneNumber = "Please enter a valid phone number";
        }

        return errors;
    };

    const handleEdit = (index: number) => {
        setEditing(index);
        setOriginalUser({...users[index]});
        setErrors(prev => {
            const newE = {...prev};
            delete newE[index];
            return newE;
        });
    };

    const handleSave = (index: number) => {
        const user = users[index];
        const errs = validateUser(user);
        if (Object.keys(errs).length > 0) {
            setErrors(prev => ({...prev, [index]: errs}));
            return;
        }

        adminUpdateUser(user.id.toString(), user)
            .then(() => {
                setUsers(users.map((u, i) => i === index ? user : u));

                showToast("User updated successfully", "success");
            })
            .catch((err) => {
                console.error(err);
            });

        setErrors(prev => {
            const newE = {...prev};
            delete newE[index];
            return newE;
        });
        setOriginalUser(null);
        setEditing(null);
    };

    const handleCancel = () => {
        if (editing !== null && originalUser) {
            setUsers(users.map((u, i) => i === editing ? originalUser : u));
        }
        setEditing(null);
        setOriginalUser(null);
        setErrors({});
    };

    const handleDelete = () => {
        setLoadingDelete(true);

        if (deleteIndex !== null) {
            adminDeleteUser(users[deleteIndex].id.toString()).then(() => {
                const nextUsers = users.filter((_, i) => i !== deleteIndex);
                setUsers(nextUsers);
                adminGetAllUsersPagesCount()
                    .then((pages) => {
                        setNumberOfPages(pages || 1);
                        const targetPage = Math.min(currentPage, pages || 1);
                        if (nextUsers.length === 0 && targetPage === currentPage && currentPage > 1) {
                            return changePage(currentPage - 1);
                        }
                        if (targetPage !== currentPage) {
                            return changePage(targetPage);
                        }
                        return changePage(currentPage);
                    })
                    .catch((e) => console.error(e));
            })
                .catch((err) => {
                    console.error(err);

                })
                .finally(() => {
                    setLoadingDelete(false);
                    setWindowOpen(false);
                    setDeleteIndex(null);
                });
        }
    };

    const updateUser = (index: number, field: keyof User, value: string | boolean) => {
        setUsers(users.map((user, i) => i === index ? {...user, [field]: value} : user));
    };

    return (
        <div className="flex flex-col items-center bg-gray-50 min-h-screen pt-8 pb-6">
            <AdminNavigationHeader/>
            {isAdmin ?  <h1 className="text-4xl font-bold text-gray-800 pb-10">Admin Users Panel</h1> : null}

            {loading ? (
                <Spinner/>
            ) : (
                <div className="w-full max-w-6xl bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-2 text-left text-gray-700">Email</th>
                            <th className="px-4 py-2 text-left text-gray-700">First Name</th>
                            <th className="px-4 py-2 text-left text-gray-700">Last Name</th>
                            <th className="px-4 py-2 text-left text-gray-700">Phone Number</th>
                            <th className="px-4 py-2 text-left text-gray-700">Role</th>
                            <th className="px-4 py-2 text-left text-gray-700">Signup Completed</th>
                            <th className="px-4 py-2 text-left text-gray-700">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user, index) => (
                            <tr key={index} className="border-t">
                                <td className="px-4 py-2 text-gray-700">
                                    {editing === index ? (
                                        <>
                                            <input
                                                type="email"
                                                value={user.email}
                                                onChange={(e) => updateUser(index, 'email', e.target.value)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                            {errors[index]?.email &&
                                                <p className="text-red-500 text-sm">{errors[index].email}</p>}
                                        </>
                                    ) : (
                                        user.email
                                    )}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {editing === index ? (
                                        <>
                                            <input
                                                type="text"
                                                value={user.firstName}
                                                onChange={(e) => updateUser(index, 'firstName', e.target.value)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                            {errors[index]?.firstName &&
                                                <p className="text-red-500 text-sm">{errors[index].firstName}</p>}
                                        </>
                                    ) : (
                                        user.firstName
                                    )}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {editing === index ? (
                                        <>
                                            <input
                                                type="text"
                                                value={user.lastName}
                                                onChange={(e) => updateUser(index, 'lastName', e.target.value)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                            {errors[index]?.lastName &&
                                                <p className="text-red-500 text-sm">{errors[index].lastName}</p>}
                                        </>
                                    ) : (
                                        user.lastName
                                    )}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {editing === index ? (
                                        <>
                                            <input
                                                type="text"
                                                value={user.phoneNumber}
                                                onChange={(e) => updateUser(index, 'phoneNumber', e.target.value)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                            {errors[index]?.phoneNumber &&
                                                <p className="text-red-500 text-sm">{errors[index].phoneNumber}</p>}
                                        </>
                                    ) : (
                                        user.phoneNumber
                                    )}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {editing === index ? (
                                        <select
                                            value={user.role}
                                            onChange={(e) => updateUser(index, 'role', e.target.value)}
                                            className="border rounded px-2 py-1 w-full"
                                        >
                                            {Object.values(UserRoles).map((role) => (
                                                <option key={role} value={role}>
                                                    {role}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        user.role
                                    )}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {editing === index ? (
                                        <input
                                            type="checkbox"
                                            checked={user.signupCompleted}
                                            onChange={(e) => updateUser(index, 'signupCompleted', e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                    ) : (
                                        user.signupCompleted ? 'Yes' : 'No'
                                    )}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    {editing === index ? (
                                        <div className="flex space-x-2">
                                            <Button text="Save" color="bg-green-500" onClick={() => handleSave(index)}/>
                                            <Button text="Cancel" color="bg-red-600" onClick={handleCancel}/>
                                        </div>
                                    ) : (
                                        <div className="flex space-x-2">
                                            <Button text="Edit" color="bg-blue-500" onClick={() => handleEdit(index)}/>
                                            <Button text="Delete" color="bg-red-500"
                                                    onClick={() => {
                                                        setDeleteIndex(index);
                                                        setWindowOpen(true);
                                                    }}/>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <div className="flex justify-between items-center w-full p-4 border-t">
                        <button
                            className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
                            onClick={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="text-gray-700">
                            Page {currentPage} of {numberOfPages}
                        </span>
                        <button
                            className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
                            onClick={() => changePage(currentPage + 1)}
                            disabled={currentPage === numberOfPages || numberOfPages === 0}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={windowOpen}
                onConfirm={handleDelete}
                onCancel={() => {
                    setDeleteIndex(null);
                    setWindowOpen(false);
                }}
                title="Confirm Deletion"
                message="Are you sure you want to delete this user?"
                isLoading={loadingDelete}
            />
        </div>
    );
}

export default Users;