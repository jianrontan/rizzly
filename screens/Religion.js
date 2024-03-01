import React, { useState, useCallback } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db} from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import Spinner from 'react-native-loading-spinner-overlay';
import CheckBox from 'react-native-check-box';

import { COLORS, SIZES, FONT } from '../constants';

export default function Religion({ navigation }) {

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Religions
    const [religion, setReligion] = useState('Prefer not to say');
    const religions = [
        'Agnostic',
        'Atheist',
        'Buddhist',
        'Catholic',
        'Christian',
        'Hindu',
        'Jewish',
        'Muslim',
        'Taoist',
        'Sikh',
        'Zoroastrian',
        'Other',
        'Prefer not to say',
    ];

    // Update
    const [error, setError] = useState('');

    // Changes
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Styling
    const width = Dimensions.get('window').width;

    // Firestore data
    const getFirestoreData = () => {
        const docRef = doc(db, 'profiles', userId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const holdData = docSnap.data();

                setReligion(holdData.religion || 'Prefer not to say');

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

    // Submitting
    const handleSubmit = async (newReligion) => {
        setSubmitting(true);
        const userDocRef = doc(db, 'profiles', userId);
        try {
            await updateDoc(userDocRef, {
                religion: newReligion,
            });
        } catch (e) {
            console.error("Error submitting: ", e);
            setError(e.message);
        }
        setSubmitting(false);
    };

    const handleSelectReligion = (newReligion) => {
        setReligion(newReligion);
        handleSubmit(newReligion);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView showsVerticalScrollIndicator={false} overScrollMode='never'>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity>
                        <Text style={styles.heading}>Pick 'Prefer not to say' to hide your religion</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.rowTop}></View>

                {!isLoading &&
                    (religions.map((item) => (
                        <TouchableOpacity
                            style={styles.row}
                            key={item}
                            onPress={() => {
                                handleSelectReligion(item);
                            }}
                        >
                            <Text style={styles.textStyle2}>{item}</Text>
                            <CheckBox
                                isChecked={religion === item}
                                onClick={() => {
                                    handleSelectReligion(item);
                                }}
                            />
                        </TouchableOpacity>
                    )))
                }

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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: 'grey',
        padding: 10,
    },
    rowTop: {
        borderBottomWidth: 1,
        borderColor: 'grey',
    },
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
    textStyle: {
        fontFamily: FONT.medium,
        fontSize: SIZES.smallmedium,
        color: COLORS.white,
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
        paddingTop: 10,
        paddingHorizontal: 10,
        paddingBottom: 9
    },
    borderLine: {
        width: width - 10,
        alignSelf: 'center',
        borderBottomColor: "gray",
        borderBottomWidth: 1,
    },
});
