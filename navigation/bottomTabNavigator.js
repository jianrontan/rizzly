import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import ChatStack from "./chatNavigator";
import Home from "../home/home";

const Tab = createBottomTabNavigator();

export default function BottomTabStack() {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Chats" component={ChatStack} />
        </Tab.Navigator>
    )
}