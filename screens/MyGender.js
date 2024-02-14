import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, Alert, TextInput, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import DropDownPicker from 'react-native-dropdown-picker';
import { COLORS, SIZES, FONT } from '../constants';

export default function MyGender({ navigation }) {

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Gender
    const [open, setOpen] = useState(false);
    const [gender, setGender] = useState('');
    const [genders, setGenders] = useState([
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Non-binary", value: "Non-binary" },
    ]);

    // Update
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Firestore data
    const getFirestoreData = () => {
        const docRef = doc(db, 'profiles', userId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const holdData = docSnap.data();
                setGender(holdData.gender || '');
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
    const handleSubmit = async () => {
        if (gender == '') {
            setSubmitting(false);
            Alert.alert(
                "Invalid",
                `Please enter your gender`,
                [{ text: "OK" }]
            );
            return;
        }
        setSubmitting(true);
        const userDocRef = doc(db, 'profiles', userId);
        try {
            await updateDoc(userDocRef, {
                gender: gender,
            });
        } catch (e) {
            console.error("Error submitting: ", e);
        }
        setSubmitting(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity>
                        <Text style={styles.heading}>Your Rizzly matches will be based on your gender</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Gender:</Text>
                <DropDownPicker
                    open={open}
                    value={gender}
                    items={genders}
                    setOpen={setOpen}
                    setValue={setGender}
                    setItems={setGenders}
                    onChangeValue={handleSubmit}
                    placeholder='Select your gender'
                    textStyle={styles.dropdownTextStyle}
                    containerStyle={styles.dropdownContainerStyle}
                    dropDownContainerStyle={styles.dropDownContainerStyle}
                    listMode='SCROLLVIEW'
                />

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
        color: 'black',
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
