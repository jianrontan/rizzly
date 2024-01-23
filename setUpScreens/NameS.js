import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, Alert, TextInput, Image, Keyboard, Button, Dimensions, BackHandler, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { getDoc, updateDoc, doc, setDoc, addDoc, collection, onSnapshot, arrayUnion } from 'firebase/firestore';
import { db, storage } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { uploadBytesResumable, ref, getDownloadURL, deleteObject } from 'firebase/storage';
import DraggableFlatList from 'react-native-draggable-flatlist';
import * as ImagePicker from 'expo-image-picker';
import Spinner from 'react-native-loading-spinner-overlay';
import DropDownPicker from 'react-native-dropdown-picker';

import { COLORS, SIZES, FONT, icons } from '../constants';

export default function Name({ navigation }) {

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Name
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

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
                setFirstName(holdData.firstName || '');
                setLastName(holdData.lastName || '');
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
        if (firstName == '') {
            setSubmitting(false);
            Alert.alert(
                "Invalid Name",
                `Please enter your name`,
                [{ text: "OK" }]
            );
            return;
        }
        setSubmitting(true);
        const userDocRef = doc(db, 'profiles', userId);
        try {
            await setDoc(userDocRef, {
                firstName: firstName,
                lastName: lastName,
            }, { merge: true });
        } catch (e) {
            console.error("Error submitting: ", e);
            setError(e.message);
        }
        navigation.navigate("Birthday")
        setSubmitting(false);
    };

    // Handle hardware back button
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                return true;
            };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [])
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity>
                        <Text style={styles.heading}>Your last name will only be shared {"\n"}with matches</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.69} onPress={handleSubmit}>
                        <View>
                            <Text style={styles.headingBold}>Save Changes</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{ paddingVertical: 10 }}>
                    <View style={styles.dropdownInputStyle}>
                        <TextInput
                            autoFocus={false}
                            value={firstName}
                            onChangeText={setFirstName}
                            maxLength={100}
                            placeholder="First Name"
                            selectionColor={'black'}
                            style={styles.responseTextStyle}
                        />
                    </View>
                </View>

                <View style={{ paddingVertical: 10 }}>
                    <View style={styles.dropdownInputStyle}>
                        <TextInput
                            autoFocus={false}
                            value={lastName}
                            onChangeText={setLastName}
                            maxLength={100}
                            placeholder="Last Name"
                            selectionColor={'black'}
                            style={styles.responseTextStyle}
                        />
                    </View>
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
                    textContent='Saving...'
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
        padding: 10,
    },
    borderLine: {
        width: width - 10,
        alignSelf: 'center',
        borderBottomColor: "gray",
        borderBottomWidth: 1,
    },
});