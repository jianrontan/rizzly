import React from 'react';
import { Text, View, Alert, TouchableOpacity } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { getAuth } from 'firebase/auth';

import Welcome from '../screens/welcome';
import SignUp from '../screens/signup';
import SignIn from '../screens/signin';
import ForgotPassword from '../screens/forgotpassword';
import styles from '../myComponents/common/header/header/header.style';
import { COLORS } from '../constants';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
    // State variable appIsReady tracks when app is ready to render
    const [appIsReady, setAppIsReady] = useState(false);

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
    }, []); // Remove fontsLoaded from the dependency array

    // useCallback creates a memoized callback onLayoutRootView that only changes appIsReady / fontsLoaded changes
    const onLayoutRootView = useCallback(async () => {
        if (appIsReady && fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady, fontsLoaded]);

    if (!appIsReady || !fontsLoaded) {
        return null;
    }

    return (
        <NavigationContainer onLayout={onLayoutRootView}>
            <Stack.Navigator
                initialRouteName='Welcome'
                screenOptions={{
                    headerStyle: { backgroundColor: COLORS.lightBeige },
                    headerTitle: () => (
                        <Text style={styles.headerStyle}>Welcome</Text>
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