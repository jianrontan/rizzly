import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, Alert, TextInput, Image, Keyboard, Button, Dimensions, BackHandler, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import Spinner from 'react-native-loading-spinner-overlay';

import { setHasUnsavedChangesExport, setSaveChanges } from '../redux/actions';
import { COLORS, SIZES, FONT, icons } from '../constants';

export default function Work({ navigation }) {

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Job title
    const [job, setJob] = useState('');
    const [startJob, setStartJob] = useState('');

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
                setJob(holdData.job || '');

                setStartJob(holdData.job || '');

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
        if (job == '') {
            setSubmitting(false);
            Alert.alert(
                "Invalid Job Title",
                `Please enter your job title.`,
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
                job: job
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
                job == startJob
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
    }, [job]);

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
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity>
                        <Text style={styles.heading}>You will be listed as unemployed if{"\n"}you leave this section empty</Text>
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
                            value={job}
                            onChangeText={setJob}
                            maxLength={100}
                            placeholder="Job Title"
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