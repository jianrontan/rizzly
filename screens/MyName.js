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

import { setHasUnsavedChangesExport, setSaveChanges } from '../redux/actions';
import { COLORS, SIZES, FONT, icons } from '../constants';

export default function MyName({ navigation }) {

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Name
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const [startFirstName, setStartFirstName] = useState('');
    const [startLastName, setStartLastName] = useState('');

    // Update
    const [error, setError] = useState('');

    // Changes
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Styling
    const width = Dimensions.get('window').width;

    // Redux
    const dispatch = useDispatch();
    const saveChangesVal = useSelector(state => state.editProfileReducer.saveChangesVal);

    // Firestore data
    const getFirestoreData = () => {
        const docRef = doc(db, 'profiles', userId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const holdData = docSnap.data();
                setFirstName(holdData.firstName || '');
                setLastName(holdData.lastName || '');

                setStartFirstName(holdData.firstName || '');
                setStartLastName(holdData.lastName || '');
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
            setHasUnsavedChanges(false);
            dispatch(setHasUnsavedChangesExport(false));
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
        if (!hasUnsavedChanges) {
            setSubmitting(false);
            return;
        }
        setSubmitting(true);
        const userDocRef = doc(db, 'profiles', userId);
        try {
            await updateDoc(userDocRef, {
                firstName: firstName,
                lastName: lastName,
            });
            setHasUnsavedChanges(false);
            dispatch(setHasUnsavedChangesExport(false));
            dispatch(setSaveChanges(false));
        } catch (e) {
            console.error("Error submitting: ", e);
            setHasUnsavedChanges(false);
            dispatch(setHasUnsavedChangesExport(false));
            dispatch(setSaveChanges(false));
            setError(e.message);
        }
        setSubmitting(false);
    };

    useEffect(() => {
        if (saveChangesVal) {
            handleSubmit();
            navigation.navigate('View')
        }
    }, [saveChangesVal]);

    // Track changes
    useEffect(() => {
        if (!isLoading) {
            if (
                firstName == startFirstName &&
                lastName == startLastName
            ) {
                setHasUnsavedChanges(false);
                dispatch(setHasUnsavedChangesExport(false));
                console.log("myname changed hasUnsavedChanges to false")
            } else {
                setHasUnsavedChanges(true);
                dispatch(setHasUnsavedChangesExport(true));
                console.log("myname changed hasUnsavedChanges to true")
            }
        }
    }, [firstName, lastName]);

    // Handle hardware back button
    useFocusEffect(
        useCallback(() => {
            const backAction = () => {
                if (hasUnsavedChanges) {
                    Alert.alert("Discard changes?", "You have unsaved changes. Are you sure you want to discard them?", [
                        { text: "Don't leave", style: 'cancel', onPress: () => { } },
                        {
                            text: 'Discard',
                            style: 'destructive',
                            onPress: () => {
                                dispatch(setHasUnsavedChangesExport(false));
                                navigation.dispatch(
                                    CommonActions.reset({
                                        index: 0,
                                        routes: [{ name: 'Edit Profile' }],
                                    })
                                );
                            },
                        },
                    ]);
                    return true;
                } else {
                    navigation.navigate('Edit Profile');
                    return true;
                }
            };

            const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

            return () => backHandler.remove();
        }, [hasUnsavedChanges])
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#6e4639' }}>
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity activeOpacity={0.69} onPress={handleSubmit} style={styles.goldButton}>
                        <Text style={styles.whiteText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>


                <View style={{ paddingVertical: 20 }}>
                    <View style={styles.dropdownInputStyle}>
                        <TextInput
                            autoFocus={false}
                            value={firstName}
                            onChangeText={setFirstName}
                            maxLength={100}
                            placeholder="First Name"
                            selectionColor={'white'}
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
                            selectionColor={'white'}
                            style={styles.responseTextStyle}
                        />
                    </View>
                </View>

                <View>
                    <Text style={styles.heading}>Your first name will only be shared {"\n"}with matches</Text>
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
    heading: {
        fontFamily: FONT.medium,
        fontSize: SIZES.medium,
        color: 'white',
        top: 50,
        left: 10,
    },
    goldButton: {
        backgroundColor: '#D3A042',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    whiteText: {
        color: 'white',
        fontWeight: 'bold',
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
        fontSize: SIZES.medium,
        color: 'white',
    },
    dropdownInputStyle: {
        width: width - 20,
        alignSelf: 'center',
        borderWidth: 2,
        borderRadius: 5,
        height: 60, // Adjust the height as needed
        color: 'white',
        borderColor: 'white'
    },
    responseTextStyle: {
        fontFamily: FONT.medium,
        fontSize: SIZES.large,
        paddingHorizontal: 10,
        color: 'white',
        paddingTop: 15,
        paddingLeft: 20 // Add padding to the left for centering
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        left: 250,
    },
    borderLine: {
        width: width - 10,
        alignSelf: 'center',
        borderBottomColor: "white",
        borderBottomWidth: 1,
    },
});