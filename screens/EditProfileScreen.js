import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, Alert, TextInput, Image, Button, Dimensions, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSelector, useDispatch } from 'react-redux';
import { getDoc, updateDoc, doc, setDoc, addDoc, collection, onSnapshot, arrayUnion } from 'firebase/firestore';
import { db, storage } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { uploadBytesResumable, ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { StatusBar } from 'expo-status-bar';
import DraggableFlatList from 'react-native-draggable-flatlist';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import SelectDropdown from 'react-native-select-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';

import OptionButton from '../components/touchableHighlight/touchableHightlight';
import { COLORS, SIZES, FONT } from '../constants';

export default function EditProfileScreen({ navigation }) {

    // All data
    const [userData, setUserData] = useState(null);

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Screen
    const { width } = Dimensions.get('window');

    // Orientation
    const [orientation, setOrientation] = useState(null);
    const [initialOrientation, setInitialOrientation] = useState(null);
    const [orientationError, setOrientationError] = useState('');
    const defaultOrientation = { male: false, female: false, nonBinary: false };
    const actualOrientation = orientation || defaultOrientation;

    // Images
    const [image, setImage] = useState([]);
    const [initialImage, setInitialImage] = useState([]);
    const [removedImage, setRemovedImage] = useState([]);
    const [progress, setProgress] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

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
                setInitialOrientation(holdData.orientation);
                if (holdData.imageURLs) {
                    const initialImages = holdData.imageURLs.map((url, index) => ({
                        id: Math.random().toString(),
                        uri: url,
                        order: index
                    }));
                    setImage(initialImages);
                    setInitialImage(initialImages);
                } else {
                    setImage([]);
                    setInitialImage([]);
                }
                setIsLoading(false);
            } else {
                console.log('No such document!');
            }
        });

        // Clean up the listener when the component unmounts
        return () => unsubscribe();
    };

    useEffect(() => {
        getFirestoreData();
    }, []);

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
                isNew: true, // Assume all picked images are new and local
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
    const handleSubmit = async () => {
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

            for (let url of removedImage) {
                const deleteRef = ref(storage, url);
                await deleteObject(deleteRef);
            };

            await updateDoc(userDocRef, {
                orientation: orientation,
                imageURLs: imageURLs,
            });
            setHasUnsavedChanges(false);
            console.log("edit profile screen changed hasUnsavedChanges to false")
            navigation.navigate('App');
        } catch (e) {
            console.error("Error submitting: ", e);
            setError(e.message);
        }
    };

    // CHANGES
    useEffect(() => {
        if (!isLoading) {
            if (orientation !== initialOrientation || image !== initialImage) {
                setHasUnsavedChanges(true);
                console.log("edit profile screen changed hasUnsavedChanges to true")
            } else {
                setHasUnsavedChanges(false);
                console.log("edit profile screen changed hasUnsavedChanges to false")
            }
        }
    }, [orientation, image, isLoading]);

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
                                setOrientation(initialOrientation);
                                setImage(initialImage);
                                navigation.navigate('App')
                            },
                        },
                    ]);
                    return true;
                }
            };
    
            const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    
            return () => backHandler.remove();
        }, [hasUnsavedChanges, initialOrientation, initialImage, navigation])
    );

    return (
        <SafeAreaView style={styles.container}>
            <DraggableFlatList
                style={{ flex: 1, width: width }}
                showsVerticalScrollIndicator={false}
                data={image}
                renderItem={renderItem}
                keyExtractor={(item, index) => `draggable-item-${index}`}
                onDragEnd={({ data }) => {
                    data.forEach((item, index) => {
                        item.order = index;
                    });
                    setImage(data);
                }}
                extraData={[image, refreshKey]}
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
                        {/* Submit */}
                        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 50 }}>
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
        </SafeAreaView>
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