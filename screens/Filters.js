import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, Text, Image, Modal, Button, StyleSheet, SafeAreaView, TouchableOpacity, useWindowDimensions, FlatList, Dimensions, ActivityIndicator, StatusBar } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { collection, getDocs, updateDoc, arrayUnion, doc, getDoc, arrayRemove, query, where, startAfter, onSnapshot, orderBy, setDoc, limit } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { db, auth } from '../firebase/firebase';

import { FONT, COLORS, SIZES, icons } from '../constants';

const FiltersScreen = ({ navigation }) => {
    const [isMetric, setIsMetric] = useState(false);
    const [isMiles, setIsMiles] = useState(false);
    const [minHeight, setMinHeight] = useState(100);
    const [maxHeight, setMaxHeight] = useState(200);
    const [minAge, setMinAge] = useState(18);
    const [maxAge, setMaxAge] = useState(80);
    const [minDistance, setMinDistance] = useState(1);
    const [maxDistance, setMaxDistance] = useState(10);
    const [minHeightIntermediate, setMinHeightIntermediate] = useState(100);
    const [maxHeightIntermediate, setMaxHeightIntermediate] = useState(250);
    const [minAgeIntermediate, setMinAgeIntermediate] = useState(18);
    const [maxAgeIntermediate, setMaxAgeIntermediate] = useState(100);
    const [minDistanceIntermediate, setMinDistanceIntermediate] = useState(1);
    const [maxDistanceIntermediate, setMaxDistanceIntermediate] = useState(50);

    const saveFilters = async (uid, minAge, maxAge, minDistance, maxDistance, minHeight, maxHeight) => {
        try {
            // Get a reference to the 'filters' collection and the specific document using the user's UID
            const filterDocRef = doc(db, 'filters', uid);

            // Set the filter data for the document
            await setDoc(filterDocRef, {
                minAge: minAge,
                maxAge: maxAge,
                minDistance: minDistance,
                maxDistance: maxDistance,
                minHeight: minHeight,
                maxHeight: maxHeight
            });

            console.log(`Filter settings saved for user ${uid}.`);
            // Close drawer and navigate back to home screen
            navigation.closeDrawer();
            navigation.navigate('Home'); // Assuming the screen name is 'Home'
        } catch (error) {
            console.error(`Failed to save filter settings for user ${uid}:`, error);
        }
    };

    const convertHeight = (cm) => {
        const inches = cm / 2.54;
        const feet = Math.floor(inches / 12);
        const remainingInches = Math.round(inches % 12);
        return `${feet}' ${remainingInches}"`;
    };

    const convertDistance = (km) => {
        const distanceInKm = Number(km);
        if (isNaN(distanceInKm)) {
            console.error('Invalid distance value:', km);
            return 'NaN'; // or handle the error in another appropriate way
        }
        const miles = distanceInKm * 0.621371;
        return miles.toFixed(2);
    };

    useFocusEffect(
        React.useCallback(() => {
            setMinHeightIntermediate(minHeight);
            setMaxHeightIntermediate(maxHeight);
            setMinAgeIntermediate(minAge);
            setMaxAgeIntermediate(maxAge);
            setMinDistanceIntermediate(minDistance);
            setMaxDistanceIntermediate(maxDistance);
        }, [minHeight, maxHeight, minAge, maxAge, minDistance, maxDistance])
    );

    return (
        <View style={styles.filterModalContainer}>
            <View style={styles.modalContent}>
                <Text style={{ fontFamily: FONT.regular, padding: 5 }}>Height Range:</Text>
                <MultiSlider
                    values={[minHeightIntermediate, maxHeightIntermediate]}
                    sliderLength={250}
                    min={100}
                    max={250}
                    step={1}
                    minMarkerOverlapDistance={50}
                    allowOverlap={false}
                    onValuesChangeFinish={(values) => {
                        setMinHeightIntermediate(values[0]);
                        setMaxHeightIntermediate(values[1]);
                    }}
                    markerStyle={{
                        backgroundColor: 'black'
                    }}
                    selectedStyle={{
                        backgroundColor: 'black'
                    }}
                    enableLabel
                    customLabel={props => {
                        const displayValue1 = props.oneMarkerValue;
                        const displayValue2 = props.twoMarkerValue;
                        return (
                            <View style={{ alignSelf: 'center' }}>
                                <Text style={{ fontFamily: FONT.regular }}>{isMetric ? `${convertHeight(displayValue1)} - ${convertHeight(displayValue2)}` : `${displayValue1} cm - ${displayValue2} cm`}</Text>
                            </View>
                        )
                    }}
                />
                <Text style={{ fontFamily: FONT.regular, padding: 5 }}>Age Range:</Text>
                <MultiSlider
                    values={[minAgeIntermediate, maxAgeIntermediate]}
                    sliderLength={250}
                    min={18}
                    max={100}
                    step={1}
                    allowOverlap={false}
                    onValuesChangeFinish={(values) => {
                        setMinAgeIntermediate(values[0]);
                        setMaxAgeIntermediate(values[1]);
                    }}
                    markerStyle={{
                        backgroundColor: 'black'
                    }}
                    selectedStyle={{
                        backgroundColor: 'black'
                    }}
                    enableLabel
                    customLabel={props => {
                        const displayValue1 = props.oneMarkerValue;
                        const displayValue2 = props.twoMarkerValue;
                        return (
                            <View style={{ alignSelf: 'center' }}>
                                <Text style={{ fontFamily: FONT.regular }}>{displayValue1} - {displayValue2}</Text>
                            </View>
                        )
                    }}
                />
                <Text style={{ fontFamily: FONT.regular, padding: 5 }}>Distance Range:</Text>
                <MultiSlider
                    values={[minDistanceIntermediate, maxDistanceIntermediate]}
                    sliderLength={250}
                    min={1}
                    max={50}
                    step={1}
                    allowOverlap={false}
                    onValuesChangeFinish={(values) => {
                        setMinDistanceIntermediate(values[0]);
                        setMaxDistanceIntermediate(values[1]);
                    }}
                    markerStyle={{
                        backgroundColor: 'black'
                    }}
                    selectedStyle={{
                        backgroundColor: 'black'
                    }}
                    enableLabel
                    customLabel={props => {
                        const displayValue1 = props.oneMarkerValue;
                        const displayValue2 = props.twoMarkerValue;
                        return (
                            <View style={{ alignSelf: 'center' }}>
                                <Text style={{ fontFamily: FONT.regular }}>{isMiles ? `${convertDistance(displayValue1)} mi - ${convertDistance(displayValue2)} mi` : `${displayValue1} km - ${displayValue2} km`}</Text>
                            </View>
                        )
                    }}
                />
                <View style={{ padding: 10 }}>
                    <TouchableOpacity
                        style={{
                            backgroundColor: 'black',
                            padding: 10,
                            borderRadius: 4
                        }}
                        onPress={() => {
                            setMinAge(minAgeIntermediate);
                            setMaxAge(maxAgeIntermediate);
                            setMinHeight(minHeightIntermediate);
                            setMaxHeight(maxHeightIntermediate);
                            setMinDistance(minDistanceIntermediate);
                            setMaxDistance(maxDistanceIntermediate);
                            saveFilters(auth.currentUser.uid, minAgeIntermediate, maxAgeIntermediate, minDistanceIntermediate, maxDistanceIntermediate, minHeightIntermediate, maxHeightIntermediate);
                        }}
                    >
                        <Text style={styles.buttonTitle}>Apply Filter</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    likeButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'green',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        color: 'white',
    },
    dislikeButton: {
        position: 'absolute',
        bottom: 20,
        right: 280,
        backgroundColor: 'red',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        color: 'white',
    },
    cardContainer: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor: 'white', // Set the background color of the cards
    },
    image: {
        flex: 1,
        resizeMode: 'contain',
    },
    userInfoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 10,
    },
    userName: {
        color: 'black',
        fontSize: 18,
        fontFamily: FONT.bold
    },
    userDetails: {
        color: 'black',
        fontSize: 16,
        fontFamily: FONT.medium
    },
    userAge: {
        color: 'white',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    filterModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: 'black',
        zIndex: 3, // Ensure filter modal container appears above everything
    },
    filterButton: {
        position: 'absolute',
        top: 10, // Adjust as needed
        right: 10, // Adjust as needed
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 20,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1, // Ensure filter button appears above the images
    },
    buttonTitle: {
        fontFamily: FONT.medium,
        color: 'white'
    },
    modalButton: {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 4
    },

});

export default FiltersScreen;