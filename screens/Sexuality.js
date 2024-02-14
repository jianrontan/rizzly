import React, { useState, useCallback } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import Spinner from 'react-native-loading-spinner-overlay';
import OptionButton from '../components/touchableHighlight/touchableHightlight';
import { COLORS, SIZES, FONT } from '../constants';

export default function MySexuality({ navigation }) {

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Orientation
    const [orientation, setOrientation] = useState(null);
    const [orientationError, setOrientationError] = useState('');
    const defaultOrientation = { male: false, female: false, nonBinary: false };
    const actualOrientation = orientation || defaultOrientation;

    // Changes
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity>
                        <Text style={styles.heading}>Your Rizzly matches will be based on your sexuality</Text>
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
                    visible={submitting || isLoading}
                    animation='fade'
                    overlayColor="rgba(0, 0, 0, 0.25)"
                    color="white"
                    textContent='Saving...'
                    textStyle={styles.spinnerTextStyle}
                />
            </ScrollView>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#6e4639',
    },
    scrollView: {
        flexGrow: 1,
        paddingBottom: 500,
    },
    buttonsContainer: {
        padding: 10,
    },
    heading: {
        fontFamily: FONT.medium,
        fontSize: SIZES.small,
        color: 'white',
    },
    label: {
        paddingHorizontal: 15,
        paddingBottom: 10,
        fontFamily: FONT.medium,
        fontSize: SIZES.smallmedium,
        color: 'white',
    },
    dropdownTextStyle: {
        fontFamily: FONT.medium,
        fontSize: SIZES.smallmedium,
        color: 'white',
    },
    dropdownContainerStyle: {
        width: Dimensions.get('window').width - 20,
        alignSelf: 'center',
    },
    dropDownContainerStyle: {
        backgroundColor: '#ededed',
    },
    spinnerTextStyle: {
        fontFamily: FONT.bold,
        fontSize: SIZES.medium,
        fontWeight: 'normal',
        color: 'white',
    },
});
