import React from 'react';
import { View, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import EditProfileScreen from '../screens/EditProfileScreen';
import MyName from '../screens/MyName';
import MyGender from '../screens/MyGender';
import MySexuality from '../screens/Sexuality';
import EditPhotos from '../screens/EditPhotos';
import MyLocation from '../screens/Location';
import AboutMe from '../screens/AboutMe';
import Height from '../screens/Height';
import Ethnicity from '../screens/Ethnicity';
import Religion from '../screens/Religion';
import Children from '../screens/Children';
import Education from '../screens/Education';
import Work from '../screens/Work';
import Vices from '../screens/Vices';
import DrawerBackBtn from '../components/button/DrawerBackBtn';
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
                headerTitleStyle: [appStyles.headerFont, { color: 'white' }], // Make the text white
                headerStyle: {
                    backgroundColor: '#8c6c5d',
                },
                headerTintColor: 'white', // Make the header icon white
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
                name="My Gender"
                component={MyGender}
            />
            <Stack.Screen
                name="My Sexuality"
                component={MySexuality}
            />
            <Stack.Screen
                name="Edit Photos"
                component={EditPhotos}
            />
            <Stack.Screen
                name="My Location"
                component={MyLocation}
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
                name="Ethnicity"
                component={Ethnicity}
            />
            <Stack.Screen
                name="Religion"
                component={Religion}
            />
            <Stack.Screen
                name="Children"
                component={Children}
            />
            <Stack.Screen
                name="Education"
                component={Education}
            />
            <Stack.Screen
                name="Work"
                component={Work}
            />
            <Stack.Screen
                name="Vices"
                component={Vices}
            />
        </Stack.Navigator>
    )
};
