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
import SelectDropdown from 'react-native-select-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';

import { setHasUnsavedChangesExport } from '../redux/actions';
import OptionButton from '../components/touchableHighlight/touchableHightlight';
import { COLORS, SIZES, FONT } from '../constants';
import { useAnimatedStyle } from 'react-native-reanimated';

export default function EditProfileScreen({ navigation }) {

    // All data
    const [userData, setUserData] = useState(null);

    // Error Fixing State
    const [discardChangesKey, setDiscardChangesKey] = useState(0);
    const [listKey, setListKey] = useState(Math.random().toString());
    const [spaceAdded, setSpaceAdded] = useState(false);

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Screen
    const { width } = Dimensions.get('window');

    // Orientation
    const [orientation, setOrientation] = useState(null);
    const [startOrientation, setStartOrientation] = useState(null);
    const [orientationError, setOrientationError] = useState('');
    const defaultOrientation = { male: false, female: false, nonBinary: false };
    const actualOrientation = orientation || defaultOrientation;

    // Images
    const [image, setImage] = useState([]);
    const [startImage, setStartImage] = useState([]);
    const [removedImage, setRemovedImage] = useState([]);
    const [progress, setProgress] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    // Bio
    const [bio, setBio] = useState('');
    const [startBio, setStartBio] = useState('');

    // Update
    const [error, setError] = useState('');

    // Changes
    const [isLoading, setIsLoading] = useState(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Changes > Redux
    const dispatch = useDispatch();

    // Get user's data
    const getFirestoreData = () => {
        const docRef = doc(db, 'profiles', userId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const holdData = docSnap.data();
                setUserData(holdData);
                setOrientation(holdData.orientation);
                setStartOrientation(holdData.orientation);
                setBio(holdData.bio);
                setStartBio(holdData.bio);
                if (holdData.imageURLs) {
                    const initialImages = holdData.imageURLs.map((url, index) => ({
                        id: Math.random().toString(),
                        uri: url,
                        order: index
                    }));
                    setImage(initialImages);
                    setStartImage(initialImages);
                    setRefreshKey(oldKey => oldKey + 1);
                    setDiscardChangesKey(oldKey => oldKey + 1);
                    setListKey(Math.random().toString());
                    setBio(prevBio => prevBio + " ");
                    setTimeout(() => {
                        setBio(prevBio => prevBio.trim());
                    }, 500);
                } else {
                    setImage([]);
                    setStartImage([]);
                    setRefreshKey(oldKey => oldKey + 1);
                    setDiscardChangesKey(oldKey => oldKey + 1);
                    setListKey(Math.random().toString());
                    setBio(prevBio => prevBio + " ");
                    setTimeout(() => {
                        setBio(prevBio => prevBio.trim());
                    }, 500);
                }
                setIsLoading(false);
            } else {
                console.log('No such document!');
                setIsLoading(false);
            }
        });

        // Clean up the listener when the component unmounts
        return () => unsubscribe();
    };

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            getFirestoreData();
        }, [])
    );

    // ORIENTATION
    const handleOrientation = (id, isSelected) => {
        setOrientation(prevState => {
            const newOrientation = { ...prevState, [id]: isSelected };
            if (Object.values(newOrientation).every(option => !option)) {
                setOrientationError('Please select at least one orientation.');
            } else {
                setOrientationError('');
            }
            return newOrientation;
        });
    };

    // IMAGES
    const handleImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.2,
        });
        if (!result.canceled) {
            let newImage = {
                id: Math.random().toString(),
                uri: result.assets[0].uri,
                order: image.length,
                isNew: true,
            };
            setImage(prevImages => [...prevImages, newImage]);
        }
    };

    const uploadImage = async (uri, order, id) => {
        const response = await fetch(uri);
        const blob = await response.blob();

        const storageRef = ref(storage, `profile_pictures/${userId}/${Date.now()}`);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                    setProgress(progress.toFixed());
                },
                (error) => {
                    console.log(error);
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        console.log(`File available at: ${downloadURL}`);
                        resolve({ url: downloadURL, id: id });
                    });
                }
            );
        });
    };

    const renderItem = ({ item, index, drag, isActive }) => {
        return (
            <GestureHandlerRootView>
                <View
                    style={{
                        height: 200,
                        backgroundColor: isActive ? 'transparent' : item.backgroundColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <View style={{ marginTop: 50 }}>
                        <TouchableOpacity onLongPress={drag}>
                            <Image key={index} source={{ uri: item.uri }} style={{ width: 150, height: 200 }} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ flex: 1, marginTop: 35, alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={() => removeImage(item.id)} style={{ borderWidth: 1 }}>
                        <Text>Remove</Text>
                    </TouchableOpacity>
                </View>
            </GestureHandlerRootView>
        );
    };

    const removeImage = (id) => {
        const imgIndex = image.findIndex((img) => img.id === id);
        if (imgIndex !== -1) {
            const { uri, isNew } = image[imgIndex];
            if (!isNew) {
                setRemovedImage((oldArray) => [...oldArray, uri]);
            }
            setImage((prevImages) => prevImages.filter((img) => img.id !== id));
            setRefreshKey((oldKey) => oldKey + 1);
        }
    };

    // SUBMIT
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        // if (!hasUnsavedChanges) {
        //     navigation.navigate('App');
        //     return;
        // }
        setIsSubmitting(true);
        try {
            const userDocRef = doc(db, 'profiles', userId);
            const sortedImages = [...image].sort((a, b) => a.order - b.order);
            const imageURLs = [];

            for (let img of sortedImages) {
                if (img.isNew) {
                    const uploadResult = await uploadImage(img.uri, img.order, img.id);
                    imageURLs.push(uploadResult.url);
                } else {
                    imageURLs.push(img.uri);
                }
            }

            let successfullyRemovedImages = [];
            for (let url of removedImage) {
                try {
                    const deleteRef = ref(storage, url);
                    await deleteObject(deleteRef);
                    successfullyRemovedImages.push(url);
                } catch (error) {
                    console.error("Error deleting image: ", error);
                }
            };
            setRemovedImage(prevState => prevState.filter(url => !successfullyRemovedImages.includes(url)));

            await updateDoc(userDocRef, {
                orientation: orientation,
                bio: bio,
                imageURLs: imageURLs,
            });
            setHasUnsavedChanges(false);
            console.log("edit profile screen changed hasUnsavedChanges to false")
            navigation.navigate('App');
        } catch (e) {
            console.error("Error submitting: ", e);
            setError(e.message);
        }
        setIsSubmitting(false);
    };

    // CHANGES
    const arraysEqual = (a, b) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i].uri !== b[i].uri) return false;
        }
        return true;
    };

    useEffect(() => {
        if (!isLoading) {
            if (
                JSON.stringify(orientation) == JSON.stringify(startOrientation) &&
                bio == startBio &&
                arraysEqual(image, startImage)  
            ) {
                setHasUnsavedChanges(false);
                dispatch(setHasUnsavedChangesExport(false));
                console.log("orientation no change: ", orientation)
                console.log("startOrientation no change: ", startOrientation)
                console.log("edit profile screen changed hasUnsavedChanges to false")
            } else {
                setHasUnsavedChanges(true);
                dispatch(setHasUnsavedChangesExport(true));
                console.log("orientation changed: ", orientation)
                console.log("startOrientation changed: ", startOrientation)
                console.log("edit profile screen changed hasUnsavedChanges to true")
            }
        }
    }, [orientation, image, isLoading, bio]);

    // Hardware back button
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
                                navigation.dispatch(
                                    CommonActions.reset({
                                        index: 0,
                                        routes: [{ name: 'App' }],
                                    })
                                );
                            },
                        },
                    ]);
                    return true;
                }
            };

            const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

            return () => backHandler.remove();
        }, [hasUnsavedChanges, startOrientation, startImage, navigation])
    );

    if (isLoading || isSubmitting) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaView>
                {!isLoading && (
                    <DraggableFlatList
                        key={[discardChangesKey, listKey]}
                        style={{ flex: 1, width: width }}
                        showsVerticalScrollIndicator={false}
                        data={image}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => `draggable-item-${index}`}
                        onDragEnd={({ data }) => {
                            const newData = [...data].map((item, index) => ({
                                ...item,
                                order: index,
                            }));
                            setImage(newData);
                        }}
                        extraData={refreshKey}
                        ListHeaderComponent={
                            <>
                                <View style={styles.container}>
                                    {/* Orientation */}
                                    <View>
                                        {!!orientationError && <Text style={{ color: '#cf0202' }}>{orientationError}</Text>}
                                    </View>
                                    <View>
                                        <>
                                            <OptionButton id="male" text="Male" onPress={handleOrientation} selected={actualOrientation.male} />
                                            <OptionButton id="female" text="Female" onPress={handleOrientation} selected={actualOrientation.female} />
                                            <OptionButton id="nonBinary" text="Non-Binary" onPress={handleOrientation} selected={actualOrientation.nonBinary} />
                                        </>
                                    </View>
                                    {/* Image */}
                                    <View>
                                        <TouchableOpacity onPress={handleImage}>
                                            <Text style={styles.textStyle2}>Upload Image</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </>
                        }
                        ListFooterComponent={
                            <>
                                <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 50 }}>
                                    {/* Bio */}
                                    <View style={{ paddingBottom: 20 }}>
                                        <Text>Bio:</Text>
                                        <TextInput
                                            autoFocus={false}
                                            value={bio}
                                            onChangeText={setBio}
                                            maxLength={100}
                                            multiline={true}
                                            placeholder="Write about yourself..."
                                            style={{
                                                backgroundColor: "#f0f0f0",
                                                paddingVertical: 4,
                                                paddingHorizontal: 10,
                                                width: 205.5,
                                            }}
                                        />
                                    </View>
                                    {!!error && <Text style={{ color: '#cf0202' }}>{error}</Text>}
                                    <TouchableOpacity activeOpacity={0.69} onPress={handleSubmit} style={styles.btnContainer}>
                                        <View>
                                            <Text style={styles.textStyle}>Submit</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </>
                        }
                    />
                )}
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
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
});