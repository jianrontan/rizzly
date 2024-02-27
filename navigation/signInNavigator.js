import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SignInPhone from '../authentication/signinPhone';
import SignInEmail from '../authentication/signinEmail';

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
    return (
        <Stack.Navigator initialRouteName="Sign In Options">
            <Stack.Screen
                name="Sign In Options"
                component={SignInOptionsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Sign In With Phone"
                component={SignInPhone}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Sign In with Email"
                component={SignInEmail}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#6e4639',
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#D3A042',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginVertical: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
});

export default SignInOptionsStack;
