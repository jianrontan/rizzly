import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { Dimensions } from 'react-native'
import { Feather } from '@expo/vector-icons';
import { Modal } from 'react-native';
import { Button } from 'react-native-elements';
import Swiper from 'react-native-swiper';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';

import { COLORS, SIZES, FONT } from '../constants';

const { width, height } = Dimensions.get('window');
const cardWidth = width;
const cardHeight = height - 170;

const ViewProfile = ({ navigation }) => {
    const auth = getAuth();
    const [currentUserData, setCurrentUserData] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

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
    let allImages = [];
    if (currentUserData) {
        allImages = currentUserData.imageURLs;
    }
    
    return (
        <SafeAreaView style={styles.container}>
            {currentUserData && (
                <View style={styles.cardContainer}>
                    <Swiper
                        style={[styles.swiper]}
                        index={0}
                        loop={false}
                    >
                        {allImages.map((imageUrl, imageIndex) => (
                            <View key={imageIndex} style={{ flex: 1 }}>
                                <ImageZoom
                                    source={{ uri: imageUrl }}
                                    onLoad={() => console.log('Image loaded')}
                                    onError={(error) => console.log('Error loading image: ', error)}
                                    style={styles.image}
                                />
                            </View>
                        ))}
                    </Swiper>
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
            <TouchableOpacity onPress={() => {
                setModalVisible(true);
            }}>
                <Feather name="chevron-up" size={30} color="white" style={styles.arrowIcon} />
            </TouchableOpacity>
            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {currentUserData && (
                            <>
                                <Text style={styles.modalinfo}>{currentUserData.firstName + ' ' + currentUserData.lastName || 'No name'}</Text>
                                <Text style={styles.modalinfo}>{`${currentUserData.gender || 'No gender'}, Age: ${currentUserData.age || 'No age'}`}</Text>
                                <Text style={styles.modalinfo}>Number of retakes: {currentUserData.retakes || 'No retakes'} </Text>
                                <Text style={styles.modalinfo}>Bio: {currentUserData.bio || 'No bio'} </Text>
                                <Text style={styles.modalinfo}>Location: {currentUserData.location || 'No location'}</Text>
                                <Text style={styles.modalinfo}>Ethnicity: {currentUserData.ethnicity || 'No specified ethnicity'}</Text>
                                <Text style={styles.modalinfo}>Religion: {currentUserData.religion || 'No specified religion'}</Text>
                                <Text style={styles.modalinfo}>
                                    Distance: This will display the estimated distance you are from the other party in km
                                </Text>
                            </>
                        )}
                        <Button title="Close Modal" onPress={() => {
                            setModalVisible(false);
                        }} />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    likeButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'green',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        color: 'white',
    },

    swiperItem: {
        flex: 1,
    },
    cardContainer: {
        flex: 1,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: 'white', // Set the background color of the cards
        width: cardWidth,
        height: cardHeight,
    },
    image: {
        flex: 1,
        resizeMode: 'cover',
    },
    userInfoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },

    userName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userDetails: {
        color: 'white',
        fontSize: 16,
    },
    userAge: {
        color: 'white',
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
