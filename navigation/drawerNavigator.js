import React from 'react';
import { Text, View, Alert, TouchableOpacity, ActivityIndicator, BackHandler, StyleSheet } from 'react-native';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import BottomTabStack from "./bottomTabNavigator";
import SettingsScreen from '../screens/Settings';
import LoadingScreen from '../screens/LoadingScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ViewProfile from '../screens/ViewProfile';
import SelfieCapture from '../setUpScreens/SelfieCapture';
import PauseProfile from '../screens/PauseProfile';
import DeleteAccountScreen from '../screens/DeleteAccount';
import ContactUsScreen from '../screens/Contact';
import BlockList from '../screens/BlockList';
import DrawerBackBtn from '../components/button/DrawerBackBtn';
import ScreenHeaderBtn from '../components/button/ScreenHeaderBtn';
import SetUpProfile from './setUpProfileNavigator';
import EditProfileStack from './editProfileNavigator.js';
import Units from '../screens/Units';
import appStyles from '../components/app/app.style';
import { setHasUnsavedChangesExport, setAboutMeChanges, setViewProfileChanges, setSaveChanges } from '../redux/actions';
import { FONT, icons } from '../constants';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
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
    const unsubscribe = useRef();;

    useEffect(() => {
        if (auth.currentUser) {
            const userId = auth.currentUser.uid;
            const userDocRef = doc(db, 'profiles', userId);

            unsubscribe.current = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProfileComplete(data.complete);
                    setLoading(false);
                } else {
                    setProfileComplete(false);
                    setLoading(false);
                }
            });
        } else {
            console.log("User is not logged in.")
        }

        return () => {
            if (unsubscribe.current) {
                unsubscribe.current();
            }
        };
    }, []);

    // Render loading page
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // LOGOUT
    const logoutConfirmation = async () => {
        if (auth.currentUser) {
            try {
                if (unsubscribe.current) {
                    unsubscribe.current();
                }
                await auth.signOut();
                console.log('User signed out!');
            } catch (error) {
                console.error('Error signing out: ', error);
            }
        } else {
            console.log("User is not logged in.")
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

    // EDIT PROFILE
    const EditProfileNavigator = () => {
        return (
            <Tab.Navigator
                tabBar={(props) => <CustomTabBar {...props} />}
                initialRouteName="Edit Profile Navigator"
                backBehavior="initialRoute"
                screenOptions={({ route }) => ({
                    headerTitle: "View Profile",
                    headerTitleAlign: 'center',
                    headerShadowVisible: 'true',
                    headerTitleStyle: appStyles.headerFont,
                    headerLeft: () => {
                        const navigation = useNavigation();
                        return (
                            <View style={appStyles.buttonPadding}>
                                <ScreenHeaderBtn
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
                <Tab.Screen
                    name="Edit"
                    component={EditProfileStack}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="lead-pencil" color={color} size={size} />
                        ),
                        tabBarLabel: 'Edit',
                        tabBarLabelStyle: appStyles.bottomTabLabel,
                        tabBarActiveTintColor: '#824444',
                    }}
                />
                <Tab.Screen
                    name="View"
                    component={ViewProfile}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="eye" color={color} size={size} />
                        ),
                        tabBarLabel: 'View',
                        tabBarLabelStyle: appStyles.bottomTabLabel,
                        tabBarActiveTintColor: '#824444',
                    }}
                />
            </Tab.Navigator>
        )
    };

    const CustomTabBar = (props) => {
        const navigation = useNavigation();
        const dispatch = useDispatch();

        const hasUnsavedChangesExportVal = useSelector(state => state.editProfileReducer.hasUnsavedChangesExportVal);
        const aboutMeChangesVal = useSelector(state => state.editProfileReducer.aboutMeChangesVal);
        const viewProfileChangesVal = useSelector(state => state.editProfileReducer.viewProfileChangesVal);

        const handleTabPress = (route, isFocused) => {
            if (route.name === 'View' && (viewProfileChangesVal || aboutMeChangesVal || hasUnsavedChangesExportVal) && !isFocused) {
                dispatch(setSaveChanges(true));
            } else {
                navigation.navigate(route.name);
            }
        };

        return (
            <View style={{
                flexDirection: 'row',
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 5,
                shadowColor: '#000',
                backgroundColor: 'white'
            }}>
                {props.state.routes.map((route, index) => {
                    const isFocused = props.state.index === index;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={() => handleTabPress(route, isFocused)}
                            style={{ flex: 1 }}
                            activeOpacity={1}
                        >
                            <Text style={{
                                color: isFocused ? '#824444' : 'black',
                                alignSelf: 'center',
                                fontFamily: FONT.bold,
                            }}>
                                {route.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    // SETTINGS
    const SettingsStack = () => {
        return (
            <Stack.Navigator
                initialRouteName="Edit Settings"
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
                                <ScreenHeaderBtn
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
                <Stack.Screen name="Edit Settings" component={SettingsScreen} />
                <Stack.Screen name="PauseProfile" component={PauseProfile} />
                <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
                <Stack.Screen name="Contact" component={ContactUsScreen} />
                <Stack.Screen name="BlockList" component={BlockList} />
                <Stack.Screen name="Units" component={Units} />
            </Stack.Navigator>
        );
    };

    if (!appIsReady || !fontsLoaded) {
        return null;
    };

    // RENDER
    return (
        <NavigationContainer
            onLayout={onLayoutRootView}
        >
            <Drawer.Navigator
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                initialRouteName={profileComplete ? 'App' : 'Profile'}
                backBehavior='initialRoute'
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
                    swipeEdgeWidth: 0,
                    headerLeft: () => {
                        const navigation = useNavigation();
                        return (
                            <View style={appStyles.buttonPadding}>
                                <ScreenHeaderBtn
                                    iconUrl={icons.left}
                                    dimension='60%'
                                    title='goBack'
                                    onPress={() => navigation.goBack()}
                                />
                            </View>
                        )
                    },
                })}
            >
                <Drawer.Screen name="App" children={(props) => <BottomTabStack {...props} />} options={{ drawerItemStyle: { height: 0 }, headerShown: false }} />
                <Drawer.Screen name="Profile" component={SetUpProfile} options={{ headerShown: false }} />
                <Drawer.Screen name="Edit Profile" component={EditProfileNavigator} options={{ headerShown: false }} />
                <Drawer.Screen name="Settings" component={SettingsStack} options={{ headerShown: false }} />
                <Drawer.Screen name="Loading" component={LoadingScreen}/>
            </Drawer.Navigator>
        </NavigationContainer>
    )
};
