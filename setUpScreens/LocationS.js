import React, { useState, useCallback } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, Alert, Dimensions, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import Spinner from 'react-native-loading-spinner-overlay';
import * as Location from 'expo-location';

import { COLORS, SIZES, FONT, icons } from '../constants';

export default function MyLocation({ navigation }) {

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Location
    async function getPlaceFromCoordinates(lat, lng) {
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=87fdfbc20b6c42219965405e23651000&pretty=1`);
        const data = await response.json();
        if (data.results.length > 0) {
            const components = data.results[0].components;
            const suburb = components.suburb || '';
            const country = components.country || '';
            return `${suburb}, ${country}`;
        } else {
            throw new Error('Failed to get place from coordinates');
        }
    }

    const [location, setLocation] = useState([])
    const [place, setPlace] = useState('');
    const [have, setHave] = useState('');
    const makeLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access location was denied');
            return;
        }
        try {
            setSubmitting(true);
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            setLocation(location);
            setHave(location);

            const place = await getPlaceFromCoordinates(location.coords.latitude, location.coords.longitude);
            setPlace(place); 

            const userId = auth.currentUser.uid;
            const userDocRef = doc(db, 'profiles', userId);

            updateDoc(userDocRef, {
                location: place,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        } catch (error) {
            console.error('Error getting location:', error);
        }
        setSubmitting(false);
    };

    // Update
    const [error, setError] = useState('');

    // Changes
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Styling
    const width = Dimensions.get('window').width;
    const height = Dimensions.get('window').height;

    // Firestore data
    const getFirestoreData = () => {
        const docRef = doc(db, 'profiles', userId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const holdData = docSnap.data();
                setPlace(holdData.location || '');
                setHave(holdData.location || '');
                setIsLoading(false);
            } else {
                console.log('No such document!');
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    };

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            getFirestoreData();
        }, [])
    );

    // Next
    const next = () => {
        if (have.length === 0) {
            Alert.alert(
                "Location Required",
                "Please set your location.",
                [{ text: "OK" }]
            );
            return;
        }
        navigation.dispatch(
            navigation.navigate("Height")
        );
    };

    // Handle hardware back button
    useFocusEffect(
        useCallback(() => {
            const backAction = () => {
                navigation.dispatch(
                    navigation.navigate('Photos')
                );
                return true;
            };
            const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
            return () => backHandler.remove();
        }, [])
    );

    // Function

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity>
                        <Text style={styles.heading}>Your Rizzly matches will be based on your{"\n"}location</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.69} onPress={next}>
                        <View>
                            <Text style={styles.headingBold}>Next</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={{
                            borderWidth: 1,
                            borderRadius: 5,
                            borderColor: 'gray',
                            backgroundColor: 'gray',
                        }}
                        onPress={makeLocation}
                    >
                        <Text style={styles.textStyle5}>Set Location</Text>
                    </TouchableOpacity>
                    <Text style={styles.textStyle4}>{place}</Text>
                </View>

                <Spinner
                    visible={submitting}
                    animation='fade'
                    overlayColor="rgba(0, 0, 0, 0.25)"
                    color="white"
                    indicatorStyle={{

                    }}
                    textContent='Loading...'
                    textStyle={{
                        fontFamily: FONT.bold,
                        fontSize: SIZES.medium,
                        fontWeight: 'normal',
                        color: 'white',
                    }}
                />
                <Spinner
                    visible={isLoading}
                    animation='fade'
                    overlayColor="rgba(0, 0, 0, 0.25)"
                    color="white"
                    indicatorStyle={{

                    }}
                    textContent='Loading...'
                    textStyle={{
                        fontFamily: FONT.bold,
                        fontSize: SIZES.medium,
                        fontWeight: 'normal',
                        color: 'white',
                    }}
                />

            </ScrollView>
        </SafeAreaView>
    )

};

const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    item: {
        width: width / 2 - 50,
        aspectRatio: 3 / 4,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'gray'
    },
    textStyle: {
        fontFamily: FONT.medium,
        fontSize: SIZES.smallmedium,
        color: COLORS.white,
    },
    textStyle2: {
        fontFamily: FONT.medium,
        fontSize: SIZES.smallmedium,
        color: 'black',
    },
    textStyle3: {
        fontFamily: FONT.medium,
        fontSize: SIZES.large,
        color: 'black',
    },
    textStyle4: {
        fontFamily: FONT.medium,
        fontSize: SIZES.smallmedium,
        color: 'black',
        padding: 3
    },
    textStyle5: {
        fontFamily: FONT.medium,
        fontSize: SIZES.smallmedium,
        color: 'white',
        padding: 3
    },
    heading: {
        fontFamily: FONT.medium,
        fontSize: SIZES.small,
        color: 'gray'
    },
    headingBold: {
        fontFamily: FONT.bold,
        fontSize: SIZES.small,
        color: 'gray'
    },
    btnContainer: {
        width: 200,
        height: 60,
        backgroundColor: 'gray',
        borderRadius: SIZES.large / 1.25,
        borderWidth: 1.5,
        borderColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
    },
    dropdownTextStyle: {
        fontFamily: FONT.medium,
        fontSize: SIZES.smallmedium,
        color: 'black',
    },
    dropdownInputStyle: {
        width: width - 20,
        alignSelf: 'center',
        borderWidth: 1,
        borderRadius: 5,
    },
    responseTextStyle: {
        fontFamily: FONT.medium,
        fontSize: SIZES.mediumlarge,
        paddingHorizontal: 10
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    borderLine: {
        width: width - 10,
        alignSelf: 'center',
        borderBottomColor: "gray",
        borderBottomWidth: 1,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        paddingVertical: 45,
        paddingHorizontal: 25,
        width: '100%',
        marginVertical: 10,
    },
    shadowProp: {
        shadowColor: '#171717',
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
});
