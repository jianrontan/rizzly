import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HeaderBackButton } from '@react-navigation/elements';

import SignInPhone from '../authentication/signinPhone';
import SignInEmail from '../authentication/signinEmail';
import appStyles from '../components/app/app.style';

import { FONT, SIZES, COLORS, icons } from '../constants';

const Stack = createStackNavigator();

const SignInOptionsScreen = () => {
    const navigation = useNavigation();

    const handlePhoneSignIn = () => {
        navigation.navigate('Sign In With Phone');
    };

    const handleEmailSignIn = () => {
        navigation.navigate('Sign In with Email');
    };

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Pick your sign up method</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={handlePhoneSignIn}>
                <Text style={styles.buttonText}>Phone Number</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleEmailSignIn}>
                <Text style={styles.buttonText}>Email Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const SignInOptionsStack = () => {

    const navigation = useNavigation();

    const handleGoBack = () => {
        navigation.goBack();
    };

    return (
        <Stack.Navigator
            initialRouteName="Sign In Options"
            screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: "#6e4639" },
                headerTitle: "Sign In",
                headerTitleAlign: 'center',
                headerTitleStyle: appStyles.headerFont2,
            })}
        >
            <Stack.Screen
                name="Sign In Options"
                component={SignInOptionsScreen}
                options={{
                    headerLeft: () => (
                        <HeaderBackButton onPress={handleGoBack} />
                    ),
                }}
            />
            <Stack.Screen
                name="Sign In With Phone"
                component={SignInPhone}
            />
            <Stack.Screen
                name="Sign In with Email"
                component={SignInEmail}
            />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#6e4639',
        alignItems: 'center',
    },
    titleContainer: {
        paddingVertical: SIZES.xLarge,
    },
    title: {
        fontFamily: FONT.medium,
        fontSize: SIZES.mediumlarge,
        color: 'white'
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D3A042',
        borderRadius: 8,
        paddingVertical: SIZES.smallmedium,
        paddingHorizontal: SIZES.smallmedium,
        marginVertical: SIZES.smallmedium,
    },
    buttonText: {
        fontSize: 18,
        fontFamily: FONT.medium,
        color: COLORS.white,
    },
});

export default SignInOptionsStack;
