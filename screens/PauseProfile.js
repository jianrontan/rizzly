import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Dimensions } from 'react-native';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { StyleSheet } from 'react-native';

const cardWidth = Dimensions.get('window').width;
const cardHeight = Dimensions.get('window').height;

const PauseProfile = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const fetchPausedUserStatus = async () => {
      const auth = getAuth();
      if (!auth.currentUser) {
        console.error('No authenticated user');
        return;
      }

      const userId = auth.currentUser.uid;
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setIsEnabled(docSnap.data().pausedUser || false);
      }
    };

    fetchPausedUserStatus();
  }, []);

  const toggleSwitch = async () => {
    const newIsEnabled = !isEnabled;
    setIsEnabled(newIsEnabled);

    const auth = getAuth();
    if (!auth.currentUser) {
      console.error('No authenticated user');
      return;
    }

    const userId = auth.currentUser.uid;

    try {
      if (newIsEnabled) {
        // Update pausedUser field in Firestore to true when the switch is turned on
        await setDoc(doc(db, 'profiles', userId), {
          pausedUser: true
        }, { merge: true });
        console.log('Successfully set pausedUser to true');
      } else {
        // Update pausedUser field in Firestore to false when the switch is turned off
        await updateDoc(doc(db, 'profiles', userId), {
          pausedUser: false
        });
        console.log('Successfully set pausedUser to false');
      }
    } catch (error) {
      console.error('Failed to update pausedUser:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pause Profile</Text>
      <Switch
        style={styles.switch} 
        trackColor={{ false: "#767577", true: "#ffd700" }}
        thumbColor={isEnabled ? "#6e4639" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
      <Text style={styles.description}>
        Pause Profile allows you to still view who likes you, but it doesn't allow you to see people or other people to see you either.
      </Text>
    </View>
  );  
};

const styles = StyleSheet.create({
  container: {
    flex:   1,
    backgroundColor: "#6e4639",
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal:   20, 
  },
  header: {
    fontSize:   24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom:   10,
  },
  switchContainer: {
    width: '80%', 
    marginBottom:  20, 
  },
  description: {
    color: 'white',
    fontSize:   16,
    textAlign: 'center', 
    marginTop:  10,
  },
});

export default PauseProfile;