import { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, TextInput, Image, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { getDoc, updateDoc, doc, setDoc, addDoc, collection, onSnapshot } from 'firebase/firestore';
import { db, storage } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { uploadBytesResumable, ref, getDownloadURL } from 'firebase/storage';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import SelectDropdown from 'react-native-select-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';

import OptionButton from '../components/touchableHighlight/touchableHightlight'
import { COLORS, SIZES, FONT } from '../constants';

export default function ProfileScreen({ navigation }) {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [orientation, setOrientation] = useState({
        male: false,
        female: false,
        nonBinary: false,
    });
    const [orientationError, setOrientationError] = useState('');
    const [date, setDate] = useState(new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()));
    const [birthday, setBirthday] = useState('');
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);
    const [image, setImage] = useState([]);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');

    // Submits user's details and navigates user to the main App screen
    const handleSubmit = async () => {
        if (name !== null && name !== '' && gender !== '' && Object.values(orientation).some(option => option) && image.length > 0 && birthday !== null && birthday !== '') {
            try {
                const userId = auth.currentUser.uid;
                const userDocRef = doc(db, 'profiles', userId);

                for (let uri of image) {
                    await uploadImage(uri, "image");
                }
                await updateDoc(userDocRef, {
                    name: name,
                    birthday: birthday,
                    gender: gender,
                    orientation: orientation,
                    complete: true,
                });
                navigation.navigate('App');
            } catch(e) {
                console.error("Error submitting: ", e);
                setError(e.message);
            }
        } else {
            setError('Please fill out all the fields.');
        }
    };

    // TODO: Eventually phone number verification also,
    // Add some UI, uploading screen possible
    // Ensure no bugs, e.g. double upload, can upload without filling all the details
    // Make page cleaner, more readable, format all the buttons etc to look cleaner
    // After this need an edit profile screen for the user to change their details, need to research on other dating apps to see how this may work

    // List of genders
    const genders = ["Male", "Female", "Non-binary"]

    // Sexual orientation of user
    const handleOrientation = (id, isSelected) => {
        setOrientation(prevState => {
            const newOrientation = {...prevState, [id]: isSelected};
            if (Object.values(newOrientation).every(option => !option)) {
                setOrientationError('Please select at least one orientation.');
            } else {
                setOrientationError('');
            }
            return newOrientation;
        });
    };

    // Handle picking of birthdays
    const onChangeDate = (event, selectedDate) => {
        if (event.type === 'set') {
            const currentDate = selectedDate || date;
            setBirthday(currentDate);
            let tempDate = new Date(currentDate);
            let fDate = tempDate.getDate() + '/' + (tempDate.getMonth() + 1) + '/' + tempDate.getFullYear()
            setBirthday(fDate)
            setShow(false);
        } else {
            setShow(false);
        }
    };

    // Handle showing of the date modal
    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    }

    // Handle image selection
    const handleImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.2,
        });
        if (!result.canceled) {
            setImage([...image, result.assets[0].uri]);
        }
    };

    // Handle image uploading
    const uploadImage = async (uri, fileType) => {
        const response = await fetch(uri);
        const blob = await response.blob();

        const storageRef = ref(storage, "profile_pictures/" + userId + "/" + new Date().getTime());
        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on("state_changed", 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                console.log("Upload is " + progress + "% done")
                setProgress(progress.toFixed())
            },
            (error1) => {
                console.log(error1)
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                    console.log("File available at: ", downloadURL);
                })
            }
        )
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.container}>

                    <Text>Set up your profile here</Text>
                    <View>
                        <TextInput
                            autoFocus={false}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                        />
                    </View>
                    <View>
                        <TouchableOpacity onPress={() => showMode('date')}>
                            <Text>Pick your birthday</Text>
                        </TouchableOpacity>
                        {show && (
                            <DateTimePicker
                                id='datePicker'
                                value={date}
                                mode={mode}
                                display='default'
                                onChange={onChangeDate}
                                maximumDate={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())}
                            />
                        )}
                    </View>
                    <View>
                        <SelectDropdown
                            defaultButtonText='Gender'
                            data={genders}
                            onSelect={setGender}
                        />
                    </View>
                    <View>
                        {!!orientationError && <Text style={{ color: '#cf0202' }}>{orientationError}</Text>}
                    </View>
                    <View>
                        <>
                            <OptionButton id="male" text="Male" onPress={handleOrientation}/>
                            <OptionButton id="female" text="Female" onPress={handleOrientation}/>
                            <OptionButton id="nonBinary" text="Non-Binary" onPress={handleOrientation}/>
                        </>
                    </View>
                    <View>
                        <TouchableOpacity onPress={handleImage}>
                            <Text style={styles.textStyle}>Upload Image</Text>
                        </TouchableOpacity>
                        {image.map((uri, index) => (
                            <Image key={index} source={{ uri: uri }} style={{ width: 300, height: 400 }}/>
                        ))}
                    </View>
                    <View>
                        {!!error && <Text style={{ color: '#cf0202' }}>{error}</Text>}
                    </View>
                    <TouchableOpacity activeOpacity={0.69} style={styles.btnContainer} onPress={handleSubmit}>
                        <View>
                            <Text style={styles.textStyle}>Submit</Text>
                        </View>
                    </TouchableOpacity>
                <StatusBar style="auto" />

            </View>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
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
    }
});