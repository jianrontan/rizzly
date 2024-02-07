import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Animated, View, ScrollView, FlatList, PanResponder, SafeAreaView, StyleSheet, Text, TouchableOpacity, Alert, TextInput, Image, Button, Dimensions, BackHandler, ActivityIndicator } from 'react-native';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { add, eq, set, useCode } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { getDoc, updateDoc, doc, setDoc, addDoc, collection, onSnapshot, arrayUnion, DocumentSnapshot } from 'firebase/firestore';
import { db, storage } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { uploadBytesResumable, ref, getDownloadURL, deleteObject } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { DraggableGrid } from 'react-native-draggable-grid';
import Spinner from 'react-native-loading-spinner-overlay';

import { setViewProfileChanges, setSaveChanges } from '../redux/actions';
import { COLORS, SIZES, FONT, icons } from '../constants';

const EditPhotos = ({ navigation }) => {

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Screen
    const { width } = Dimensions.get('window');

    // Images
    const [image, setImage] = useState([]);
    const [startImage, setStartImage] = useState([]);
    const [removedImage, setRemovedImage] = useState([]);

    // Uploading
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Changes
    const [isLoading, setIsLoading] = useState(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Redux
    const dispatch = useDispatch();
    const saveChangesVal = useSelector(state => state.editProfileReducer.saveChangesVal);

    // Firestore data
    const getFirestoreData = () => {
        const docRef = doc(db, 'profiles', userId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const holdData = docSnap.data();
                if (holdData.imageURLs) {
                    const initialImages = holdData.imageURLs.map((url, index) => ({
                        key: Math.random().toString(),
                        id: Math.random().toString(),
                        uri: url,
                        order: index
                    }));
                    setImage(initialImages);
                    setStartImage(initialImages);
                } else {
                    setImage([]);
                    setStartImage([]);
                }
                setIsLoading(false);
            } else {
                console.log('No such document!');
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            getFirestoreData();
            setHasUnsavedChanges(false);
            dispatch(setViewProfileChanges(false));
        }, [])
    );

    // Image rendering
    const renderItem = (item) => {
        return (
            <View key={item.key} style={styles.item}>
                <Image source={{ uri: item.uri }} style={styles.image} />
                <TouchableOpacity
                    onPress={() => removeImage(item.id)}
                    style={{
                        position: 'absolute',
                        right: -5,
                        top: -5,
                        backgroundColor: '#d9dbda',
                        width: 20,
                        height: 20,
                        borderRadius: 15,
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1,
                    }}>
                    <Image source={icons.cross} style={{ width: 13, height: 13, }}></Image>
                </TouchableOpacity>
            </View>
        );
    };

    // Image dragging
    const onDragRelease = (newDataOrder) => {
        const newData = newDataOrder.map((item, index) => ({
            ...item,
            order: index,
        }));
        setImage(newData);
    };

    // Image uploading
    const handleImage = async () => {
        if (image.length >= 6) {
            Alert.alert(
                "Invalid Photo Count",
                `Maximum number of pictures uploaded.`,
                [{ text: "OK" }]
            );
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.2,
        });
        if (!result.canceled) {
            let newImage = {
                key: Math.random().toString(),
                id: Math.random().toString(),
                uri: result.assets[0].uri,
                order: image.length,
                isNew: true,
            };
            setImage(prevImages => [...prevImages, newImage]);
        }
    };

    // Image removal
    const removeImage = (id) => {
        const imgIndex = image.findIndex((img) => img.id === id);
        if (imgIndex !== -1) {
            const { uri, isNew } = image[imgIndex];
            if (!isNew) {
                setRemovedImage((oldArray) => [...oldArray, uri]);
            }
            setImage((prevImages) => prevImages.filter((img) => img.id !== id));
        }
    };

    // Image uploading
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

    const handleSubmit = async () => {
        if (image.length < 1) {
            setSubmitting(false);
            Alert.alert(
                "Invalid Photo Count",
                `Please upload at least one photo`,
                [{ text: "OK" }]
            );
            return;
        }
        if (!hasUnsavedChanges) {
            setSubmitting(false);
            return;
        }
        setSubmitting(true);
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
                imageURLs: imageURLs,
            });
            setHasUnsavedChanges(false);
            dispatch(setViewProfileChanges(false));
            dispatch(setSaveChanges(false));
        } catch (e) {
            console.error("Error submitting: ", e);
            setHasUnsavedChanges(false);
            dispatch(setViewProfileChanges(false));
            dispatch(setSaveChanges(false));
            setError(e.message);
        }
        setSubmitting(false);
    };

    useEffect(() => {
        if(saveChangesVal) {
            handleSubmit();
            navigation.navigate('View')
        }
    }, [saveChangesVal]);

    // Track changes
    const arraysEqual = (a, b) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i].uri !== b[i].uri || a[i].order !== b[i].order) return false;
        }
        return true;
    };

    useEffect(() => {
        if (!isLoading) {
            if (
                arraysEqual(image, startImage)
            ) {
                setHasUnsavedChanges(false);
                dispatch(setViewProfileChanges(false));
                console.log("viewprofile changed hasUnsavedChanges to false")
            } else {
                setHasUnsavedChanges(true);
                dispatch(setViewProfileChanges(true));
                console.log("viewprofile changed hasUnsavedChanges to true")
            }
        }
    }, [image]);

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
                                dispatch(setViewProfileChanges(false));
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
        <View style={styles.wrapper}>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={handleImage}>
                    <Text style={styles.headingBold}>Upload Image</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.69} onPress={handleSubmit}>
                    <View>
                        <Text style={styles.headingBold}>Save Changes</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={{ padding: 10 }}>
                <Text style={styles.heading}>Hold and drag to rearrange images</Text>
            </View>
            <DraggableGrid
                numColumns={2}
                data={image}
                renderItem={renderItem}
                disableResorted={true}
                onDragRelease={onDragRelease}
            />
            <View style={{ alignItems: 'center', justifyContent: 'center', padding: 10 }}>
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
        </View>
    );
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
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
});

export default EditPhotos;