import React from "react";
import { StatusBar } from "expo-status-bar";

import DrawerStack from "./drawerNavigator";
import { COLORS } from "../constants";

export default function RootNavigation() {
    return (
        <>
            <DrawerStack />
        </>
    )
}