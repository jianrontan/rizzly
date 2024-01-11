import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Animated, View, ScrollView, FlatList, PanResponder, SafeAreaView, StyleSheet, Text, TouchableOpacity, Alert, TextInput, Image, Button, Dimensions, BackHandler, ActivityIndicator } from 'react-native';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { add, eq, set, useCode } from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { getDoc, updateDoc, doc, setDoc, addDoc, collection, onSnapshot, arrayUnion, DocumentSnapshot } from 'firebase/firestore';
import { db, storage } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { uploadBytesResumable, ref, getDownloadURL, deleteObject } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import Spinner from 'react-native-loading-spinner-overlay';

import { COLORS, SIZES, FONT, icons } from '../constants';

const ViewProfile = ({ imageUrl, onDrop }) => {

    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Screen
    const { width } = Dimensions.get('window');

    // Images
    const [image, setImage] = useState([]);
    const [startImage, setStartImage] = useState([]);
    const [removedImage, setRemovedImage] = useState([]);

    // Dragging
    const position = new Animated.ValueXY();
    const [draggingIdx, setDraggingIdx] = useState(null);

    // Firestore data
    const getFirestoreData = () => {
        const docRef = doc(db, 'profiles', userId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const holdData = docSnap.data();
                if (holdData.imageURLs) {
                    const initialImages = holdData.imageURLs.map((url, index) => ({
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
            } else {
                console.log('No such document!');
            }
        });

        return () => unsubscribe();
    }

    useFocusEffect(
        useCallback(() => {
            getFirestoreData();
        }, [])
    );

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            const { pageY, locationX } = e.nativeEvent;
            const row = Math.floor(pageY / (100 + 10)); // height of image + margin
            const col = Math.floor(locationX / (100 + 10)); // width of image + margin
            const index = row * 3 + col;
            setDraggingIdx(index);
            return true; // Tell the responder to start tracking the touch
        },
        onPanResponderMove: Animated.event(
            [
                null,
                { dx: position.x, dy: position.y },
            ],
            { useNativeDriver: false } // Disable native driver for direct manipulation
        ),
        onPanResponderRelease: (e, gestureState) => {
            const dropRow = Math.floor(gestureState.moveY / (100 + 10)); // height of image + margin
            const dropCol = Math.floor(gestureState.moveX / (100 + 10)); // width of image + margin
            const dropIndex = dropRow * 3 + dropCol;

            if (dropIndex < image.length) {
                const newData = [...image];
                const dragItem = newData[draggingIdx];
                newData[draggingIdx] = newData[dropIndex];
                newData[dropIndex] = dragItem;
                setImage(newData);
            }

            // Reset dragging state and position
            setDraggingIdx(null);
            Animated.spring(position, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false
            }).start();
        },
    });

    const renderItem = ({ item, index }) => {
        const panHandlers = draggingIdx === index ? panResponder.panHandlers : {};
        const style = draggingIdx === index ? {
            zIndex: 2,
            transform: [{ translateX: position.x }, { translateY: position.y }]
        } : { zIndex: 0 };

        return (
            <Animated.View
                {...panHandlers}
                style={[styles.imageContainer, style]}
            >
                <Image
                    source={{ uri: item.uri }}
                    style={styles.image}
                />
            </Animated.View>
        );
    };

    return (
        <FlatList
            data={image}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            extraData={draggingIdx}
            scrollEnabled={draggingIdx === null}
        />
    );
};

const styles = StyleSheet.create({
    imageContainer: {
        width: 100,
        height: 100,
        margin: 10,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
});

export default ViewProfile;