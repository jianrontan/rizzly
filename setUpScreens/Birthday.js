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

export default function Birthday({ navigation }) {

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Age
    const [age, setAge] = useState(null);

    // Birthday
    const [date, setDate] = useState(new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()));
    const [birthday, setBirthday] = useState('');
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

    // Styling
    const width = Dimensions.get('window').width;

    // Firestore data
    const getFirestoreData = () => {
        const docRef = doc(db, 'profiles', userId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const holdData = docSnap.data();
                setBirthday(holdData.birthday || '');
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
        }, [])
    );

    // Submitting
    const handleSubmit = async () => {
        setSubmitting(true);
        const userDocRef = doc(db, 'profiles', userId);
        try {
            await updateDoc(userDocRef, {
                birthday: birthday,
                datePickerValue: datePickerValue,
                age: age,
            });
        } catch (e) {
            console.error("Error submitting: ", e);
            setError(e.message);
        }
        setSubmitting(false);
    };

    // Next
    const next = () => {
        if (birthday == '') {
            Alert.alert(
                "Birthday Required",
                "Please enter your birthday",
                [{ text: "OK" }]
            );
            return;
        }
        Alert.alert(
            "Confirmation",
            `Your age is ${age}. Are you sure you want to proceed?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: async () => {
                        await handleSubmit();
                        navigation.dispatch(
                            navigation.navigate("Gender")
                        );
                    }
                }
            ]
        );
    };

    // Function
    const calculateAge = (birthday) => {
        const today = new Date();
        const [day, month, year] = birthday.split("/");
        const birthDate = new Date(year, month - 1, day); // months are 0-based in JavaScript
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        let tempDate = new Date(currentDate);
        let fDate = `${tempDate.getDate()}/${tempDate.getMonth() + 1}/${tempDate.getFullYear()}`;
        let textDate = `${tempDate.getDate()}-${tempDate.getMonth() + 1}-${tempDate.getFullYear()}`;
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
                    <TouchableOpacity activeOpacity={0.69} onPress={next}>
                        <View>
                            <Text style={styles.headingBold}>Next</Text>
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
