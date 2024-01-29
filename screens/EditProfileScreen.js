import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, Alert, TextInput, Image, Button, Dimensions, BackHandler, ActivityIndicator } from 'react-native';
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

import { setHasUnsavedChangesExport } from '../redux/actions';
import { COLORS, SIZES, FONT, icons } from '../constants';
import { isLoading } from 'expo-font';

export default function EditProfileScreen({ navigation }) {

    // FIX LOGOUT ERROR

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Data
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [fullName, setFullName] = useState('');
    const [fullNameString, setFullNameString] = useState('');
    const [gender, setGender] = useState('');
    const [orientation, setOrientation] = useState(null);
    const [orientationString, setOrientationString] = useState('');
    const [location, setLocation] = useState('');
    const [locationString, setLocationString] = useState('');
    const [cmHeight, setCmHeight] = useState(null);
    const [ftHeight, setFtHeight] = useState(null);
    const [ethnicity, setEthnicity] = useState([]);
    const [ethnicityString, setEthnicityString] = useState('');
    const [religion, setReligion] = useState('');
    const [children, setChildren] = useState('');
    const [education, setEducation] = useState('');

    // Loading
    const [isLoading, setIsLoading] = useState(true);

    // Firestore data
    const getFirestoreData = () => {
        const docRef = doc(db, 'profiles', userId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const holdData = docSnap.data();
                setFirstName(holdData.firstName || '');
                setLastName(holdData.lastName || '');
                setFullName(`${holdData.firstName} ${holdData.lastName}` || '');
                setGender(holdData.gender || '');
                setOrientation(holdData.orientation || null);
                setLocation(holdData.location || '');
                setCmHeight(`${holdData.cmHeight} cm` || '');
                setFtHeight(holdData.ftHeight || '');
                setEthnicity(holdData.ethnicity || []);
                setReligion(holdData.religion || '');
                setChildren(holdData.children || '');
                setEducation(holdData.education || '');

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

    // Parse info
    const getOrientationString = (orientation) => {
        const labels = [];
        if (orientation.female) labels.push("Female");
        if (orientation.male) labels.push("Male");
        if (orientation.nonBinary) labels.push("Non-binary");
        return labels.join(", ");
    };

    console.log(ethnicity);

    // Update orientation string when orientation changes
    useEffect(() => {
        if (orientation) {
            const newOrientationString = getOrientationString(orientation);
            setOrientationString(newOrientationString);
        }
    }, [orientation]);

    // Format strings
    const getEthnicityString = (ethnicityArray) => {
        const cleanedItems = ethnicityArray.map(item =>
            item.replace(/\s*\([^)]*\)/, '').trim()
        );
        let ethnicityString = cleanedItems.join(', ');
        if (ethnicityString.length > 25) {
            ethnicityString = `${ethnicityString.substring(0, 22)}...`;
        }
        return ethnicityString;
    };

    const getLocationString = () => {
        let locationString = location;
        if (location.length > 25) {
            locationString = `${locationString.substring(0, 22)}...`;
        }
        return locationString;
    }

    const getFullNameString = () => {
        let fullNameString = fullName;
        if (fullName.length > 25) {
            fullNameString = `${fullNameString.substring(0, 22)}...`;
        }
        return fullNameString;
    }

    useEffect(() => {
        if (ethnicity.length > 0) {
            const newEthnicityString = getEthnicityString(ethnicity);
            setEthnicityString(newEthnicityString);
        }
    }, [ethnicity]);

    useEffect(() => {
        if (location.length > 0) {
            const newLocationString = getLocationString(location);
            setLocationString(newLocationString);
        }
    }, [location]);

    useEffect(() => {
        if (fullName.length > 0) {
            const newFullNameString = getFullNameString(fullName);
            setFullNameString(newFullNameString);
        }
    }, [fullName]);

    // Navigate
    const navigateName = () => {
        navigation.navigate('My Name');
    }
    const navigateGender = () => {
        navigation.navigate('My Gender');
    }
    const navigateSexuality = () => {
        navigation.navigate('My Sexuality');
    }
    const navigatePhotos = () => {
        navigation.navigate('Edit Photos');
    }
    const navigateLocation = () => {
        navigation.navigate('My Location');
    }
    const navigateAbout = () => {
        navigation.navigate('About Me');
    }
    const navigateHeight = () => {
        navigation.navigate('Height');
    }
    const navigateEthnicity = () => {
        navigation.navigate('Ethnicity');
    }
    const navigateReligion = () => {
        navigation.navigate('Religion');
    }
    const navigateChildren = () => {
        navigation.navigate('Children');
    }
    const navigateEducation = () => {
        navigation.navigate('Education');
    }

    return (
        <SafeAreaView>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>

                <View style={styles.tabView}>
                    <TouchableOpacity onPress={navigateName}>
                        <Text style={styles.tabText}>My Name</Text>
                    </TouchableOpacity>
                    <Text style={styles.tabInfoText}>{fullNameString}</Text>
                </View>

                <View style={styles.borderLine}></View>

                <View style={styles.tabView}>
                    <TouchableOpacity onPress={navigateGender}>
                        <Text style={styles.tabText}>My Gender</Text>
                    </TouchableOpacity>
                    <Text style={styles.tabInfoText}>{gender}</Text>
                </View>

                <View style={styles.borderLine}></View>

                <View style={styles.tabView}>
                    <TouchableOpacity onPress={navigateSexuality}>
                        <Text style={styles.tabText}>My Sexuality</Text>
                    </TouchableOpacity>
                    <Text style={styles.tabInfoText}>{orientationString}</Text>
                </View>

                <View style={styles.borderLine}></View>

                <View style={styles.tabView}>
                    <TouchableOpacity onPress={navigatePhotos}>
                        <Text style={styles.tabText}>My Photos</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.borderLine}></View>

                <View style={styles.tabView}>
                    <TouchableOpacity onPress={navigateLocation}>
                        <Text style={styles.tabText}>My Location</Text>
                    </TouchableOpacity>
                    <Text style={styles.tabInfoText}>{locationString}</Text>
                </View>

                <View style={styles.borderLine}></View>

                <View style={styles.tabView}>
                    <TouchableOpacity onPress={navigateAbout}>
                        <Text style={styles.tabText}>About Me</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.borderLine}></View>

                <View style={styles.tabView}>
                    <TouchableOpacity onPress={navigateHeight}>
                        <Text style={styles.tabText}>Height</Text>
                    </TouchableOpacity>
                    <Text style={styles.tabInfoText}>{cmHeight}</Text>
                </View>

                <View style={styles.borderLine}></View>

                <View style={styles.tabView}>
                    <TouchableOpacity onPress={navigateEthnicity}>
                        <Text style={styles.tabText}>Ethnicity</Text>
                    </TouchableOpacity>
                    <Text style={styles.tabInfoText}>{ethnicityString}</Text>
                </View>

                <View style={styles.borderLine}></View>

                <View style={styles.tabView}>
                    <TouchableOpacity onPress={navigateReligion}>
                        <Text style={styles.tabText}>Religion</Text>
                    </TouchableOpacity>
                    <Text style={styles.tabInfoText}>{religion}</Text>
                </View>

                <View style={styles.borderLine}></View>

                <View style={styles.tabView}>
                    <TouchableOpacity onPress={navigateChildren}>
                        <Text style={styles.tabText}>Children</Text>
                    </TouchableOpacity>
                    <Text style={styles.tabInfoText}>{children}</Text>
                </View>

                <View style={styles.borderLine}></View>

                <View style={styles.tabView}>
                    <TouchableOpacity onPress={navigateEducation}>
                        <Text style={styles.tabText}>Education</Text>
                    </TouchableOpacity>
                    <Text style={styles.tabInfoText}>{education}</Text>
                </View>

                <View style={styles.borderLine}></View>

                <View style={styles.tabView}>
                    <TouchableOpacity>
                        <Text style={styles.tabText}>Work</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.borderLine}></View>

                <View style={styles.tabView}>
                    <TouchableOpacity>
                        <Text style={styles.tabText}>Vices</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.borderLine}></View>

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
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
    },
    btnContainer: {
        width: 200,
        height: 60,
        backgroundColor: COLORS.themeColor,
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
    textStyle2: {
        fontFamily: FONT.medium,
        fontSize: SIZES.smallmedium,
        color: 'black',
    },
    heading: {
        fontFamily: FONT.bold,
        color: 'gray'
    },
    borderLine: {
        borderBottomColor: "gray",
        borderBottomWidth: 1,
    },
    tabView: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    tabText: {
        fontFamily: FONT.medium,
        fontSize: SIZES.medium,
    },
    tabInfoText: {
        fontFamily: FONT.regular,
        fontSize: SIZES.small,
        color: 'gray'
    }
});
