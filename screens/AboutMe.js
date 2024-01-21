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

import { setAboutMeChanges, setSaveChanges } from '../redux/actions';
import { COLORS, SIZES, FONT, icons } from '../constants';

export default function AboutMe({ navigation }) {

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Bio
    const [bio, setBio] = useState('');
    const [startBio, setStartBio] = useState('');

    // Prompts
    const [open1, setOpen1] = useState(false);
    const [question1, setQuestion1] = useState('');
    const [startQuestion1, setStartQuestion1] = useState('');
    const [prompts1, setPrompts1] = useState([
        { label: "You will always find me talking passionately about...", value: "You will always find me talking passionately about..." },
        { label: "One thing that might concern me is...", value: "One thing that might concern me is..." },
        { label: "In my leisure time, I enjoy...", value: "In my leisure time, I enjoy..." },
        { label: "A major positive aspect for me is...", value: "A major positive aspect for me is..." },
        { label: "I love it when someone lifts my spirits by...", value: "I love it when someone lifts my spirits by..." },
        { label: "My future goal is to become...", value: "My future goal is to become..." },
        { label: "A little secret I have is...", value: "A little secret I have is..." },
    ]);

    const [open2, setOpen2] = useState(false);
    const [question2, setQuestion2] = useState('');
    const [startQuestion2, setStartQuestion2] = useState('');
    const [prompts2, setPrompts2] = useState([
        { label: "A quality I highly value in others is...", value: "A quality I highly value in others is..." },
        { label: "A warning sign for me in a person is...", value: "A warning sign for me in a person is..." },
        { label: "I have the most difficulty with people who...", value: "I have the most difficulty with people who..." },
        { label: "Something that turns me off completely is...", value: "Something that turns me off completely is..." },
        { label: "I appreciate it when someone...", value: "I appreciate it when someone..." },
        { label: "I'm searching for a partner who...", value: "I'm searching for a partner who..." },
        { label: "The key to winning my heart is...", value: "The key to winning my heart is..." },
    ]);

    const [open3, setOpen3] = useState(false);
    const [question3, setQuestion3] = useState('');
    const [startQuestion3, setStartQuestion3] = useState('');
    const [prompts3, setPrompts3] = useState([
        { label: "I feel regretful about...", value: "I feel regretful about..." },
        { label: "Two facts about me and one fabricated story are...", value: "Two facts about me and one fabricated story are..." },
        { label: "When it's raining, you'll find me enjoying...", value: "When it's raining, you'll find me enjoying..." },
        { label: "I had a close call when...", value: "I had a close call when..." },
        { label: "If faced with a grizzly bear, I'd...", value: "If faced with a grizzly bear, I'd..." },
        { label: "My favourite cuisine to indulge in is...", value: "My favourite cuisine to indulge in is..." },
        { label: "Something that amazes me is...", value: "Something that amazes me is..." },
        { label: "I'd be overjoyed if...", value: "I'd be overjoyed if..." },
    ]);

    // Answers
    const [answer1, setAnswer1] = useState('');
    const [answer2, setAnswer2] = useState('');
    const [answer3, setAnswer3] = useState('');
    const [startAnswer1, setStartAnswer1] = useState('');
    const [startAnswer2, setStartAnswer2] = useState('');
    const [startAnswer3, setStartAnswer3] = useState('');

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
                setBio(holdData.bio || '');
                setQuestion1(holdData.question1 || '');
                setQuestion2(holdData.question2 || '');
                setQuestion3(holdData.question3 || '');
                setAnswer1(holdData.answer1 || '');
                setAnswer2(holdData.answer2 || '');
                setAnswer3(holdData.answer3 || '');

                setStartBio(holdData.bio || '');
                setStartQuestion1(holdData.question1 || '');
                setStartQuestion2(holdData.question2 || '');
                setStartQuestion3(holdData.question3 || '');
                setStartAnswer1(holdData.answer1 || '');
                setStartAnswer2(holdData.answer2 || '');
                setStartAnswer3(holdData.answer3 || '');
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
                bio: bio,
                question1: question1,
                question2: question2,
                question3: question3,
                answer1: answer1,
                answer2: answer2,
                answer3: answer3,
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
                bio == startBio &&
                question1 == startQuestion1 &&
                question2 == startQuestion2 &&
                question3 == startQuestion3 &&
                answer1 == startAnswer1 &&
                answer2 == startAnswer2 &&
                answer3 == startAnswer3
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
    }, [bio, question1, question2, question3, answer1, answer2, answer3]);

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
                        <Text style={styles.heading}>Pick prompts and write your answer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.69} onPress={handleSubmit}>
                        <View>
                            <Text style={styles.headingBold}>Save Changes</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{ paddingTop: 10, paddingBottom: 25 }}>
                    <Text style={{ paddingHorizontal: 15, paddingBottom: 10, fontFamily: FONT.medium }}>Bio:</Text>
                    <View style={styles.dropdownInputStyle}>
                        <TextInput
                            autoFocus={false}
                            value={bio}
                            onChangeText={setBio}
                            maxLength={100}
                            multiline={true}
                            placeholder="Introduce yourself..."
                            selectionColor={'black'}
                            style={styles.responseTextStyle}
                        />
                    </View>
                </View>

                <View style={styles.borderLine}></View>
                <View style={{ padding: 10 }}></View>

                <Text style={{ paddingHorizontal: 15, paddingBottom: 10, fontFamily: FONT.medium }}>Prompts:</Text>
                <DropDownPicker
                    open={open1}
                    value={question1}
                    items={prompts1}
                    setOpen={setOpen1}
                    setValue={setQuestion1}
                    setItems={setPrompts1}
                    onOpen={onOpen1}
                    placeholder='Something about you...'
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

                <View style={{ paddingTop: 10, paddingBottom: 25 }}>
                    <View style={styles.dropdownInputStyle}>
                        <TextInput
                            autoFocus={false}
                            value={answer1}
                            onChangeText={setAnswer1}
                            maxLength={100}
                            multiline={true}
                            placeholder="Write your response..."
                            selectionColor={'black'}
                            style={styles.responseTextStyle}
                        />
                    </View>
                </View>

                <DropDownPicker
                    open={open2}
                    value={question2}
                    items={prompts2}
                    setOpen={setOpen2}
                    setValue={setQuestion2}
                    setItems={setPrompts2}
                    onOpen={onOpen2}
                    placeholder='Something about other people...'
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

                <View style={{ paddingTop: 10, paddingBottom: 25 }}>
                    <View style={styles.dropdownInputStyle}>
                        <TextInput
                            autoFocus={false}
                            value={answer2}
                            onChangeText={setAnswer2}
                            maxLength={100}
                            multiline={true}
                            placeholder="Write your response..."
                            selectionColor={'black'}
                            style={styles.responseTextStyle}
                        />
                    </View>
                </View>

                <DropDownPicker
                    open={open3}
                    value={question3}
                    items={prompts3}
                    setOpen={setOpen3}
                    setValue={setQuestion3}
                    setItems={setPrompts3}
                    onOpen={onOpen3}
                    placeholder='Something more...'
                    textStyle={styles.dropdownTextStyle}
                    containerStyle={{
                        width: width - 20,
                        alignSelf: 'center'
                    }}
                    dropDownContainerStyle={{
                        backgroundColor: '#ededed',
                    }}
                    dropDownDirection='TOP'
                    listMode='SCROLLVIEW'
                    zIndex={1000}
                    zIndexInverse={3000}
                />

                <View style={{ paddingTop: 10, paddingBottom: 50 }}>
                    <View style={styles.dropdownInputStyle}>
                        <TextInput
                            autoFocus={false}
                            value={answer3}
                            onChangeText={setAnswer3}
                            maxLength={100}
                            multiline={true}
                            placeholder="Write your response..."
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
