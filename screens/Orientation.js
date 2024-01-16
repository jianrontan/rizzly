import { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, BackHandler } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Switch } from 'react-native-switch';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getDoc, updateDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';

import OptionButton from '../components/touchableHighlight/touchableHightlight';
import SettingsComponent from '../components/settings/SettingsComponent';
import { COLORS, FONT, SIZES } from '../constants';

export default function Orientation() {

	// MAKE IT SO THAT DON'T NEED A SUBMIT BUTTON TO CHANGE THE ORIENTATION
	// Navigation
	const navigation = useNavigation();

	useEffect(() => {
		const backAction = () => {
			navigation.navigate('Edit Settings');
			return true;
		};

		const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

		return () => backHandler.remove();
	}, [navigation]);

	// Authentication
	const auth = getAuth();
	const userId = auth.currentUser.uid;

	// Orientation
	const [orientation, setOrientation] = useState(null);
	const [orientationError, setOrientationError] = useState('');
	const defaultOrientation = { male: false, female: false, nonBinary: false };
	const actualOrientation = orientation || defaultOrientation;

	// Loading
	const [isLoading, setIsLoading] = useState(true);

	// Get user's data
	const getFirestoreData = () => {
		const docRef = doc(db, 'profiles', userId);
		const unsubscribe = onSnapshot(docRef, (docSnap) => {
			if (docSnap.exists()) {
				const holdData = docSnap.data();
				setOrientation(holdData.orientation);
				setIsLoading(false);
			} else {
				console.log('No such document!');
				setIsLoading(false);
			}
		});

		// Clean up the listener when the component unmounts
		return () => unsubscribe();
	};

	useFocusEffect(
		useCallback(() => {
			setIsLoading(true);
			getFirestoreData();
		}, [])
	);

	// ORIENTATION
	const handleOrientation = (id, isSelected) => {
		setOrientation(prevState => {
			const newOrientation = { ...prevState, [id]: isSelected };
			if (Object.values(newOrientation).every(option => !option)) {
				setOrientationError('Please select at least one orientation.');
			} else {
				setOrientationError('');
			}
			const docRef = doc(db, 'profiles', userId);
			updateDoc(docRef, {
				orientation: newOrientation
			}).then(() => {
				console.log("Orientation successfully updated!");
			}).catch((error) => {
				console.error("Error updating Orientation: ", error);
			});
			return newOrientation;
		});
	};

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<ScrollView showsVerticalScrollIndicator={false}>

				<View style={{ flex: 1, padding: SIZES.medium }}>
					{/* Orientation */}
					<View>
						<Text>Preferred Genders:</Text>
					</View>
					<View>
						<>
							<OptionButton id="male" text="Male" onPress={handleOrientation} selected={actualOrientation.male} />
							<OptionButton id="female" text="Female" onPress={handleOrientation} selected={actualOrientation.female} />
							<OptionButton id="nonBinary" text="Non-Binary" onPress={handleOrientation} selected={actualOrientation.nonBinary} />
						</>
					</View>
					<View>
						{!!orientationError && <Text style={{ color: '#cf0202' }}>{orientationError}</Text>}
					</View>
				</View>

			</ScrollView>
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