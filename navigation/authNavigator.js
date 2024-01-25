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
import EmailAndPw from '../authentication/EmailAndPwScreen';
import { COLORS } from '../constants';

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
                <Stack.Screen name="EmailAndPw" component={EmailAndPw} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
