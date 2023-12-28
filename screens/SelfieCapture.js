import React, { useRef, useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'expo-camera';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase/firebase'; // Assuming you have a firebase.js file exporting db and auth
import { Icon } from 'react-native-elements';

const SelfieCapture = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.front);
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [retakes, setRetakes] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef(null);
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
 if (userId !== null && images.length > 0) {
 const response = await fetch(images[images.length - 1]);
 const blob = await response.blob();
 const storageRef = ref(storage, "selfies/" + userId + "/" + new Date().getTime());
 const uploadTask = uploadBytesResumable(storageRef, blob);
 
 uploadTask.on('state_changed',
 (snapshot) => {
 // Handle progress updates here...
 },
 (error) => {
 console.log("Error during upload", error)
 // Handle errors here...
 },
 async () => {
 // Get the download URL once the upload is complete
 const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
 
 // Save the download URL under the `selfieURLs` field in Firestore
 const userDocRef = doc(db, 'profiles', userId);
 await setDoc(userDocRef, {
 selfieURLs: downloadURL
 }, { merge: true });

 // Save the number of retakes under the `retakes` field in Firestore
 await setDoc(userDocRef, {
 retakes: retakes
 }, { merge: true });
 
 // Remove the sent image from the local array
 setImages(images.slice(0, -1));
 // Navigate to 'App' screen
 navigation.navigate('App');
 }
 );
 }
 };

 const goBack = () => {
 setCapturedPhoto(null);
 setRetakes(retakes + 1);
 };

 return (
 <View style={{ flex: 1 }}>
 {capturedPhoto ? (
 <View style={{ flex: 1 }}>
   <Image source={{ uri: capturedPhoto }} style={{ flex: 1 }} />
   <TouchableOpacity 
      style={{
      position: 'absolute',
      top: 20, 
      left: 20, 
      alignItems: 'center',
      justifyContent: 'center',
      }}
      onPress={goBack}>
      <Icon name="arrow-back" color="#ffffff" size={25} />
   </TouchableOpacity>
   <TouchableOpacity 
      style={{
      position: 'absolute',
      bottom: 50, 
      right: 30, 
      alignItems: 'center',
      justifyContent: 'center',
      }}
      onPress={sendPicture}>
      <Icon name="send" color="#ffffff" size={25} />
    </TouchableOpacity>
  </View>
 ) : (
  <Camera style={{ flex: 1 }} type={type} ref={cameraRef}>
    <View
      style={{
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
      }}>
      <TouchableOpacity 
        style={{
          position: 'absolute',
          bottom: 20, 
          left: '40%' , 
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.2)',
          alignItems: 'center',
          justifyContent: 'center',
          width: 80,
          height: 80,
          backgroundColor: '#fff',
          borderRadius: 100,
         }}         
         onPress={takePicture} disabled={isCapturing}>
      </TouchableOpacity>
    </View>
  </Camera>
 )}
 </View>
 );
}
export default SelfieCapture;