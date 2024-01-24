import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, Alert, TextInput, Image, Keyboard, Button, Dimensions, BackHandler, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import { getDoc, updateDoc, doc, setDoc, addDoc, collection, onSnapshot, arrayUnion } from 'firebase/firestore';
import { db, storage } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { uploadBytesResumable, ref, getDownloadURL, deleteObject } from 'firebase/storage';
import DraggableFlatList from 'react-native-draggable-flatlist';
import * as ImagePicker from 'expo-image-picker';
import Spinner from 'react-native-loading-spinner-overlay';
import DropDownPicker from 'react-native-dropdown-picker';
import ScrollPicker from 'react-native-wheel-scrollview-picker';
import SwitchSelector from 'react-native-switch-selector';

import { COLORS, SIZES, FONT, icons } from '../constants';

export default function Height({ navigation }) {

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Height
    const [cmHeight, setCmHeight] = useState(null);
    const [ftHeight, setFtHeight] = useState(null);

    // Switch
    const [metric, setMetric] = useState(true);

    // Update
    const [error, setError] = useState('');

    // Changes
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Styling
    const width = Dimensions.get('window').width;

    // Redux
    const dispatch = useDispatch();

    // Firestore data
    const getFirestoreData = () => {
        const docRef = doc(db, 'profiles', userId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const holdData = docSnap.data();
                setCmHeight(holdData.cmHeight || "175");
                setFtHeight(holdData.ftHeight || "5'9");

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
                cmHeight: cmHeight,
                ftHeight: ftHeight,
            });
        } catch (e) {
            console.error("Error submitting: ", e);
            setError(e.message);
        }
        setSubmitting(false);
    };

    useEffect(() => {
        if (!isLoading) {
            handleSubmit();
        }
    }, [cmHeight]);

    // Conversion
    const cmToFeetInches = (cm) => {
        const totalInches = Math.round(cm / 2.54);
        const feet = Math.floor(totalInches / 12);
        const inches = totalInches % 12;
        return `${feet}'${inches}"`;
    };

    const feetInchesToCm = (feet, inches) => {
        return Math.round(((feet * 12) + inches) * 2.54);
    };

    const parseFeetInches = (ftInString) => {
        const matches = ftInString.match(/(\d+)'(\d+)"/);
        if (matches) {
            return {
                feet: parseInt(matches[1], 10),
                inches: parseInt(matches[2], 10)
            };
        }
        return { feet: 0, inches: 0 };
    };

    const generateFeetInchesDataSource = () => {
        const dataSource = [];
        let previousFeetInches = '';
        for (let cm = 50; cm <= 250; cm++) {
            const feetInches = cmToFeetInches(cm);
            if (feetInches !== previousFeetInches) {
                dataSource.push(feetInches);
                previousFeetInches = feetInches;
            }
        }
        return dataSource;
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity>
                        <Text style={styles.heading}>Your height will be visible on your profile</Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity activeOpacity={0.69} onPress={handleSubmit}>
                        <View>
                            <Text style={styles.headingBold}>Save Changes</Text>
                        </View>
                    </TouchableOpacity> */}
                </View>

                {/* METRIC */}
                {cmHeight !== null && metric && (
                    <View style={{ width: width - 40, alignSelf: 'center', paddingTop: 10 }}>
                        <ScrollPicker
                            dataSource={Array.from({ length: 201 }, (_, i) => (50 + i).toString())}
                            selectedIndex={(cmHeight - 50)}
                            renderItem={(data, index, isSelected) => {
                                const itemStyle = isSelected
                                    ? { fontSize: 20, color: 'black', fontFamily: FONT.medium }
                                    : { fontSize: 20, color: 'gray', fontFamily: FONT.medium };
                                return (
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={itemStyle}>
                                            {`${data} cm`}
                                        </Text>
                                    </View>
                                );
                            }}
                            onValueChange={(data, selectedIndex) => {
                                setCmHeight(data);
                                setFtHeight(cmToFeetInches(parseInt(data)));
                            }}
                            wrapperHeight={180}
                            wrapperBackground="#FFFFFF"
                            itemHeight={60}
                            highlightColor="#d8d8d8"
                            highlightBorderWidth={2}
                        />
                    </View>
                )}

                {/* IMPERIAL */}
                {cmHeight !== null && !metric && (
                    <View style={{ width: width - 40, alignSelf: 'center', paddingTop: 10 }}>
                        <ScrollPicker
                            dataSource={generateFeetInchesDataSource()}
                            selectedIndex={generateFeetInchesDataSource().findIndex((item) => item === ftHeight)}
                            renderItem={(data, index, isSelected) => {
                                const itemStyle = isSelected
                                    ? { fontSize: 20, color: 'black', fontFamily: FONT.medium }
                                    : { fontSize: 20, color: 'gray', fontFamily: FONT.medium };
                                return (
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={itemStyle}>
                                            {`${data}`}
                                        </Text>
                                    </View>
                                );
                            }}
                            onValueChange={(data, selectedIndex) => {
                                const { feet, inches } = parseFeetInches(data);
                                const cm = feetInchesToCm(feet, inches);
                                setCmHeight(cm.toString());
                                setFtHeight(data);
                            }}
                            wrapperHeight={180}
                            wrapperBackground="#FFFFFF"
                            itemHeight={60}
                            highlightColor="#d8d8d8"
                            highlightBorderWidth={2}
                        />
                    </View>
                )}

                {!isLoading && (
                    <View style={{ paddingHorizontal: 40, paddingVertical: 20 }}>
                        <SwitchSelector
                            initial={metric ? 0 : 1}
                            onPress={value => setMetric(value)}
                            textColor={'gray'}
                            textStyle={{ fontFamily: FONT.bold }}
                            selectedTextStyle={{ fontFamily: FONT.bold }}
                            selectedColor={'white'}
                            buttonColor={'gray'}
                            borderColor={'gray'}
                            hasPadding
                            options={[
                                { label: "CM", value: true },
                                { label: "FT IN", value: false }
                            ]}
                            testID="gender-switch-selector"
                            accessibilityLabel="gender-switch-selector"
                        />
                    </View>
                )}

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
