import React from "react";
import Button from "~/components/button";
import {ensureAdminAccess, logout} from "~/utils/authUtils";
import {ROUTES} from "~/constants/routes";

export function AdminPanel() {
    const [isAdmin, setIsAdmin] = React.useState(false);

    React.useEffect(() => {
        setIsAdmin(ensureAdminAccess());
    }, []);

    return (
        <div className="flex flex-col items-center bg-gray-50 min-h-screen pt-8 pb-6">
            {isAdmin ?  <h1 className="text-4xl font-bold text-gray-800">Admin panel</h1> : null}
            <div className="grid grid-cols-3 gap-4 mt-6">
            <Button
                text="Users"
                color="bg-blue-600"
                onClick={() => {
                window.location.href = ROUTES.ADMIN_USERS;
                }}
            />
            <Button
                text="Reservations"
                color="bg-blue-600"
                onClick={() => {
                window.location.href = ROUTES.ADMIN_RESERVATIONS;
                }}
            />
            <Button
                text="Flights"
                color="bg-blue-600"
                onClick={() => {
                window.location.href = ROUTES.ADMIN_FLIGHTS;
                }}
            />
            <Button
                text="Home"
                color="bg-blue-600"
                onClick={() => {
                window.location.href = ROUTES.HOME;
                }}
            />
            <Button
                text="Reports"
                color="bg-blue-600"
                onClick={() => {
                window.location.href = ROUTES.REPORTS;
                }}
            />
            <Button
                text="Logout"
                color="bg-red-600"
                onClick={logout}
            />
            </div>
        </div>
    );
}

export default AdminPanel;