import React, { useRef, useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Image, SafeAreaView, Dimensions, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase/firebase';
import { Icon } from 'react-native-elements';
import Spinner from 'react-native-loading-spinner-overlay';

import { FONT, COLORS, SIZES, icons } from '../constants';

const SelfieCapture = ({ navigation }) => {
	const [hasPermission, setHasPermission] = useState(null);
	const [type, setType] = useState(Camera.Constants.Type.front);
	const [image, setImage] = useState(null);
	const [images, setImages] = useState([]);
	const [capturedPhoto, setCapturedPhoto] = useState(null);
	const [retakes, setRetakes] = useState(0);
	const [isCapturing, setIsCapturing] = useState(false);
	const cameraRef = useRef(null);
	const [submitting, setSubmitting] = useState(false);
	const userId = auth && auth.currentUser ? auth.currentUser.uid : null

	useEffect(() => {
		(async () => {
			const { status } = await Camera.requestCameraPermissionsAsync();
			setHasPermission(status === 'granted');
		})();
	}, []);

	if (hasPermission === null) {
		return <View />;
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
	}

	const takePicture = async () => {
		setIsCapturing(true);
		if (cameraRef.current) {
			const options = { quality: 0.5, base64: true };
			const data = await cameraRef.current.takePictureAsync(options);
			setImage(data.uri);
			setImages([...images, data.uri]);
			setCapturedPhoto(data.uri);
			setIsCapturing(false);
		}
	};

	const sendPicture = async () => {
		setSubmitting(true);
		if (userId !== null && images.length > 0) {
			const response = await fetch(images[images.length - 1]);
			const blob = await response.blob();
			const storageRef = ref(storage, "selfies/" + userId + "/" + new Date().getTime());
			const uploadTask = uploadBytesResumable(storageRef, blob);

			uploadTask.on('state_changed',
				(snapshot) => {
				},
				(error) => {
					console.log("Error during upload", error)
				},
				async () => {

					const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

					const userDocRef = doc(db, 'profiles', userId);
					await setDoc(userDocRef, {
						selfieURLs: downloadURL
					}, { merge: true });

					await setDoc(userDocRef, {
						retakes: retakes
					}, { merge: true });

					await setDoc(userDocRef, {
						complete: true
					}, { merge: true });

					setImages(images.slice(0, -1));
					navigation.navigate('App');
				}
			);
		}
		setSubmitting(false);
	};

	const goBack = () => {
		setCapturedPhoto(null);
		setRetakes(retakes + 1);
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>

			<View style={styles.buttonsContainer}>
				<TouchableOpacity>
					<Text style={styles.heading}>
						This selfie will be your main profile picture{"\n"}Show your face to get matched faster!
					</Text>
				</TouchableOpacity>
			</View>

			{capturedPhoto ? (
				<View style={{ aspectRatio: 3 / 4 }}>
					<Image source={{ uri: capturedPhoto }} style={{ flex: 1 }} />
				</View>
			) : (
				<Camera style={{ aspectRatio: 3 / 4 }} type={type} ref={cameraRef}>
					<View
						style={{
							flex: 1,
							backgroundColor: 'transparent',
							flexDirection: 'row',
						}}>
					</View>
				</Camera>
			)}

			{capturedPhoto ? (
				<View style={{ justifyContent: "space-between", flexDirection: 'row', alignContent: 'center' }}>
					<TouchableOpacity
						style={{
							padding: 20,
						}}
						onPress={goBack}>
						<Icon name="arrow-back" color="gray" size={30} />
					</TouchableOpacity>
					<TouchableOpacity
						style={{
							padding: 20,
						}}
						onPress={sendPicture}>
						<Icon name="send" color="gray" size={25} />
					</TouchableOpacity>
				</View>
			) : (
				<TouchableOpacity
					style={{
						position: 'absolute',
						bottom: 20,
						left: '40%',
						borderWidth: 4,
						borderColor: 'rgba(0,0,0,0.2)',
						alignItems: 'center',
						justifyContent: 'center',
						width: 75,
						height: 75,
						backgroundColor: 'gray',
						borderRadius: 100,
					}}
					onPress={takePicture} disabled={isCapturing}>
				</TouchableOpacity>
			)}

			<Spinner
				visible={submitting}
				animation='fade'
				overlayColor="rgba(0, 0, 0, 0.25)"
				color="white"
				indicatorStyle={{

				}}
				textContent='Saving...'
				textStyle={{
					fontFamily: FONT.bold,
					fontSize: SIZES.medium,
					fontWeight: 'normal',
					color: 'white',
				}}
			/>

		</SafeAreaView>
	);
}
export default SelfieCapture;

const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderColor: 'grey',
		padding: 10,
	},
	wrapper: {
		flex: 1,
	},
	item: {
		width: width / 2 - 50,
		aspectRatio: 3 / 4,
	},
	image: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
		borderRadius: 5,
		borderWidth: 1,
		borderColor: 'gray'
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
		fontFamily: FONT.medium,
		fontSize: SIZES.small,
		color: 'gray'
	},
	headingBold: {
		fontFamily: FONT.bold,
		fontSize: SIZES.small,
		color: 'gray'
	},
	btnContainer: {
		width: 200,
		height: 60,
		backgroundColor: 'gray',
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
	dropdownTextStyle: {
		fontFamily: FONT.medium,
		fontSize: SIZES.smallmedium,
		color: 'black',
	},
	dropdownInputStyle: {
		width: width - 20,
		alignSelf: 'center',
		borderWidth: 1,
		borderRadius: 5,
	},
	responseTextStyle: {
		fontFamily: FONT.medium,
		fontSize: SIZES.mediumlarge,
		paddingHorizontal: 10
	},
	buttonsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingTop: 10,
		paddingHorizontal: 10,
		paddingBottom: 9
	},
	borderLine: {
		width: width - 10,
		alignSelf: 'center',
		borderBottomColor: "gray",
		borderBottomWidth: 1,
	},
});