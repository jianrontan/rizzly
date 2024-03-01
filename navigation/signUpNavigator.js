import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { HeaderBackButton } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SignInPhone from '../authentication/signupPhone';
import SignUp from '../authentication/signup';
import { FONT, COLORS, SIZES, icons } from '../constants';
import appStyles from '../components/app/app.style';

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
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Pick your sign up method</Text>
            </View>
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
        navigation.goBack();
    };

    return (
        <Stack.Navigator
            initialRouteName="Sign Up Options"
            screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: "#6e4639" },
                headerTitle: "Sign Up",
                headerTitleAlign: 'center',
                headerTitleStyle: appStyles.headerFont2,
            })}
        >
            <Stack.Screen
                name="Sign Up Options"
                component={SignUpOptionsScreen}
                options={{
                    headerLeft: () => (
                        <HeaderBackButton onPress={handleGoBack} />
                    ),
                }}
            />
            <Stack.Screen
                name="Sign Up With Phone"
                component={SignInPhone}
            />
            <Stack.Screen
                name="Sign Up with Email"
                component={SignUp}
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

export default SignUpOptionsStack;
