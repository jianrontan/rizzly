import React from 'react';
import { Text, View, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { NavigationContainer, getFocusedRouteNameFromRoute, useNavigation } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { getAuth } from 'firebase/auth';
import { getDoc, updateDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';

import BottomTabStack from "./bottomTabNavigator";
import SettingsScreen from '../drawer/settings';
import ProfileScreen from '../screens/ProfileScreen';
import ScreenHeaderBtn from '../components/app/button/ScreenHeaderBtn';
import appStyles from '../components/app/app.style';
import { FONT, icons } from '../constants';

const Drawer = createDrawerNavigator();
const auth = getAuth();

export default function DrawerStack() {
    const [profileComplete, setProfileComplete] = useState(false);
    const [loading, setLoading] = useState(true);

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

    // Get the data from Firebase
    useEffect(() => {
        const userId = auth.currentUser.uid;
        const userDocRef = doc(db, 'profiles', userId);
    
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            // If exists stop loading
            if (docSnap.exists()) {
                const data = docSnap.data();
                setProfileComplete(data.complete);
                setLoading(false);
            // Else create a new doc for the user
            } else {
                setDoc(userDocRef, {
                    name: null,
                    complete: false,
                    id: userId
                });
                setLoading(false);
            }
        });
        return() => unsubscribe();
    }, []);    

    // Render loading page
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const logoutConfirmation = async () => {
        try {
            await auth.signOut();
            console.log('User signed out!');
        } catch (error) {
            console.error('Error signing out: ', error);
        }
    };

    function CustomDrawerContent(props) {
        return (
            <DrawerContentScrollView {...props}>
                <DrawerItemList {...props} />
                <TouchableOpacity
                    style={appStyles.logoutDrawer}
                    title="Logout"
                    onPress={() =>
                        Alert.alert(
                            'Logout',
                            'Are you sure you want to logout?',
                            [
                                {
                                    text: 'Cancel',
                                    style: 'cancel',
                                },
                                {
                                    text: 'OK',
                                    onPress: logoutConfirmation,
                                },
                            ],
                        )
                    }
                >
                    <Text style={appStyles.logoutDrawerText}>Logout</Text>
                </TouchableOpacity>
            </DrawerContentScrollView>
        );
    }

    if (!appIsReady || !fontsLoaded) {
        return null;
    }

    return (
        <NavigationContainer onLayout={onLayoutRootView}>
            <Drawer.Navigator
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                initialRouteName={profileComplete? 'App' : 'Profile'}
                backBehavior='initalRoute'
                screenOptions={({ route }) => ({
                    drawerStyle: {
                        width: 180,
                    },
                    drawerLabelStyle: {
                        fontFamily: FONT.medium,
                        color: 'black',
                    },
                    headerTitle: route.name,
                    headerTitleAlign: 'center',
                    headerShadowVisible: 'true',
                    headerTitleStyle: appStyles.headerFont,
                    drawerActiveTintColor: 'gray',
                    headerLeft: () => {
                        const navigation = useNavigation();
                        return (
                            <View style={appStyles.buttonPadding}>
                                <ScreenHeaderBtn
                                    iconUrl={icons.left}
                                    dimension='60%'
                                    title='goBack'
                                    onPress={() => navigation.navigate('App')}
                                />
                            </View>
                        )
                    },
                })}
            >
                <Drawer.Screen name="App" children={(props) => <BottomTabStack {...props} />} options={{ drawerItemStyle: { height: 0 }, headerShown: false }} />
                <Drawer.Screen name="Profile" component={ProfileScreen} options={{ drawerItemStyle: { height: 0 }, headerShown: false }} />
                <Drawer.Screen name="Settings" component={SettingsScreen}/>
            </Drawer.Navigator>
        </NavigationContainer>
    )
};