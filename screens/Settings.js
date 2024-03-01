import { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, BackHandler, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';

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

				<TouchableOpacity onPress={Units}>
					<View style={styles.tabView}>
						<Text style={styles.tabText}>Units / Measurement</Text>
					</View>
				</TouchableOpacity>
				<View style={styles.borderLine}></View>

				<TouchableOpacity onPress={PauseProfile}>
					<View style={styles.tabView}>
						<Text style={styles.tabText}>Pause Profile</Text>
					</View>
				</TouchableOpacity>
				<View style={styles.borderLine}></View>

				<TouchableOpacity onPress={BlockList}>
					<View style={styles.tabView}>
						<Text style={styles.tabText}>Blocked List</Text>
					</View>
				</TouchableOpacity>
				<View style={styles.borderLine}></View>

				<TouchableOpacity onPress={DeleteAccount}>
					<View style={styles.tabView}>
						<Text style={styles.tabText}>Delete Account</Text>
					</View>
				</TouchableOpacity>
				<View style={styles.borderLine}></View>

				<TouchableOpacity onPress={Contact}>
					<View style={styles.tabView}>
						<Text style={styles.tabText}>Contact Us</Text>
					</View>
				</TouchableOpacity>
				<View style={styles.borderLine}></View>

			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#6e4639',
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
		color: 'white',
		left: 20,
	},
	fullBorderLine: {
		borderBottomColor: "white",
		borderBottomWidth: 2, 
		borderStyle: 'solid',
		width: cardWidth,
		alignSelf: 'flex-start', // Align the border lines to the left
	},
	borderLine: {
		borderBottomColor: "#805c5e",
		borderBottomWidth: 1,
	},
	tabView: {
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 20,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	tabText: {
		fontFamily: FONT.medium,
		fontSize: SIZES.medium,
		color: "white"
	},
	tabInfoText: {
		fontFamily: FONT.regular,
		fontSize: SIZES.small,
		color: 'white'
	}
});