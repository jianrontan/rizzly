import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getAuth } from 'firebase/auth';

import Welcome from '../authentication/welcome';
import ForgotPassword from '../authentication/forgotpassword';
import ScreenHeaderBtn from '../components/button/ScreenHeaderBtn';
import { COLORS, FONT, icons } from '../constants';
import SignInOptionsStack from './signInNavigator';
import SignUpOptionsStack from './signUpNavigator';

import appStyles from '../components/app/app.style';

const Stack = createNativeStackNavigator();
const auth = getAuth();

export default function AuthStack() {
    const [appIsReady, setAppIsReady] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const [fontsLoaded] = useFonts({
        MontBold: require('../assets/fonts/Montserrat-Bold.ttf'),
        MontMed: require('../assets/fonts/Montserrat-Medium.ttf'),
        MontReg: require('../assets/fonts/Montserrat-Regular.ttf'),
    });

    useEffect(() => {
        async function prepare() {
            try {
                await SplashScreen.preventAutoHideAsync();
            } catch (error) {
                console.warn(error);
            } finally {
                setAppIsReady(true);

                if (fontsLoaded) {
                    await SplashScreen.hideAsync();
                }
            }
        }
        prepare();
    }, [fontsLoaded]);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady && fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady, fontsLoaded]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                setLoading(false);
            } else {
                setUser(null);
                setLoading(false);
            }
        });
        return () => unsubscribe
    }, []);

    if (user) {
        console.log(user.uid);
    } else {
        console.log("No user is signed in.");
    }

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    };

    if (!appIsReady || !fontsLoaded) {
        return null;
    };

    return (
        <NavigationContainer onlayout={onLayoutRootView}>
            <Stack.Navigator
                initialRouteName='Welcome'
                screenOptions={({ route }) => ({
                    headerStyle: { backgroundColor: "#6e4639" },
                    headerTitle: route.name,
                    headerTitleAlign: 'center',
                    headerTitleStyle: appStyles.headerFont2,
                })}
            >
                <Stack.Screen
                    name="Welcome"
                    component={Welcome}
                    options={{ title: 'Rizzly' }}
                />
                <Stack.Screen
                    name="Sign Up"
                    component={SignUpOptionsStack}
                    options={{ title: 'Sign Up', headerShown: false }}
                />
                <Stack.Screen
                    name="Sign In"
                    component={SignInOptionsStack}
                    options={{ title: 'Sign In', headerShown: false }}
                />
                <Stack.Screen
                    name="ForgotPassword"
                    component={ForgotPassword}
                    options={{ title: 'Forgot Password' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
