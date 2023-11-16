import React from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Home from "../screens/home";
import ChatStack from "./chatNavigator";
import LikesScreen from "../screens/LikesScreen";
import ScreenHeaderBtn from "../components/app/button/ScreenHeaderBtn";
import { COLORS, FONT, icons } from "../constants";
import appStyles from "../components/app/app.style"

const Tab = createBottomTabNavigator();

export default function BottomTabStack({ navigation }) {
    return (
        <Tab.Navigator
        initialRouteName='Home'
        screenOptions={{
            headerLeft: () => (
                <View style={appStyles.buttonPadding}>
                    <ScreenHeaderBtn
                        iconUrl={icons.menu}
                        dimension="60%"
                        onPress={() => navigation.openDrawer()}
                    />
                </View>
            ),
            headerTitle: () => (
                <Text style={appStyles.headerFont}>App</Text>
            ),
            headerTitleAlign: 'center',
        }}>
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home" color={color} size={size} />
                    ),
                    tabBarLabel: 'Home',
                    tabBarLabelStyle: appStyles.bottomTabLabel,
                    tabBarActiveTintColor: '#824444',
                }}
            />
            <Tab.Screen
                name="Likes"
                component={LikesScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="heart" color={color} size={size} />
                    ),
                    tabBarLabel: 'Likes',
                    tabBarLabelStyle: appStyles.bottomTabLabel,
                    tabBarActiveTintColor: '#824444',
                }}
            />
            <Tab.Screen
                name="Chats"
                component={ChatStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="chat" color={color} size={size} />
                    ),
                    tabBarLabel: 'Chats',
                    tabBarLabelStyle: appStyles.bottomTabLabel,
                    tabBarActiveTintColor: '#824444',
                }}
            />
        </Tab.Navigator>
    )
}