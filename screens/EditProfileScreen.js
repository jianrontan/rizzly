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
    const [job, setJob] = useState('');
    const [jobString, setJobString] = useState('');

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
                setJob(holdData.job || '');

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

    const getJobString = () => {
        let jobString = job;
        if (job.length > 25) {
            jobString = `${jobString.substring(0, 22)}...`;
        }
        return jobString;
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

    useEffect(() => {
        if (job.length > 0) {
            const newJobString = getJobString(job);
            setJobString(newJobString);
        }
    }, [job]);

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
    const navigateWork = () => {
        navigation.navigate('Work');
    }
    const navigateVices = () => {
        navigation.navigate('Vices');
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

                <TouchableOpacity onPress={navigateName}>
                    <View style={styles.tabView}>
                        <Text style={styles.tabText}>My Name</Text>
                        <Text style={styles.tabInfoText}>{fullNameString}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.borderLine}></View>

                <TouchableOpacity onPress={navigateGender}>
                    <View style={styles.tabView}>
                        <Text style={styles.tabText}>My Gender</Text>
                        <Text style={styles.tabInfoText}>{gender}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.borderLine}></View>

                <TouchableOpacity onPress={navigateSexuality}>
                    <View style={styles.tabView}>
                        <Text style={styles.tabText}>My Sexuality</Text>
                        <Text style={styles.tabInfoText}>{orientationString}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.borderLine}></View>

                <TouchableOpacity onPress={navigatePhotos}>
                    <View style={styles.tabView}>
                        <Text style={styles.tabText}>My Photos</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.borderLine}></View>

                <TouchableOpacity onPress={navigateLocation}>
                    <View style={styles.tabView}>
                        <Text style={styles.tabText}>My Location</Text>
                        <Text style={styles.tabInfoText}>{locationString}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.borderLine}></View>

                <TouchableOpacity onPress={navigateAbout}>
                    <View style={styles.tabView}>
                        <Text style={styles.tabText}>About Me</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.borderLine}></View>

                <TouchableOpacity onPress={navigateHeight}>
                    <View style={styles.tabView}>
                        <Text style={styles.tabText}>Height</Text>
                        <Text style={styles.tabInfoText}>{cmHeight}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.borderLine}></View>

                <TouchableOpacity onPress={navigateEthnicity}>
                    <View style={styles.tabView}>
                        <Text style={styles.tabText}>Ethnicity</Text>
                        <Text style={styles.tabInfoText}>{ethnicityString}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.borderLine}></View>

                <TouchableOpacity onPress={navigateReligion}>
                    <View style={styles.tabView}>
                        <Text style={styles.tabText}>Religion</Text>
                        <Text style={styles.tabInfoText}>{religion}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.borderLine}></View>

                <TouchableOpacity onPress={navigateChildren}>
                    <View style={styles.tabView}>
                        <Text style={styles.tabText}>Children</Text>
                        <Text style={styles.tabInfoText}>{children}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.borderLine}></View>

                <TouchableOpacity onPress={navigateEducation}>
                    <View style={styles.tabView}>
                        <Text style={styles.tabText}>Education</Text>
                        <Text style={styles.tabInfoText}>{education}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.borderLine}></View>

                <TouchableOpacity onPress={navigateWork}>
                    <View style={styles.tabView}>
                        <Text style={styles.tabText}>Work</Text>
                        <Text style={styles.tabInfoText}>{jobString}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.borderLine}></View>

                <TouchableOpacity onPress={navigateVices}>
                    <View style={styles.tabView}>
                        <Text style={styles.tabText}>Vices</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.borderLine}></View>

                <Spinner
                    visible={isLoading && !fullName}
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
        flex: 1,
        backgroundColor: '#6e4639',
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
        borderBottomColor: "#805c5e",
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
        color: "white"
    },
    tabInfoText: {
        fontFamily: FONT.regular,
        fontSize: SIZES.small,
        color: 'white'
    }
});
