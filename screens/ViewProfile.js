import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, StyleSheet, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useFocusEffect } from '@react-navigation/native';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { Dimensions } from 'react-native'
import { Feather } from '@expo/vector-icons';
import { Modal } from 'react-native';
import { Button } from 'react-native-elements';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';

import { COLORS, SIZES, FONT } from '../constants';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const cardWidth = width;

const ViewProfile = ({ navigation }) => {
    const auth = getAuth();
    const [currentUserData, setCurrentUserData] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isMetric, setIsMetric] = useState(false);

    // Dimensions
    const tabNavigatorHeight = 50;
    const headerHeight = useHeaderHeight();
    const statusBarHeight = StatusBar.currentHeight;
    const availableSpace = height - tabNavigatorHeight - headerHeight + statusBarHeight;

    useFocusEffect(
        React.useCallback(() => {
            const fetchUnits = async () => {
                try {
                    const unitsDocRef = doc(db, 'units', auth.currentUser.uid);
                    const unitsDocSnapshot = await getDoc(unitsDocRef);

                    if (unitsDocSnapshot.exists()) {
                        const unitsData = unitsDocSnapshot.data();
                        setIsMetric(unitsData.isMetric);
                        console.log('Successfully retrieved units:', unitsData);
                    } else {
                        // If no units document exists for the current user, use default values
                        setIsMetric(false);
                    }
                } catch (error) {
                    console.error('Error fetching units:', error);
                }
            };

            fetchUnits();

            return () => {
            };
        }, [])
    );

    const convertHeight = (cm) => {
        const inches = cm / 2.54;
        const feet = Math.floor(inches / 12);
        const remainingInches = Math.round(inches % 12);
        return `${feet}' ${remainingInches}"`;
    };

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
            fetchCurrentUser();
        }, [])
    );
    let allImages = [];
    if (currentUserData) {
        allImages = currentUserData.selfieURLs ? [currentUserData.selfieURLs, ...currentUserData.imageURLs] : currentUserData.imageURLs;
    }

    return (
        <SafeAreaView style={styles.container}>
            {currentUserData && (
                <View style={[styles.cardContainer, { height: availableSpace }]}>
                    <SwiperFlatList
                        style={{ height: availableSpace, width: cardWidth }}
                        index={0}
                        paginationStyleItem={{
                            width: 5,
                            height: 5,
                            bottom: availableSpace - (cardWidth * 4 / 3)
                        }}
                        showPagination
                    >
                        {allImages.map((imageUrl, index) => (
                            <View key={index} style={{ height: availableSpace, width: cardWidth }}>
                                <ImageZoom
                                    source={{ uri: imageUrl }}
                                    onLoad={() => console.log('Image loaded')}
                                    onError={(error) => console.log('Error loading image: ', error)}
                                    style={[styles.image, { bottom: (availableSpace - (cardWidth * 4 / 3)) / 2 }]}
                                />
                            </View>
                        ))}
                    </SwiperFlatList>
                    <View style={[styles.userInfoContainer, { height: (availableSpace - (cardWidth * 4 / 3)) }]}>
                        <Text style={styles.userName}>{currentUserData.firstName + ' ' + currentUserData.lastName || 'No name'}</Text>
                        <Text style={styles.userDetails}>{`${currentUserData.gender || 'No gender'}, Age: ${currentUserData.age || 'No age'}, Height: ${isMetric ? convertHeight(currentUserData.cmHeight) + ' ft' : currentUserData.cmHeight + ' cm'}`}</Text>
                        <Text style={styles.userDetails}>Location: {currentUserData.location || 'No Location'} </Text>
                    </View>
                </View>
            )}
            <TouchableOpacity
                onPress={() => {
                    setModalVisible(true);
                }}
                style={styles.arrowIcon}
            >
                <Feather name="chevron-up" size={30} color="black" />
            </TouchableOpacity>
            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <View style={[styles.modalContainer, { height: availableSpace }]}>
                    <View style={[styles.modalContent, { height: availableSpace }]}>
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
        </SafeAreaView >
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
    swiper: {
        flex: 1,
    },
    cardContainer: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor: 'white',
        width: cardWidth,
    },
    image: {
        flex: 1,
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    userInfoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 10,
    },
    userName: {
        color: 'black',
        fontSize: 18,
        fontFamily: FONT.bold
    },
    userDetails: {
        color: 'black',
        fontSize: 16,
        fontFamily: FONT.medium
    },
    userAge: {
        color: 'white',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: cardWidth,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
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
