import React from 'react';
import { Text, View, Alert, TouchableOpacity, ActivityIndicator, BackHandler } from 'react-native';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { NavigationContainer, getFocusedRouteNameFromRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getAuth } from 'firebase/auth';
import { getDoc, updateDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';

import EditProfileScreen from '../screens/EditProfileScreen';
import EditPhotos from '../screens/EditPhotos';
import AboutMe from '../screens/AboutMe';
import DrawerBackBtn from '../components/button/DrawerBackBtn';
import ScreenHeaderBtn from '../components/button/ScreenHeaderBtn';
import appStyles from '../components/app/app.style';
import { FONT, icons } from '../constants';

const Stack = createStackNavigator();

export default function EditProfileStack() {

    const navigation = useNavigation();

    return (
        <Stack.Navigator
            initialRouteName="Edit Profile Screen"
            backBehavior="initialRoute"
            screenOptions={({ route }) => ({
                headerTitle: route.name,
                headerTitleAlign: 'center',
                headerShadowVisible: 'true',
                headerTitleStyle: appStyles.headerFont,
                headerLeft: () => {
                    const navigation = useNavigation();
                    return (
                        <View style={appStyles.buttonPadding}>
                            <DrawerBackBtn
                                iconUrl={icons.left}
                                dimension='60%'
                                title='goBack'
                                onPress={() => {
                                    if (navigation.canGoBack()) {
                                        navigation.goBack();
                                    } else {
                                        navigation.navigate('App');
                                    }
                                }}
                            />
                        </View>
                    )
                },
            })}
        >
            <Stack.Screen
                name="Edit Profile"
                component={EditProfileScreen}
            />
            <Stack.Screen
                name="Edit Photos"
                component={EditPhotos}
            />
            <Stack.Screen
                name="About Me"
                component={AboutMe}
            />
        </Stack.Navigator>
    )
};