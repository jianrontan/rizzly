import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Home from "../home/home";
import ChatStack from "./chatNavigator";
import LikesScreen from "../screens/LikesScreen";
import ScreenHeaderBtn from "../components/app/button/ScreenHeaderBtn";
import { COLORS, icons } from "../constants";

const Tab = createBottomTabNavigator();

export default function BottomTabStack({ navigation }) {
    return (
        <Tab.Navigator
        initialRouteName='Home'
        screenOptions={{
            headerLeft: () => (
                <ScreenHeaderBtn
                    iconUrl={icons.menu}
                    dimension="60%"
                    onPress={() => navigation.openDrawer()}
                />
            ),
            headerTitle: () => (
                <Text>App</Text>
            ),
            headerTitleAlign: 'center',
        }}>
            <Tab.Screen name="Home" component={Home}/>
            <Tab.Screen name="Likes" component={LikesScreen}/>
            <Tab.Screen name="Chats" component={ChatStack}/>
        </Tab.Navigator>
    )
}