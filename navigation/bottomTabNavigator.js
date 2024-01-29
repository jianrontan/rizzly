import React from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Home from "../screens/HomeScreen";
import ForumScreen from "../screens/ForumScreen";
import ScreenHeaderBtn from "../components/button/ScreenHeaderBtn";
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
                    <Text style={appStyles.headerFont}>Diabeto</Text>
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
                name="Forum"
                component={ForumScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="chat" color={color} size={size} />
                    ),
                    tabBarLabel: 'Forum',
                    tabBarLabelStyle: appStyles.bottomTabLabel,
                    tabBarActiveTintColor: '#824444',
                }}
            />
        </Tab.Navigator>
    )
}