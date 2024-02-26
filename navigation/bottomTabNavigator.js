import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { HeaderBackButton } from "@react-navigation/elements";
import { useSelector } from 'react-redux';

import Home from "../screens/HomeScreen";
import ChatStack from "./chatNavigator";
import MatchesScreen from "../screens/MatchesScreen";
import ChatRoomScreen from "../screens/ChatRoomScreen";
import ViewOtherProfile from "../screens/ViewOtherProfile";
import LikesScreen from "../screens/LikesScreen";
import ScreenHeaderBtn from "../components/button/ScreenHeaderBtn";
import { COLORS, FONT, icons } from "../constants";
import appStyles from "../components/app/app.style";

const Tab = createBottomTabNavigator();

export default function BottomTabStack({ navigation }) {
    const likesCount = useSelector(state => state.editProfileReducer.likesVal);
    const unreadChatsCount = useSelector(state => state.editProfileReducer.chatVal);
    const matches = useSelector(state => state.editProfileReducer.matchesVal);

    const CustomHeaderTitle = ({ userFirstName, imageUrl, navigation, matchId }) => (
        <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => navigation.navigate('ViewOtherProfile', { matchId })}
        >
            <Image
                style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    marginLeft: 0,
                    marginRight: 10,
                }}
                source={{ uri: imageUrl }}
            />
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{userFirstName}</Text>
        </TouchableOpacity>
    );

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
                    <Text style={[appStyles.headerFont, { color: 'white' }]}>Rizzly</Text>
                ),
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: '#8c6c5d', // Background color
                },
                headerTintColor: 'white', // Color of drawer icon
                headerTitleStyle: {
                    color: 'white', // Color of title
                },
                tabBarStyle: {
                    backgroundColor: '#8c6c5d', // Background color of the entire bottom tab
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home" color={color} size={size} />
                    ),
                    tabBarLabel: 'Home',
                    tabBarLabelStyle: { color: 'white' }, // Change the text color to white
                    tabBarActiveTintColor: 'white', // Change the active tab color to white
                }}
            />
            <Tab.Screen
                name="Likes"
                component={LikesScreen}
                options={({ color, size }) => ({
                    tabBarIcon: () => (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="heart" color={color} size={30} style={{ top: 1 }} />
                            <View style={{ position: 'absolute', zIndex: 1 }}>
                                <Text style={{ marginLeft: 11, zIndex: 1, color: 'white', fontFamily: FONT.medium }}>{likesCount}</Text>
                            </View>
                        </View>
                    ),
                    tabBarLabel: 'Likes',
                    tabBarLabelStyle: { color: 'white' },
                    tabBarActiveTintColor: 'white',
                })}
            />
            <Tab.Screen
                name="Chats"
                component={MatchesScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="chat" color={color} size={30} />
                            <View style={{ position: 'absolute', zIndex: 1 }}>
                                <Text style={{ marginLeft: 0, zIndex: 1, color: 'white', fontFamily: FONT.medium, top: 4 }}>{unreadChatsCount}</Text>
                            </View>
                        </View>
                    ),
                    tabBarLabel: 'Chats',
                    tabBarLabelStyle: { color: 'white' },
                    tabBarActiveTintColor: 'white',
                }}
            />
            <Tab.Screen
                name="ChatRoom"
                component={ChatRoomScreen}
                options={({ route, navigation }) => {
                    const currentMatchId = route.params?.userId;
                    const currentMatch = matches.find(match => match.id === currentMatchId);
                    const userFirstName = currentMatch ? currentMatch.firstName : '';
                    const imageUrl = currentMatch && currentMatch.imageURLs && currentMatch.imageURLs.length > 0
                        ? currentMatch.imageURLs[0]
                        : null;

                    return {
                        tabBarButton: () => null,
                        headerLeft: () => (
                            <HeaderBackButton onPress={() => navigation.navigate('Chats')} />
                        ),
                        headerTitle: () => <CustomHeaderTitle userFirstName={userFirstName} imageUrl={imageUrl} navigation={navigation} matchId={currentMatchId} />,
                        headerRight: () => (
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#D3A042',
                                    borderRadius: 5,
                                    padding: 10,
                                    marginRight: 10,
                                }}
                                onPress={() => {
                                    Alert.alert(
                                        'Report Options',
                                        '',
                                        [
                                            {
                                                text: 'This is not the real person!',
                                                onPress: () => navigation.navigate('Report'),
                                            },
                                            {
                                                text: 'Inappropriate content/ Harassment',
                                                onPress: () => navigation.navigate('Report'),
                                            },
                                            {
                                                text: 'Safety issues',
                                                onPress: () => navigation.navigate('Report'),
                                            },
                                            {
                                                text: 'Cancel',
                                                style: 'cancel',
                                            },
                                        ],
                                    );
                                }}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Report</Text>
                            </TouchableOpacity>
                        ),
                    };
                }}
            />
            <Tab.Screen
                name="ViewOtherProfile"
                component={ViewOtherProfile}
                options={{
                    tabBarButton: () => null,
                    headerLeft: () => (
                        <HeaderBackButton onPress={() => navigation.navigate('ChatRoom')} />
                    ),
                }}
            />
        </Tab.Navigator>
    )
}
