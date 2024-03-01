import React from "react";
import { useAuthentication } from "../hooks/useAuthentication";

import DrawerStack from "./drawerNavigator";
import AuthStack from "./authNavigator";

export default function RootNavigation() {
    const { user } = useAuthentication();

    return (
        <>
            {user ? <DrawerStack /> : <AuthStack />}
        </>
    )
}
