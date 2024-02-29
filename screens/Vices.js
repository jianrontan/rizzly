import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, Alert, Dimensions, BackHandler } from 'react-native';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import Spinner from 'react-native-loading-spinner-overlay';
import DropDownPicker from 'react-native-dropdown-picker';

import { setAboutMeChanges, setSaveChanges } from '../redux/actions';
import { COLORS, SIZES, FONT, icons } from '../constants';

export default function Vices({ navigation }) {

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Choices
    const [open1, setOpen1] = useState(false);
    const [question1, setQuestion1] = useState('');
    const [startQuestion1, setStartQuestion1] = useState('');
    const [prompts1, setPrompts1] = useState([
        { label: "Never", value: "Never" },
        { label: "Rarely", value: "Rarely" },
        { label: "Sometimes", value: "Sometimes" },
        { label: "Often", value: "Often" },
    ]);

    const [open2, setOpen2] = useState(false);
    const [question2, setQuestion2] = useState('');
    const [startQuestion2, setStartQuestion2] = useState('');
    const [prompts2, setPrompts2] = useState([
        { label: "Never", value: "Never" },
        { label: "Rarely", value: "Rarely" },
        { label: "Sometimes", value: "Sometimes" },
        { label: "Often", value: "Often" },
    ]);

    const [open3, setOpen3] = useState(false);
    const [question3, setQuestion3] = useState('');
    const [startQuestion3, setStartQuestion3] = useState('');
    const [prompts3, setPrompts3] = useState([
        { label: "Casually only", value: "Casually only" },
        { label: "Partners only", value: "Partners only" },
        { label: "Partners and casually", value: "Partners and casually" },
        { label: "After marriage", value: "After marriage" },
    ]);

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
                setQuestion1(holdData.alcohol || '');
                setQuestion2(holdData.smoking || '');
                setQuestion3(holdData.sex || '');

                setStartQuestion1(holdData.alcohol || '');
                setStartQuestion2(holdData.smoking || '');
                setStartQuestion3(holdData.sex || '');
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
            dispatch(setAboutMeChanges(false));
        }, [])
    );

    // Prompts
    const onOpen1 = useCallback(() => {
        setOpen2(false);
        setOpen3(false);
    }, []);

    const onOpen2 = useCallback(() => {
        setOpen1(false);
        setOpen3(false);
    }, []);

    const onOpen3 = useCallback(() => {
        setOpen1(false);
        setOpen2(false);
    }, []);

    // Submitting
    const handleSubmit = async () => {
        if (!hasUnsavedChanges) {
            setSubmitting(false);
            return;
        }
        setSubmitting(true);
        const userDocRef = doc(db, 'profiles', userId);
        try {
            await updateDoc(userDocRef, {
                alcohol: question1,
                smoking: question2,
                sex: question3,
            });
            setHasUnsavedChanges(false);
            dispatch(setAboutMeChanges(false));
            dispatch(setSaveChanges(false));
        } catch (e) {
            console.error("Error submitting: ", e);
            setHasUnsavedChanges(false);
            dispatch(setAboutMeChanges(false));
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
                question1 == startQuestion1 &&
                question2 == startQuestion2 &&
                question3 == startQuestion3
            ) {
                setHasUnsavedChanges(false);
                dispatch(setAboutMeChanges(false));
                console.log("aboutme changed hasUnsavedChanges to false")
            } else {
                setHasUnsavedChanges(true);
                dispatch(setAboutMeChanges(true));
                console.log("aboutme changed hasUnsavedChanges to true")
            }
        }
    }, [question1, question2, question3]);

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
                                dispatch(setAboutMeChanges(false));
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
                        <Text style={styles.heading}>Select your answer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.69} onPress={handleSubmit}>
                        <View>
                            <Text style={styles.headingBold}>Save Changes</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={{ paddingHorizontal: 15, paddingBottom: 10, paddingTop: 15, fontFamily: FONT.medium }}>Alcohol:</Text>
                <DropDownPicker
                    open={open1}
                    value={question1}
                    items={prompts1}
                    setOpen={setOpen1}
                    setValue={setQuestion1}
                    setItems={setPrompts1}
                    onOpen={onOpen1}
                    placeholder='Select your answer'
                    textStyle={styles.dropdownTextStyle}
                    containerStyle={{
                        width: width - 20,
                        alignSelf: 'center',
                    }}
                    dropDownContainerStyle={{
                        backgroundColor: '#ededed'
                    }}
                    listMode='SCROLLVIEW'
                    zIndex={3000}
                    zIndexInverse={1000}
                />

                <Text style={{ paddingHorizontal: 15, paddingBottom: 10, paddingTop: 15, fontFamily: FONT.medium }}>Smoking:</Text>
                <DropDownPicker
                    open={open2}
                    value={question2}
                    items={prompts2}
                    setOpen={setOpen2}
                    setValue={setQuestion2}
                    setItems={setPrompts2}
                    onOpen={onOpen2}
                    placeholder='Select your answer'
                    textStyle={styles.dropdownTextStyle}
                    containerStyle={{
                        width: width - 20,
                        alignSelf: 'center'
                    }}
                    dropDownContainerStyle={{
                        backgroundColor: '#ededed'
                    }}
                    listMode='SCROLLVIEW'
                    zIndex={2000}
                    zIndexInverse={2000}
                />

                <Text style={{ paddingHorizontal: 15, paddingBottom: 10, paddingTop: 15, fontFamily: FONT.medium }}>Sex:</Text>
                <DropDownPicker
                    open={open3}
                    value={question3}
                    items={prompts3}
                    setOpen={setOpen3}
                    setValue={setQuestion3}
                    setItems={setPrompts3}
                    onOpen={onOpen3}
                    placeholder='Select your answer'
                    textStyle={styles.dropdownTextStyle}
                    containerStyle={{
                        width: width - 20,
                        alignSelf: 'center',
                    }}
                    dropDownContainerStyle={{
                        backgroundColor: '#ededed',
                    }}
                    listMode='SCROLLVIEW'
                    zIndex={1000}
                    zIndexInverse={3000}
                />

                <View style={{ paddingBottom: 200 }}></View>

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