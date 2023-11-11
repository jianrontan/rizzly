import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";

import BottomTabStack from "./bottomTabNavigator";

const Drawer = createDrawerNavigator();

export default function DrawerStack() {
    return (
        <NavigationContainer>
            <Drawer.Navigator>
                <Drawer.Screen name="Drawer" component={BottomTabStack} />
            </Drawer.Navigator>
        </NavigationContainer>
    )
}