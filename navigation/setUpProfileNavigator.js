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

import Name from '../setUpScreens/NameS';
import Birthday from '../setUpScreens/Birthday';
import Gender from '../setUpScreens/Gender';
import Orientation from '../setUpScreens/Orientation';
import Photos from '../setUpScreens/Photos'
import MyLocation from '../setUpScreens/LocationS';
import Height from '../setUpScreens/HeightS';
import Ethnicity from '../setUpScreens/EthnicityS';
import Religion from '../setUpScreens/ReligionS';
import SelfieCapture from '../setUpScreens/SelfieCapture';
import DrawerBackBtn from '../components/button/DrawerBackBtn';
import SetUpBackBtn from '../components/button/SetUpBackBtn';
import appStyles from '../components/app/app.style';
import { setHasUnsavedChangesExport, setAboutMeChanges, setViewProfileChanges } from '../redux/actions';
import { FONT, icons } from '../constants';

const Stack = createStackNavigator();

export default function SetUpProfile() {

    const navigation = useNavigation();

    return (
        <Stack.Navigator
            initialRouteName="Name"
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
                            <SetUpBackBtn
                                iconUrl={icons.left}
                                dimension='60%'
                                title='goBack'
                            />
                        </View>
                    )
                },
            })}
        >
            <Stack.Screen name="Name" component={Name} options={{ headerLeft: () => null }} />
            <Stack.Screen name="Birthday" component={Birthday} />
            <Stack.Screen name="Gender" component={Gender} />
            <Stack.Screen name="Preferred Genders" component={Orientation} />
            <Stack.Screen name="Photos" component={Photos} />
            <Stack.Screen name="Location" component={MyLocation} />
            <Stack.Screen name="Height" component={Height} />
            <Stack.Screen name="Ethnicity" component={Ethnicity} />
            <Stack.Screen name="Religion" component={Religion} />
            <Stack.Screen name="Selfie" component={SelfieCapture} />
        </Stack.Navigator>
    )
};