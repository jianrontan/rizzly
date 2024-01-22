import React from 'react';
import { Text, View, Alert, TouchableOpacity, ActivityIndicator, BackHandler } from 'react-native';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { NavigationContainer, getFocusedRouteNameFromRoute, useNavigation, useIsFocused, useFocusEffect } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { getAuth } from 'firebase/auth';
import { getDoc, updateDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';

import EditProfileScreen from '../screens/EditProfileScreen';
import MyName from '../screens/MyName';
import EditPhotos from '../screens/EditPhotos';
import AboutMe from '../screens/AboutMe';
import Height from '../screens/Height';
import Religion from '../screens/Religion';
import Ethnicity from '../screens/Ethnicity';
import DrawerBackBtn from '../components/button/DrawerBackBtn';
import ScreenHeaderBtn from '../components/button/ScreenHeaderBtn';
import appStyles from '../components/app/app.style';
import { setHasUnsavedChangesExport, setAboutMeChanges, setViewProfileChanges } from '../redux/actions';
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
                name="My Name"
                component={MyName}
            />
            <Stack.Screen
                name="Edit Photos"
                component={EditPhotos}
            />
            <Stack.Screen
                name="About Me"
                component={AboutMe}
            />
            <Stack.Screen
                name="Height"
                component={Height}
            />
            <Stack.Screen
                name="Religion"
                component={Religion}
            />
            <Stack.Screen
                name="Ethnicity"
                component={Ethnicity}
            />
        </Stack.Navigator>
    )
};