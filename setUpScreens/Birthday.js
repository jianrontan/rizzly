import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, Alert, TextInput, Image, Keyboard, Button, Dimensions, BackHandler, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { getDoc, updateDoc, doc, setDoc, addDoc, collection, onSnapshot, arrayUnion } from 'firebase/firestore';
import { db, storage } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { uploadBytesResumable, ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { parseISO, format } from 'date-fns';
import DraggableFlatList from 'react-native-draggable-flatlist';
import * as ImagePicker from 'expo-image-picker';
import Spinner from 'react-native-loading-spinner-overlay';
import DateTimePicker from '@react-native-community/datetimepicker';

import { COLORS, SIZES, FONT, icons } from '../constants';
import { setHasUnsavedChangesExport } from '../redux/actions';

export default function Birthday({ navigation }) {

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Age
    const [age, setAge] = useState(null);

    // Birthday
    const [date, setDate] = useState(new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()));
    const [birthday, setBirthday] = useState('');
    const [startBirthday, setStartBirthday] = useState('');
    const [dateText, setDateText] = useState('Pick Your Birthday');
    const [datePickerValue, setDatePickerValue] = useState(date);
    const [newDateSet, setNewDateSet] = useState(false);
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

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
                setBirthday(holdData.birthday || '');
                setStartBirthday(holdData.birthday || '');
                const timestamp = holdData.datePickerValue;
                if (timestamp) {
                    const dateObject = timestamp.toDate();
                    let textDate = `${dateObject.getDate()}-${dateObject.getMonth() + 1}-${dateObject.getFullYear()}`;
                    setDateText(textDate || 'Pick Your Birthday');
                    setDatePickerValue(dateObject);
                }
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
        if (birthday == '') {
            setSubmitting(false);
            Alert.alert(
                "Invalid",
                `Please enter your birthday`,
                [{ text: "OK" }]
            );
            return;
        }
        setSubmitting(true);
        const userDocRef = doc(db, 'profiles', userId);
        try {
            await updateDoc(userDocRef, {
                birthday: birthday,
                datePickerValue: datePickerValue,
                age: age,
            });
            setHasUnsavedChanges(false);
            dispatch(setHasUnsavedChangesExport(false));
        } catch (e) {
            console.error("Error submitting: ", e);
            setHasUnsavedChanges(false);
            dispatch(setHasUnsavedChangesExport(false));
            setError(e.message);
        }
        navigation.navigate("Gender")
        setSubmitting(false);
    };

    // Track changes
    useEffect(() => {
        if (!isLoading) {
            if (
                birthday == startBirthday
            ) {
                setHasUnsavedChanges(false);
                dispatch(setHasUnsavedChangesExport(false));
                console.log("birthday changed hasUnsavedChanges to false")
            } else {
                setHasUnsavedChanges(true);
                dispatch(setHasUnsavedChangesExport(true));
                console.log("birthday changed hasUnsavedChanges to true")
            }
        }
    }, [birthday]);

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
                                    navigation.navigate('Name')
                                );
                            },
                        },
                    ]);
                    return true;
                } else {
                    navigation.dispatch(
                        navigation.navigate('Name')
                    );
                };
            };

            const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

            return () => backHandler.remove();
        }, [hasUnsavedChanges])
    );

    // Age
    const calculateAge = (birthday) => {
        const today = new Date();
        const [day, month, year] = birthday.split("/");
        const birthDate = new Date(year, month - 1, day);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    // Function
    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        let tempDate = new Date(currentDate); // 2006-01-20T16:00:00.000Z
        let fDate = `${tempDate.getDate()}/${tempDate.getMonth() + 1}/${tempDate.getFullYear()}`; // 20/1/2006
        let textDate = `${tempDate.getDate()}-${tempDate.getMonth() + 1}-${tempDate.getFullYear()}`; // 19-1-2006
        setShow(false);
        if (event.type === 'set') {
            setBirthday(fDate);
            setDatePickerValue(currentDate);
            setDateText(textDate);
            setNewDateSet(true);
        }
    };

    useEffect(() => {
        if (newDateSet) {
            setShow(false);
            const userAge = calculateAge(birthday);
            setAge(userAge)
            setNewDateSet(false);
        }
    }, [newDateSet, birthday]);

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity>
                        <Text style={styles.heading}>Only your age will be visible on{"\n"}your profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.69} onPress={handleSubmit}>
                        <View>
                            <Text style={styles.headingBold}>Save Changes</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{ alignSelf: 'center', padding: 10 }}>
                    <TouchableOpacity onPress={() => showMode('date')}>
                        <Text style={styles.textStyle3}>{dateText}</Text>
                    </TouchableOpacity>
                    {show && (
                        <DateTimePicker
                            id='datePicker'
                            value={datePickerValue}
                            mode={mode}
                            display='default'
                            onChange={onChangeDate}
                            maximumDate={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())}
                        />
                    )}
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