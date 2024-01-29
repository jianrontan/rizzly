import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, TextInput, Image, Button, Dimensions } from 'react-native';
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

    //Type of diabetes 
    const [type, setType] = useState('');

    // Submit
    const [error, setError] = useState('');

    // Gender List
    const genders = ["Male", "Female", "Others"]

    //Type List
    const types = ["1", "2"]

    // SUBMIT //
    // ****SUBMIT**** user details and navigates user to the main App screen
    const handleSubmit = async () => {
        if (name !== null && name !== '' && gender && gender !== '' && type && type !== '') {
            try {
                const userId = auth.currentUser.uid;
                const userDocRef = doc(db, 'profiles', userId);

                await updateDoc(userDocRef, {
                    name: name,
                    gender: gender,
                    type: type,
                    complete: true,
                });
                navigation.navigate('App');
            } catch (e) {
                console.error("Error submitting: ", e);
                setError(e.message);
            }
        } else {
            setError('Please fill out all the fields.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                {/* Name */}
                <View>
                    <TextInput
                        autoFocus={false}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                    />
                </View>
                {/* Gender */}
                <View>
                    <SelectDropdown
                        defaultButtonText='Gender'
                        data={genders}
                        onSelect={setGender}
                    />
                </View>
                {/* Type */}
                <View>
                    <SelectDropdown
                        defaultButtonText='Type'
                        data={types}
                        onSelect={setType}
                    />
                </View>
            </View>
            {/* Submit */}
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 50 }}>
                {!!error && <Text style={{ color: '#cf0202' }}>{error}</Text>}
                <TouchableOpacity activeOpacity={0.69} onPress={handleSubmit} style={styles.btnContainer}>
                    <View>
                        <Text style={styles.textStyle}>Submit</Text>
                    </View>
                </TouchableOpacity>
            </View>
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