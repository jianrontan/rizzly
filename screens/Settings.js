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
import DeleteAccount from '../screens/DeleteAccount';
import PauseProfile from '../screens/PauseProfile';
import ChangeLocation from './ChangeLocation';
import { COLORS, FONT, SIZES } from '../constants';

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
	const preferredGender = () => {
		navigation.navigate('Orientation');
	}

    const ChangeLocation = () => {
        navigation.navigate('ChangeLocation')
    }

	const PauseProfile = () => {
		navigation.navigate('PauseProfile')
	}
	    
    const DeleteAccount = () => {
        navigation.navigate('DeleteAccount')
    }

    const Contact = () => {
        navigation.navigate('Contact')
    }
	return (
		<SafeAreaView style={{ flex: 1 }}>
			<ScrollView showsVerticalScrollIndicator={false}>

				<View style={{ flex: 1 }}>
					<TouchableOpacity onPress={preferredGender}>
						<View style={styles.settingView}>
							<Text style={styles.settingText}>Preferred Gender</Text>
						</View>
					</TouchableOpacity>
					<View style={styles.borderLine}></View>
				</View>

				<View style={{ flex: 1 }}>
					<TouchableOpacity>
						<View style={styles.settingView}>
							<Text style={styles.settingText}>Settings</Text>
						</View>
					</TouchableOpacity>
					<View style={styles.borderLine}></View>
				</View>

                <View style={{ flex: 1 }}>
                    <TouchableOpacity onPress={ChangeLocation}>
                    <View style={styles.settingView}>
                        <Text style={styles.settingText}>Change Location</Text>
                    </View>
                    </TouchableOpacity>
                    <View style={styles.borderLine}></View>
                </View>

				<View style={{ flex: 1 }}>
                    <TouchableOpacity onPress={PauseProfile}>
                    <View style={styles.settingView}>
                        <Text style={styles.settingText}>Pause Profile</Text>
                    </View>
                    </TouchableOpacity>
                    <View style={styles.borderLine}></View>
                </View>

                <View style={{ flex: 1 }}>
                    <TouchableOpacity onPress={DeleteAccount}>
                    <View style={styles.settingView}>
                        <Text style={styles.settingText}>Delete Account</Text>
                    </View>
                    </TouchableOpacity>
                    <View style={styles.borderLine}></View>
                </View>

                <View style={{ flex: 1 }}>
                    <TouchableOpacity onPress={Contact}>
                    <View style={styles.settingView}>
                        <Text style={styles.settingText}>Contact Us</Text>
                    </View>
                    </TouchableOpacity>
                    <View style={styles.borderLine}></View>
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
	settingView: {
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 20,
	},
	settingText: {
		fontFamily: FONT.medium,
		fontSize: SIZES.medium,
	},
	borderLine: {
		borderBottomColor: "black",
		borderBottomWidth: 1,
	},
});