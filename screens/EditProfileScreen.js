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

export default function EditProfileScreen({ navigation }) {

    // FIX LOGOUT ERROR

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Navigate
    const navigateDetails = () => {
        navigation.navigate('My Name');
    }
    const navigatePhotos = () => {
        navigation.navigate('Edit Photos');
    }
    const navigateAbout = () => {
        navigation.navigate('About Me');
    }
    const navigateHeight = () => {
        navigation.navigate('Height');
    }
    const navigateReligion = () => {
        navigation.navigate('Religion');
    }
    const navigateEthnicity = () => {
        navigation.navigate('Ethnicity');
    }

    return (
        <SafeAreaView>
            <ScrollView style={styles.container}>

                <View style={styles.tabView}>
                    <TouchableOpacity onPress={navigateDetails}>
                        <Text style={styles.tabText}>My Name</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.borderLine}></View>

                <View style={styles.tabView}>
                    <TouchableOpacity onPress={navigatePhotos}>
                        <Text style={styles.tabText}>My Photos</Text>
                    </TouchableOpacity>
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
                </View>

                <View style={styles.borderLine}></View>

                <View style={styles.tabView}>
                    <TouchableOpacity onPress={navigateReligion}>
                        <Text style={styles.tabText}>Religion</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.borderLine}></View>

                <View style={styles.tabView}>
                    <TouchableOpacity onPress={navigateEthnicity}>
                        <Text style={styles.tabText}>Ethnicity</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.borderLine}></View>

                <View style={styles.tabView}>
                    <TouchableOpacity>
                        <Text style={styles.tabText}>Children</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.borderLine}></View>

                <View style={styles.tabView}>
                    <TouchableOpacity>
                        <Text style={styles.tabText}>Education</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.borderLine}></View>

                <View style={styles.tabView}>
                    <TouchableOpacity>
                        <Text style={styles.tabText}>Vices</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.borderLine}></View>

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
    },
    tabText: {
        fontFamily: FONT.medium,
        fontSize: SIZES.medium,
    },
});