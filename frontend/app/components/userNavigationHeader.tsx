import Button from "~/components/button";
import {ROUTES} from "~/constants/routes";
import React, { type JSX } from "react";
import type AdminNavigationHeader from "./adminNavigationHeader";

const UserNavigationHeader = (): JSX.Element => {
    return (
        <div className="absolute top-10 right-10">
            <Button
                text="Home"
                color="bg-blue-600"
                onClick={() => {
                    window.location.href = ROUTES.HOME;
                }}
            />
        </div>
    )
};

export default UserNavigationHeader;