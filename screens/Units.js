import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUnits } from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';

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
                    setIsMiles(!preferences.isMetric);
                }
            } catch (error) {
                console.error('Error fetching unit preferences:', error);
            }
        };

        fetchUnitPreferences();
    }, [dispatch]);

    const toggleUnits = (unit) => {
        if (unit === 'metric') {
            setIsMetric(!isMetric);
        } else {
            setIsMiles(!isMiles);
        }
        dispatch(setUnits({ isMetric: unit === 'metric' ? !isMetric : isMetric, isMiles: unit === 'miles' ? !isMiles : isMiles }));
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
                    onValueChange={() => toggleUnits('metric')}
                    value={isMetric}
                />
                <Text style={styles.value}>{isMetric ? "cm" : "feet"}</Text>
            </View>
            <View style={styles.switchContainer}>
                <Text style={styles.label}>Distance:</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isMiles ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => toggleUnits('miles')}
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
        marginVertical: 5,
    },
    label: {
        marginRight: 8,
    },
    value: {
        marginLeft: 8,
    },
});

export default Units;
