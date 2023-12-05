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

export default function EditProfileScreen() {
    const [userData, setUserData] = useState(null);
    
    // Authentication
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    // Screen
    const { width } = Dimensions.get('window');

    // Orientation
    const [orientation, setOrientation] = useState(null);
    const [orientationError, setOrientationError] = useState('');
    const defaultOrientation = { male: false, female: false, nonBinary: false };
    const actualOrientation = orientation || defaultOrientation;

    // Images
    const [image, setImage] = useState([]);
    const [progress, setProgress] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    // Update
    const [error, setError] = useState('');

    // Get user's data
    useEffect(() => {
        const getFirestoreData = async () => {
            const docRef = doc(db, 'profiles', userId);
            const docSnap = await getDoc(docRef);
      
            if (docSnap.exists()) {
                const holdData = docSnap.data();
                setUserData(holdData);
                setOrientation(holdData.orientation);
                setImage(holdData.imageURLs)
            } else {
                console.log('No such document!');
            }
        };
      
        getFirestoreData();
    }, []);

    console.log(orientation);

    // ORIENTATION
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

    // IMAGES
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
                            <Image key={index} source={{ uri: item }} style={{ width: 150, height: 200 }}/>
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
                                    <OptionButton id="male" text="Male" onPress={handleOrientation} selected={actualOrientation.male}/>
                                    <OptionButton id="female" text="Female" onPress={handleOrientation} selected={actualOrientation.female}/>
                                    <OptionButton id="nonBinary" text="Non-Binary" onPress={handleOrientation} selected={actualOrientation.nonBinary}/>
                                </>
                            </View>
                        </View>
                    </>
                }
                ListFooterComponent={
                    <>

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