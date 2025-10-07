import Button from "~/components/button";
import {ROUTES} from "~/constants/routes";
import React from "react";

const AdminNavigationHeader = (): JSX.Element => {
    return (
        <div className="absolute top-10 right-10">
            <Button
                text="Admin Panel"
                color="bg-blue-600"
                onClick={() => {
                    window.location.href = ROUTES.ADMIN_PANEL;
                }
                }
            />
        </div>
    )
};

export default AdminNavigationHeader;