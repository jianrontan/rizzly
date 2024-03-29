import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

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