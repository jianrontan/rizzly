import React from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';

import Home from "../screens/HomeScreen";
import ChatStack from "./chatNavigator";
import LikesScreen from "../screens/LikesScreen";
import ScreenHeaderBtn from "../components/button/ScreenHeaderBtn";
import { COLORS, FONT, icons } from "../constants";
import appStyles from "../components/app/app.style"

const Tab = createBottomTabNavigator();

export default function BottomTabStack({ navigation }) {
    const likesCount = useSelector(state => state.editProfileReducer.likesVal);
    const matchesCount = useSelector(state => state.editProfileReducer.countVal)
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
                        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="heart" color={color} size={size} />
                        <Text>{likesCount}</Text>
                        </View>
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
                        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="chat" color={color} size={size} />
                        <Text>{matchesCount}</Text>
                        </View>
                    ),
                    tabBarLabel: 'Chats',
                    tabBarLabelStyle: appStyles.bottomTabLabel,
                    tabBarActiveTintColor: '#824444',
                }}
            />
        </Tab.Navigator>
    )
}