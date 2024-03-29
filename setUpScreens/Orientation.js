import React, { useState, useCallback } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import Spinner from 'react-native-loading-spinner-overlay';

import OptionButton from '../components/touchableHighlight/touchableHightlight';
import { COLORS, SIZES, FONT, icons } from '../constants';

export default function Orientation({ navigation }) {

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Orientation
    const [orientation, setOrientation] = useState(null);
    const [orientationError, setOrientationError] = useState('');
    const defaultOrientation = { male: false, female: false, nonBinary: false };
    const actualOrientation = orientation || defaultOrientation;

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
                setOrientation(holdData.orientation);
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
        if (orientation == null || orientationError !== '') {
            Alert.alert(
                "Invalid Selection",
                `Please select at least one gender`,
                [{ text: "OK" }]
            );
            return;
        }
        navigation.dispatch(
            navigation.navigate("Photos")
        );
    };

    console.log(orientation);

    // Function
    const handleOrientation = (id, isSelected) => {
        setOrientation(prevState => {
            const newOrientation = { ...prevState, [id]: isSelected };
            if (Object.values(newOrientation).every(option => !option)) {
                setOrientationError('Please select at least one orientation.');
            } else {
                setOrientationError('');
            }
            const docRef = doc(db, 'profiles', userId);
            updateDoc(docRef, {
                orientation: newOrientation
            }).then(() => {
                console.log("Orientation successfully updated!");
            }).catch((error) => {
                console.error("Error updating Orientation: ", error);
            });
            return newOrientation;
        });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity>
                        <Text style={styles.heading}>Your Rizzly matches will be based on your{"\n"}preferred genders</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.69} onPress={next}>
                        <View>
                            <Text style={styles.headingBold}>Next</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{ flex: 1, padding: SIZES.medium, alignSelf: 'center' }}>
                    {/* Orientation */}
                    <View>
                        <>
                            <OptionButton id="male" text="Male" onPress={handleOrientation} selected={actualOrientation.male} />
                            <OptionButton id="female" text="Female" onPress={handleOrientation} selected={actualOrientation.female} />
                            <OptionButton id="nonBinary" text="Non-Binary" onPress={handleOrientation} selected={actualOrientation.nonBinary} />
                        </>
                    </View>
                </View>
                <View style={{ flex: 1, alignSelf: 'center' }}>
                    {!!orientationError && <Text style={{ color: '#cf0202', fontFamily: FONT.regular }}>{orientationError}</Text>}
                </View>

                <Spinner
                    visible={submitting}
                    animation='fade'
                    overlayColor="rgba(0, 0, 0, 0.25)"
                    color="white"
                    indicatorStyle={{

                    }}
                    textContent='Saving...'
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
});