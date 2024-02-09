import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUnits } from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/firebase';

const auth = getAuth();

const Units = () => {
    const dispatch = useDispatch();
    const isMetricRedux = useSelector(state => state.editProfileReducer.isMetric);
    const isMilesRedux = useSelector(state => state.editProfileReducer.isMiles);

    const [isMetric, setIsMetric] = useState(isMetricRedux);
    const [isMiles, setIsMiles] = useState(isMilesRedux);

    useEffect(() => {
        const fetchUnitPreferences = async () => {
            try {
                const unitPreference = await AsyncStorage.getItem('unitPreference');
                if (unitPreference !== null) {
                    const preferences = JSON.parse(unitPreference);
                    dispatch(setUnits(preferences.isMetric ? 'metric' : 'miles'));
                    setIsMetric(preferences.isMetric);
                    setIsMiles(preferences.isMiles); // Initialize isMiles state with stored value
                }
            } catch (error) {
                console.error('Error fetching unit preferences:', error);
            }
        };

        fetchUnitPreferences();
    }, [dispatch]);

    const saveUnits = async (uid, isMetric, isMiles) => {
        try {
            const unitDocRef = doc(db, 'units', uid);

            await setDoc(unitDocRef, {
                isMiles: isMiles,
                isMetric: isMetric
            });

            console.log(`Units saved for user ${uid}.`);
        } catch (error) {
            console.error(`Failed to save units for user ${uid}:`, error);
        }
    };

    const toggleMetric = () => {
        setIsMetric(previousState => !previousState);
        saveUnits(auth.currentUser.uid, !isMetric, isMiles); // Save the updated state
        dispatch(setUnits({ isMetric: !isMetric, isMiles }));
    };

    const toggleMiles = () => {
        setIsMiles(previousState => !previousState);
        saveUnits(auth.currentUser.uid, isMetric, !isMiles); // Save the updated state
        dispatch(setUnits({ isMetric, isMiles: !isMiles }));
    };

    useEffect(() => {
        AsyncStorage.setItem('unitPreference', JSON.stringify({ isMetric, isMiles }));
    }, [isMetric, isMiles]);

    return (
        <View style={styles.container}>
            <View style={styles.switchContainer}>
                <Text style={styles.label}>Height:</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isMetric ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleMetric}
                    value={isMetric}
                />
                <Text style={styles.value}>{isMetric ? "feet" : "cm"}</Text>
            </View>
            <View style={[styles.switchContainer, { marginTop: 20 }]}>
                <Text style={styles.label}>Distance:</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isMiles ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleMiles}
                    value={isMiles}
                />
                <Text style={styles.value}>{isMiles ? "miles" : "km"}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        alignItems: 'center',
        marginVertical: 20,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15, // Increased margin
    },
    label: {
        marginRight: 8,
    },
    value: {
        marginLeft: 8,
    },
});

export default Units;
