import React from "react";
import {ensureAdminAccess} from "~/utils/authUtils";
import AdminNavigationHeader from "~/components/adminNavigationHeader";

export function Flights() {
    const [isAdmin, setIsAdmin] = React.useState(false);

    React.useEffect(() => {
        setIsAdmin(ensureAdminAccess());
    }, []);

    return (
        <div className="flex flex-col items-center bg-gray-50 min-h-screen pt-8 pb-6">
            <AdminNavigationHeader/>
            {isAdmin ?  <h1 className="text-4xl font-bold text-gray-800">Admin Flight Panel</h1> : null}
            {/* Admin panel content goes here */}
        </div>
    );
}

export default Flights;