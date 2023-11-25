import React from 'react';
import { Text, View, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import Welcome from '../authentication/welcome';
import SignIn from '../authentication/signin';
import SignUp from '../authentication/signup';
import ForgotPassword from '../authentication/forgotpassword';
import { COLORS } from '../constants';

const Stack = createNativeStackNavigator();
const auth = getAuth();

export default function AuthStack() {
    // State variable appIsReady tracks when app is ready to render
    const [appIsReady, setAppIsReady] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load fonts
    const [fontsLoaded] = useFonts({
        MontBold: require('../assets/fonts/Montserrat-Bold.ttf'),
        MontMed: require('../assets/fonts/Montserrat-Medium.ttf'),
        MontReg: require('../assets/fonts/Montserrat-Regular.ttf'),
    });

    // useEffect hook calls prepare function
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

    // useCallback creates a memoized callback onLayoutRootView that only changes appIsReady / fontsLoaded changes
    const onLayoutRootView = useCallback(async () => {
        if (appIsReady && fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady, fontsLoaded]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setLoading(false);
            } else {
                setLoading(false);
            }
        });
        return() => unsubscribe
    }, []);

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
                screenOptions={{
                    headerStyle: { backgroundColor: COLORS.lightBeige },
                    headerTitle: () => (
                        <Text>Welcome</Text>
                    ),
                    headerTitleAlign: 'center',
                }}
            >
                <Stack.Screen name="Welcome" component={Welcome} />
                <Stack.Screen name="SignUp" component={SignUp} />
                <Stack.Screen name="SignIn" component={SignIn} />
                <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}