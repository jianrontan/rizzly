import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/firebase';
import * as Location from 'expo-location';
import { onSnapshot } from 'firebase/firestore';

const ChangeLocation = ({ navigation }) => {
  const [initialLocation, setInitialLocation] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newPlace, setNewPlace] = useState('');
  const [userId, setUserId] = useState('');
  const [userDocRef, setUserDocRef] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const docRef = doc(db, 'profiles', userId);
  
    setUserDocRef(docRef);
  
    // Use .onSnapshot to listen for changes in real-time
    const unsubscribe = onSnapshot(docRef, (documentSnapshot) => {
      if (documentSnapshot.exists()) {
        setInitialLocation(documentSnapshot.data().location);
      } else {
        console.log("No such document!");
      }
    }, (error) => {
      console.log("Error getting document:", error);
    });
  
    // Cleanup by unsubscribing when the component unmounts
    return () => unsubscribe();
  }, []); // Make sure to include an empty dependency array here
  

  async function getPlaceFromCoordinates(lat, lng) {
    const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=87fdfbc20b6c42219965405e23651000&pretty=1`);
    const data = await response.json();
    if (data.results.length > 0) {
      const components = data.results[0].components;
      const suburb = components.suburb || '';
      const country = components.country || '';
      return `${suburb}, ${country}`;
    } else {
      throw new Error('Failed to get place from coordinates');
    }
  }

  const makeNewLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }
  
    let locationTask;
  
    try {
      locationTask = Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        async (location) => {
          try {
            // Get place from coordinates
            const place = await getPlaceFromCoordinates(location.coords.latitude, location.coords.longitude);
            console.log(place);
            setNewPlace(place); // Update place state variable
  
            // Update newLocation with the obtained place
            setNewLocation(place);
          } catch (error) {
            console.warn(error);
          }
        }
      );
  
      // Ensure that locationTask has the remove method before calling it
      if (locationTask && locationTask.remove) {
        // Stop tracking location after the first update
        setTimeout(() => {
          locationTask.remove();
        }, 5000); // Stop after 5 seconds (adjust as needed)
      } else {
        console.warn('locationTask is not properly initialized or does not have a remove method.');
      }
    } catch (error) {
      console.warn('Error starting location tracking:', error);
    }
  };  
  
  const handleChangeLocation = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to update your location?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel"
        },
        { text: "OK", onPress: handleUpdateLocation }
      ]
    );
  };

  const handleUpdateLocation = async () => {
    try {
      if (userDocRef) {
        // Update location in the database
        await updateDoc(userDocRef, { location: newLocation });
  
        navigation.goBack(); // Go back to the previous screen after updating the location
      } else {
        console.error('Error: userDocRef is null');
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text>Current Location: {initialLocation}</Text>
      <Text>Enter new location:</Text>
      <TextInput
        style={styles.input}
        value={newLocation}
        onChangeText={(text) => setNewLocation(text)}
      />
      <TouchableOpacity onPress={makeNewLocation}>
        <Text>Set new location</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleChangeLocation}>
        <Text>Update Location</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default ChangeLocation;
