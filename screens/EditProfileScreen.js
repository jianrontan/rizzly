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
import { COLORS, SIZES, FONT } from '../constants';

export default function EditProfileScreen({ navigation }) {

    // HANDLE CASE FOR WHEN NO BIO OR NO PROMPT IN GETFIRESTORE DATA

    // Error Fixing State
    const [discardChangesKey, setDiscardChangesKey] = useState(0);
    const [listKey, setListKey] = useState(Math.random().toString());

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Screen
    const { width } = Dimensions.get('window');

    // Images
    const [image, setImage] = useState([]);
    const [startImage, setStartImage] = useState([]);
    const [removedImage, setRemovedImage] = useState([]);
    const [progress, setProgress] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    // Bio
    const [bio, setBio] = useState('');
    const [startBio, setStartBio] = useState('');

    // Prompts
    const [prompt1, setPrompt1] = useState('');
    const [startPrompt1, setStartPrompt1] = useState('');
    const [prompt2, setPrompt2] = useState('');
    const [startPrompt2, setStartPrompt2] = useState('');

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
                setBio(holdData.bio);
                setStartBio(holdData.bio);
                setPrompt1(holdData.prompt1);
                setStartPrompt1(holdData.prompt1);
                setPrompt2(holdData.prompt2);
                setStartPrompt2(holdData.prompt2);
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
                    }, 200);
                } else {
                    setImage([]);
                    setStartImage([]);
                    setRefreshKey(oldKey => oldKey + 1);
                    setDiscardChangesKey(oldKey => oldKey + 1);
                    setListKey(Math.random().toString());
                    setBio(prevBio => prevBio + " ");
                    setTimeout(() => {
                        setBio(prevBio => prevBio.trim());
                    }, 200);
                }
                setTimeout(() => {
                    setIsLoading(false);
                }, 500);
                setIsLoading(false);
            } else {
                console.log('No such document!');
                setTimeout(() => {
                    setIsLoading(false);
                }, 500);
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
        if (!hasUnsavedChanges) {
            Di
            navigation.navigate('App');
            return;
        }
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
                bio: bio,
                prompt1: prompt1,
                prompt2: prompt2,
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
            if (a[i].uri !== b[i].uri || a[i].order !== b[i].order) return false;
        }
        return true;
    };

    useEffect(() => {
        if (!isLoading) {
            if (
                bio == startBio &&
                prompt1 == startPrompt1 &&
                prompt2 == startPrompt2 &&
                arraysEqual(image, startImage)
            ) {
                setHasUnsavedChanges(false);
                dispatch(setHasUnsavedChangesExport(false));
                console.log("edit profile screen changed hasUnsavedChanges to false")
            } else {
                setHasUnsavedChanges(true);
                dispatch(setHasUnsavedChangesExport(true));
                console.log("edit profile screen changed hasUnsavedChanges to true")
            }
        }
    }, [image, isLoading, bio, prompt1, prompt2]);

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
                } else {
                    navigation.navigate('App');
                    return true;
                }
            };

            const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

            return () => backHandler.remove();
        }, [hasUnsavedChanges, image, bio, navigation])
    );

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
                                    {/* Prompt 1 */}
                                    <View style={{ paddingBottom: 20 }}>
                                        <Text>Prompt 1:</Text>
                                        <TextInput
                                            autoFocus={false}
                                            value={prompt1}
                                            onChangeText={setPrompt1}
                                            maxLength={100}
                                            multiline={true}
                                            placeholder="Write your response..."
                                            style={{
                                                backgroundColor: "#f0f0f0",
                                                paddingVertical: 4,
                                                paddingHorizontal: 10,
                                                width: 205.5,
                                            }}
                                        />
                                    </View>
                                    {!!error && <Text style={{ color: '#cf0202' }}>{error}</Text>}
                                    {/* Prompt 2 */}
                                    <View style={{ paddingBottom: 20 }}>
                                        <Text>Prompt 2:</Text>
                                        <TextInput
                                            autoFocus={false}
                                            value={prompt2}
                                            onChangeText={setPrompt2}
                                            maxLength={100}
                                            multiline={true}
                                            placeholder="Write your response..."
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
            <Spinner
                visible={isLoading || isSubmitting}
                overlayColor="white"
                color="black"
            />
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
