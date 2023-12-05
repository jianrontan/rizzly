import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Text, TouchableOpacity, TextInput, Image, Dimensions, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '../firebase/firebase';
import { uploadBytesResumable, ref, getDownloadURL } from 'firebase/storage';

const EditProfileScreen = ({ navigation }) => {
  const auth = getAuth();
  const userId = auth.currentUser.uid;

  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [orientation, setOrientation] = useState({
    male: false,
    female: false,
    nonBinary: false,
  });
  const [image, setImage] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fetch user profile data and set state
    const fetchUserProfile = async () => {
      try {
        const userDocRef = doc(db, 'profiles', userId);
        const userDocSnapshot = await getDoc(userDocRef);
        const userData = userDocSnapshot.data();

        if (userData) {
          setName(userData.name || '');
          setBirthday(userData.birthday || '');
          setGender(userData.gender || '');
          setOrientation(userData.orientation || { male: false, female: false, nonBinary: false });
          // Assuming you have an array of imageURLs in the userData
          setImage(userData.imageURLs || []);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleOrientation = (id, isSelected) => {
    setOrientation((prevState) => {
      const newOrientation = { ...prevState, [id]: isSelected };
      return newOrientation;
    });
  };

  // Other image-related functions can be added similar to ProfileScreen

  const handleSubmit = async () => {
    try {
      const userDocRef = doc(db, 'profiles', userId);

      const sortedImages = [...image].sort((a, b) => a.order - b.order);
      const imageURLs = [];

      for (let img of sortedImages) {
        const url = await uploadImage(img.uri, 'image');
        imageURLs.push(url);
      }

      await updateDoc(userDocRef, {
        name: name,
        birthday: birthday,
        gender: gender,
        orientation: orientation,
        imageURLs: imageURLs,
        complete: true,
      });

      navigation.goBack(); // or navigate to another screen
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Render UI components for EditProfileScreen similar to ProfileScreen */}
      {/* ... */}
      {/* Add a "Save" button to trigger the handleSubmit function */}
      <TouchableOpacity onPress={handleSubmit} style={styles.btnContainer}>
        <View>
          <Text style={styles.textStyle}>Save</Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Your existing styles
});

export default EditProfileScreen;
