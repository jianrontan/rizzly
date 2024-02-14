import { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, BackHandler, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Switch } from 'react-native-switch';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getDoc, updateDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';

import OptionButton from '../components/touchableHighlight/touchableHightlight';
import SettingsComponent from '../components/settings/SettingsComponent';
import DeleteAccount from '../screens/DeleteAccount';
import PauseProfile from '../screens/PauseProfile';
import { COLORS, FONT, SIZES } from '../constants';

const cardWidth = Dimensions.get('window').width;
const cardHeight = Dimensions.get('window').height;

export default function SettingsScreen({ navigation }) {

	// Navigation
	useEffect(() => {
		const backAction = () => {
			navigation.navigate('App');
			return true;
		};

		const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

		return () => backHandler.remove();
	}, [navigation]);


	// Authentication
	const auth = getAuth();
	const userId = auth.currentUser.uid;

	// Loading
	const [isLoading, setIsLoading] = useState(true);

	// Get user's data
	const getFirestoreData = () => {
		const docRef = doc(db, 'profiles', userId);
		const unsubscribe = onSnapshot(docRef, (docSnap) => {
			if (docSnap.exists()) {
				const holdData = docSnap.data();
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

	// Preferred Gender
	const PauseProfile = () => {
		navigation.navigate('PauseProfile')
	}

	const DeleteAccount = () => {
		navigation.navigate('DeleteAccount')
	}

	const Contact = () => {
		navigation.navigate('Contact')
	}

	const BlockList = () => {
		navigation.navigate('BlockList')
	}

	const Units = () => {
		navigation.navigate('Units')
	}

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={{ flex: 1 }}>
					<TouchableOpacity onPress={Units}>
						<View style={styles.settingView}>
							<Text style={styles.settingText}>Units / Measurement</Text>
						</View>
					</TouchableOpacity>
					<View style={styles.fullBorderLine}></View>
				</View>

				<View style={{ flex: 1 }}>
					<TouchableOpacity onPress={PauseProfile}>
						<View style={styles.settingView}>
							<Text style={styles.settingText}>Pause Profile</Text>
						</View>
					</TouchableOpacity>
					<View style={styles.fullBorderLine}></View>
				</View>

				<View style={{ flex: 1 }}>
					<TouchableOpacity onPress={BlockList}>
						<View style={styles.settingView}>
							<Text style={styles.settingText}>Blocked List</Text>
						</View>
					</TouchableOpacity>
					<View style={styles.fullBorderLine}></View>
				</View>

				<View style={{ flex: 1 }}>
					<TouchableOpacity onPress={DeleteAccount}>
						<View style={styles.settingView}>
							<Text style={styles.settingText}>Delete Account</Text>
						</View>
					</TouchableOpacity>
					<View style={styles.fullBorderLine}></View>
				</View>

				<View style={{ flex: 1 }}>
					<TouchableOpacity onPress={Contact}>
						<View style={styles.settingView}>
							<Text style={styles.settingText}>Contact Us</Text>
						</View>
					</TouchableOpacity>
					<View style={styles.fullBorderLine}></View>
				</View>

			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#6e4639', // Changed background color to brown
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
	settingView: {
		paddingTop: 30,
		paddingBottom: 30,
	},
	settingText: {
		fontFamily: FONT.xLarge,
		fontSize: SIZES.medium,
		color: 'white', // Changed text color to white
		left: 20,
	},
	fullBorderLine: {
		borderBottomColor: "white",
		borderBottomWidth: 2, // Thickness of the border line
		borderStyle: 'solid',
		width: cardWidth,
		alignSelf: 'flex-start', // Align the border lines to the left
	},
});