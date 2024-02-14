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
    const unreadChatsCount = useSelector(state => state.editProfileReducer.chatVal)
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
                    <Text style={appStyles.headerFont}>Rizzly</Text>
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
                options={({ color, size }) => ({
                    tabBarIcon: () => (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="heart" color={COLORS.primary} size={30} style={{ top: 1}} />
                            <View style={{ position: 'absolute', zIndex: 1 }}>
                                <Text style={{ marginLeft: 11, zIndex: 1, color:'white', fontFamily: FONT.medium }}>{likesCount}</Text>
                            </View>
                        </View>
                    ),
                    tabBarLabel: 'Likes',
                    tabBarLabelStyle: appStyles.bottomTabLabel,
                    tabBarActiveTintColor: '#824444',
                })}
            />
            <Tab.Screen
                name="Chats"
                component={ChatStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="chat" color={color} size={30} />
                            <View style={{ position: 'absolute', zIndex: 1 }}>
                                <Text style={{ marginLeft: 0, zIndex: 1, color:'white', fontFamily: FONT.medium, top: 4}}>{unreadChatsCount}</Text>
                            </View>
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