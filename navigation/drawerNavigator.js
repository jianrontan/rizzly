import React from 'react';
import { Text, View, Alert, TouchableOpacity } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { getAuth } from 'firebase/auth';

import BottomTabStack from "./bottomTabNavigator";

const Drawer = createDrawerNavigator();

export default function DrawerStack() {
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
        }, [fontsLoaded]);
    
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
            <Drawer.Navigator>
                <Drawer.Screen name="Drawer" component={BottomTabStack} />
            </Drawer.Navigator>
        </NavigationContainer>
    )
}