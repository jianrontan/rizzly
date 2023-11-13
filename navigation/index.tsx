import React from "react";
import { StatusBar } from "expo-status-bar";
import { useAuthentication } from "../hooks/useAuthentication";

import DrawerStack from "./drawerNavigator";
import AuthStack from "./authNavigator";
import { COLORS } from "../constants";

export default function RootNavigation() {
    const { user } = useAuthentication();

    return (
        <>
            {user ? <DrawerStack /> : <AuthStack />}
        </>
    )
}