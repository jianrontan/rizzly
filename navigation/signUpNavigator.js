import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SignInPhone from '../authentication/signupPhone';
import SignUp from '../authentication/signup';

const Stack = createStackNavigator();

const SignUpOptionsScreen = () => {
    const navigation = useNavigation();

    const handlePhoneSignUp = () => {
        navigation.navigate('Sign Up With Phone');
    };

    const handleEmailSignUp = () => {
        navigation.navigate('Sign Up with Email');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={handlePhoneSignUp}>
                <Text style={styles.buttonText}>Phone Number</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleEmailSignUp}>
                <Text style={styles.buttonText}>Sign Up with Email</Text>
            </TouchableOpacity>
        </View>
    );
};

const SignUpOptionsStack = () => {
    const navigation = useNavigation();

    const handleGoBack = () => {
        navigation.goBack(); // Navigate back to the previous screen (Sign Up Options)
    };

    return (
        <Stack.Navigator initialRouteName="Sign Up Options">
            <Stack.Screen
                name="Sign Up Options"
                component={SignUpOptionsScreen}
                options={{
                    headerShown: false,
                    headerLeft: () => (
                        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                            <Text style={styles.backButtonText}>{'< Back'}</Text>
                        </TouchableOpacity>
                    ),
                }}
            />
            <Stack.Screen
                name="Sign Up With Phone"
                component={SignInPhone}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Sign Up with Email"
                component={SignUp}
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
    backButton: {
        marginLeft: 10,
    },
    backButtonText: {
        color: 'white',
    },
});

export default SignUpOptionsStack;
