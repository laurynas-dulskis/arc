import React from "react";
import {ensureAdminAccess} from "~/utils/authUtils";

export function Users() {
    const [isAdmin, setIsAdmin] = React.useState(false);

    React.useEffect(() => {
        setIsAdmin(ensureAdminAccess());
    }, []);

    return (
        <div>
            {isAdmin ? <h1>Admin Users Panel</h1> : null}
            {/* Admin panel content goes here */}
        </div>
    );
}

export default Users;