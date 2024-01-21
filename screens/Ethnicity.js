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
import CheckBox from 'react-native-check-box';

import { setHasUnsavedChangesExport, setSaveChanges } from '../redux/actions';
import { COLORS, SIZES, FONT } from '../constants';

const EthnicityCheckbox = React.memo(({ item, onToggle, isChecked }) => (
    <CheckBox
        isChecked={isChecked}
        onClick={() => onToggle(item)}
    />
));

export default function Ethnicity({ navigation }) {

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Ethnicities
    const [ethnicity, setEthnicity] = useState([]);
    const [startEthnicity, setStartEthnicity] = useState([]);
    const [checkedState, setCheckedState] = useState({});
    const ethnicities = [
        'African',
        'Arab',
        'Ashkenazi Jewish',
        'East Asian (Chinese, Japanese, Korean)',
        'South Asian (Indian, Pakistani, Bangladeshi)',
        'Southeast Asian (Filipino, Vietnamese, Thai)',
        'European (British, German, French, Italian, Spanish)',
        'Latino/Hispanic',
        'Middle Eastern (Iranian, Turkish, Kurdish)',
        'Native American',
        'Pacific Islander (Polynesian, Micronesian, Melanesian)',
        'Russian',
        'Slavic (Ukrainian, Polish, Czech)',
        'Sub-Saharan African (Yoruba, Igbo, Zulu)',
        'Scandinavian (Swedish, Norwegian, Danish)',
        'South American (Peruvian, Argentinean, Colombian)',
        'Balkan (Serbian, Croatian, Bulgarian)',
        'Jewish',
        'Mestizo (Mexican, Central American)',
        'Other',
        'Prefer not to say'
    ];

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
                setEthnicity(holdData.ethnicity || []);

                setStartEthnicity(holdData.ethnicity || []);

                const initialCheckedState = {};
                ethnicities.forEach((ethnicity) => {
                    initialCheckedState[ethnicity] = holdData.ethnicity.includes(ethnicity);
                });
                setCheckedState(initialCheckedState);

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
        if (!hasUnsavedChanges) {
            setSubmitting(false);
            return;
        }
        setSubmitting(true);
        const userDocRef = doc(db, 'profiles', userId);
        try {
            await updateDoc(userDocRef, {
                ethnicity: ethnicity,
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
    const arraysAreEqual = (arr1, arr2) => {
        if (arr1.length !== arr2.length) return false;
        const sortedArr1 = [...arr1].sort();
        const sortedArr2 = [...arr2].sort();
        return sortedArr1.every((value, index) => value === sortedArr2[index]);
    };

    useEffect(() => {
        if (!isLoading) {
            if (arraysAreEqual(ethnicity, startEthnicity)) {
                setHasUnsavedChanges(false);
                dispatch(setHasUnsavedChangesExport(false));
                console.log("myname changed hasUnsavedChanges to false")
            } else {
                setHasUnsavedChanges(true);
                dispatch(setHasUnsavedChangesExport(true));
                console.log("myname changed hasUnsavedChanges to true")
            }
        }
    }, [ethnicity]);

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

    // Function
    const handleSelectEthnicity = useCallback((selectedEthnicity) => {
        setCheckedState((prevState) => {
            // If "Prefer not to say" is currently selected and the user selects something else,
            // clear "Prefer not to say" and add the new selection
            if (prevState['Prefer not to say'] && selectedEthnicity !== 'Prefer not to say') {
                const newState = { ...prevState, 'Prefer not to say': false };
                return { ...newState, [selectedEthnicity]: true };
            }
            // If the user selects "Prefer not to say", clear all other selections
            if (selectedEthnicity === 'Prefer not to say') {
                const clearedState = Object.keys(prevState).reduce((state, key) => {
                    return { ...state, [key]: false };
                }, {});
                return { ...clearedState, 'Prefer not to say': true };
            }
            // For any other selection, toggle its current state
            return { ...prevState, [selectedEthnicity]: !prevState[selectedEthnicity] };
        });

        // Update the ethnicity array based on the new checked state
        setEthnicity((currentEthnicities) => {
            if (selectedEthnicity === 'Prefer not to say') {
                // If "Prefer not to say" is selected, return only that
                return ['Prefer not to say'];
            } else {
                // Toggle the selected ethnicity in the array
                if (currentEthnicities.includes(selectedEthnicity)) {
                    return currentEthnicities.filter(ethnicity => ethnicity !== selectedEthnicity);
                } else {
                    // If "Prefer not to say" is already selected, remove it and add the new selection
                    const withoutPreferNotToSay = currentEthnicities.filter(ethnicity => ethnicity !== 'Prefer not to say');
                    if (withoutPreferNotToSay.length < 8) {
                        return [...withoutPreferNotToSay, selectedEthnicity];
                    } else {
                        Alert.alert(
                            "Maximum number exceeded",
                            "You may choose up to 8 ethnicities."
                        );
                        return currentEthnicities;
                    }
                }
            }
        });
    }, []);

    console.log(ethnicity);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView showsVerticalScrollIndicator={false} overScrollMode='never'>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity>
                        <Text style={styles.heading}>
                            Pick 'Prefer not to say' to hide{"\n"}your ethnicity{"\n"}{"\n"}Maximum of 8 ethnicities
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.69} onPress={handleSubmit}>
                        <View>
                            <Text style={styles.headingBold}>Save Changes</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {!isLoading &&
                    (ethnicities.map((item) => (
                        <TouchableOpacity
                            style={styles.row}
                            key={item}
                            onPress={() => {
                                handleSelectEthnicity(item);
                            }}
                        >
                            <Text style={styles.textStyle2}>{item}</Text>
                            <EthnicityCheckbox
                                key={item}
                                item={item}
                                isChecked={checkedState[item]}
                                onToggle={handleSelectEthnicity}
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
