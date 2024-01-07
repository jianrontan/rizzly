import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, TextInput, Image, Button, Dimensions, BackHandler } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSelector, useDispatch } from 'react-redux';
import { getDoc, updateDoc, doc, setDoc, addDoc, collection, onSnapshot, arrayUnion } from 'firebase/firestore';
import { db, storage } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { uploadBytesResumable, ref, getDownloadURL } from 'firebase/storage';
import { StatusBar } from 'expo-status-bar';
import DraggableFlatList from 'react-native-draggable-flatlist';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import SelectDropdown from 'react-native-select-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';

import OptionButton from '../components/touchableHighlight/touchableHightlight'
import { COLORS, SIZES, FONT } from '../constants';

export default function ProfileScreen({ navigation }) {

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Screen
    const { width } = Dimensions.get('window')

    // Name
    const [name, setName] = useState('');

    // Gender
    const [gender, setGender] = useState('');

    // Orientation
    const [orientation, setOrientation] = useState({
        male: false,
        female: false,
        nonBinary: false,
    });
    const [orientationError, setOrientationError] = useState('');

    // Birthday
    const [date, setDate] = useState(new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()));
    const [birthday, setBirthday] = useState('');
    const [dateText, setDateText] = useState('Pick Your Birthday');
    const [datePickerValue, setDatePickerValue] = useState(date);
    const [newDateSet, setNewDateSet] = useState(false);
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

    //Age 
    const [age, setAge] = useState(null);

    // Images
    const [image, setImage] = useState([]);
    const [progress, setProgress] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    // Bio
    const [bio, setBio] = useState('');

    // Submit
    const [error, setError] = useState('');

    // Gender List
    const genders = ["Male", "Female", "Non-binary"]

    // TODO: Add in Bio paragraph and prompts, eventually phone number verification.
    // Ensure no bugs, e.g. double upload, can upload without filling all the details
    // Make page cleaner, more readable, format all the buttons etc to look cleaner

    // ****ORIENTATION****
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

    //***AGE ***
    const calculateAge = (birthday) => {
        const today = new Date();
        const [day, month, year] = birthday.split("/");
        const birthDate = new Date(year, month - 1, day); // months are 0-based in JavaScript
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    // ****BIRTHDAYS****
    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        let tempDate = new Date(currentDate);
        let fDate = `${tempDate.getDate()}/${tempDate.getMonth() + 1}/${tempDate.getFullYear()}`;
        let textDate = `${tempDate.getDate()}-${tempDate.getMonth() + 1}-${tempDate.getFullYear()}`;
        setShow(false);
        if (event.type === 'set') {
            setBirthday(fDate);
            setDatePickerValue(currentDate);
            setDateText(textDate);
            setNewDateSet(true);
        }
    };

    useEffect(() => {
        if (newDateSet) {
            setShow(false);
            const userAge = calculateAge(birthday);
            setAge(userAge)
            setNewDateSet(false);
        }
    }, [newDateSet, birthday]);

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    }

    // ****IMAGES****
    // Handle image selection
    const handleImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.2,
        });
        if (!result.canceled) {
            let newImage = { id: Math.random().toString(), uri: result.assets[0].uri, order: image.length };
            setImage(prevImages => [...prevImages, newImage]);
        }
    };

    // Handle image uploading
    const uploadImage = async (uri, fileType) => {
        const response = await fetch(uri);
        const blob = await response.blob();

        const storageRef = ref(storage, "profile_pictures/" + userId + "/" + new Date().getTime());
        const uploadTask = uploadBytesResumable(storageRef, blob);

        return new Promise((resolve, reject) => {
            uploadTask.on("state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    console.log("Upload is " + progress + "% done")
                    setProgress(progress.toFixed())
                },
                (error1) => {
                    console.log(error1)
                    reject(error1);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        console.log("File available at: ", downloadURL);
                        resolve(downloadURL);
                    })
                }
            )
        });
    }

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
                            <Image key={item.key} source={{ uri: item.uri }} style={{ width: 150, height: 200 }} />
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
        console.log("removeImage called")
        const { uri } = image.find((img) => img.id === id);

        setImage(prevImages => {
            return prevImages.filter((image) => image.id !== id).map((img, index) => {
                img.order = index;
                return img;
            });
        });
        setRefreshKey(oldKey => oldKey + 1);
    };

    // SUBMIT //
    // ****SUBMIT**** user details and navigates user to the main App screen
    const handleSubmit = async () => {
        if (name !== null && name !== '' && gender !== '' && Object.values(orientation).some(option => option) && image.length > 0 && birthday !== null && birthday !== '' && bio !== null && bio !== '') {
            try {
                const userId = auth.currentUser.uid;
                const userDocRef = doc(db, 'profiles', userId);

                const sortedImages = [...image].sort((a, b) => a.order - b.order)
                const imageURLs = [];
                for (let img of sortedImages) {
                    const url = await uploadImage(img.uri, "image");
                    imageURLs.push(url);
                }
                await updateDoc(userDocRef, {
                    name: name,
                    birthday: birthday,
                    gender: gender,
                    orientation: orientation,
                    imageURLs: imageURLs,
                    bio: bio,
                });
                navigation.navigate('SelfieCapture');
            } catch (e) {
                console.error("Error submitting: ", e);
                setError(e.message);
            }
        } else {
            setError('Please fill out all the fields.');
        }
    };

    // BACK BUTTON HANDLER
    useEffect(() => {
        const backAction = () => true;

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);

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
                            {/* Name */}
                            <View style={{ paddingTop: 42, paddingBottom: 15 }}>
                                <Text style={{ fontFamily: FONT.bold, fontSize: SIZES.mediumlarge }}>Profile Set Up</Text>
                            </View>
                            <View>
                                <TextInput
                                    autoFocus={false}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter your name"
                                />
                            </View>
                            {/* Birthday */}
                            <View>
                                <TouchableOpacity onPress={() => showMode('date')}>
                                    <Text>{dateText}</Text>
                                </TouchableOpacity>
                                {show && (
                                    <DateTimePicker
                                        id='datePicker'
                                        value={datePickerValue}
                                        mode={mode}
                                        display='default'
                                        onChange={onChangeDate}
                                        maximumDate={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())}
                                    />
                                )}
                            </View>
                            {/* Age */}
                            <View>
                                <Text>Age: {age}</Text>
                            </View>
                            {/* Gender */}
                            <View>
                                <SelectDropdown
                                    defaultButtonText='Gender'
                                    data={genders}
                                    onSelect={setGender}
                                />
                            </View>
                            {/* Orientation */}
                            <View>
                                <>
                                    <OptionButton id="male" text="Male" onPress={handleOrientation} />
                                    <OptionButton id="female" text="Female" onPress={handleOrientation} />
                                    <OptionButton id="nonBinary" text="Non-Binary" onPress={handleOrientation} />
                                </>
                            </View>
                            <View>
                                {!!orientationError && <Text style={{ color: '#cf0202' }}>{orientationError}</Text>}
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
                        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
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
                            {/* Submit */}
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