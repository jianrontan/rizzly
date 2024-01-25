import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { Dimensions } from 'react-native'

import { COLORS, SIZES, FONT } from '../constants';

const { width, height } = Dimensions.get('window');
const cardWidth = width;
const cardHeight = height - 170;

const ViewProfile = ({ navigation }) => {
    const auth = getAuth();
    const [currentUserData, setCurrentUserData] = useState(null);

    const fetchCurrentUser = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                console.error('No user is currently signed in');
                return;
            }

            const currentUserDocRef = doc(db, 'profiles', auth.currentUser.uid);
            const currentUserDoc = await getDoc(currentUserDocRef);

            if (currentUserDoc.exists()) {
                const userData = currentUserDoc.data();

                // Convert the date of birth from a Timestamp to a Date object
                const dob = userData.datePickerValue.toDate();

                // Get today's date
                const today = new Date();

                // Calculate the user's age
                let age = today.getFullYear() - dob.getFullYear();
                const m = today.getMonth() - dob.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                    age--;
                }

                // Add the age to the user data
                userData.age = age;

                setCurrentUserData(userData);
            }
        } catch (error) {
            console.error('Error fetching current user data:', error);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            // Re-fetch current user data when the screen is focused
            fetchCurrentUser();
        }, [])
    );

    return (
        <SafeAreaView style={styles.container}>
            {currentUserData && (
                <View style={styles.cardContainer}>
                    <Image
                        source={{ uri: currentUserData.imageURLs[0] }}
                        onLoad={() => console.log('Image loaded')}
                        onError={(error) => console.log('Error loading image: ', error)}
                        style={styles.image}
                    />
                    <View style={styles.userInfoContainer}>
                        <Text style={styles.userName}>{currentUserData.firstName || 'No name'}</Text>
                        <Text style={styles.userDetails}>{`${currentUserData.gender || 'No gender'}, Age: ${currentUserData.age || 'No age'}`}</Text>
                        <Text style={styles.userDetails}>Number of retakes: {currentUserData.retakes || 'No retakes'} </Text>
                        <Text style={styles.userDetails}>Bio: {currentUserData.bio || 'No bio'} </Text>
                        <Text style={styles.userDetails}>Location: {currentUserData.location || 'No Location'} </Text>
                        <Text style={styles.userDetails}>Age: {currentUserData.age || 'No age'} </Text>
                        <Text style={styles.userDetails}>Ethnicity: {currentUserData.ethnicity.join(', ') || 'No ethnicity'} </Text>
                        <Text style={styles.userDetails}>Religion: {currentUserData.religion || 'No religion'} </Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    cardContainer: {
        flex: 1,
        borderRadius: 1,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadius,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    image: {
        flex: 1, 
        resizeMode: 'cover',
    },
    userInfoContainer: {
        marginTop: SIZES.padding,
    },
    userName: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userDetails: {
        color: 'black',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: cardHeight,
        width: cardWidth,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        height: cardHeight,
        width: cardWidth,
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    arrowIcon: {
        position: 'absolute',
        bottom: 20,
        right: 20,
    },
    modalinfo: {
        color: 'black',
        fontSize: 16,
    }
});

export default ViewProfile;
