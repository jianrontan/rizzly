import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { Platform } from 'react-native';
import ModalDatetimePicker from "react-native-modal-datetime-picker";

const auth = getAuth();

const HomeScreen = () => {
  const [bloodSugarLevels, setBloodSugarLevels] = useState([]);
  const [timestamps, setTimestamps] = useState([]);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const userId = auth.currentUser.uid;

  const handleAutoTimestamp = () => {
    setSelectedDate(new Date());
  };

  const handleSubmit = async () => {
    // Create a Firestore document reference
    const docRef = doc(db, 'profiles', userId);

    try {
      // Add data to Firestore
      await setDoc(docRef, {
        bloodSugarLevels: [...bloodSugarLevels, parseFloat(bloodSugarLevels)],
        timestamps: [...timestamps, Timestamp.fromDate(selectedDate)],
      });
      console.log('Data successfully added to Firestore');
      // Clear form fields after submission
      setBloodSugarLevels('');
      setTimestamps('');
    } catch (error) {
      console.error('Error adding data to Firestore:', error);
    }
  };

  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Record Blood Sugar Level</Text>
        <TextInput
          style={styles.input}
          placeholder="Blood Sugar Level (mg/dL)"
          keyboardType="numeric"
          value={bloodSugarLevels}
          onChangeText={(text) => setBloodSugarLevels(text)}
        />
        <View style={styles.buttonContainer}>
          <Button title="Auto Timestamp" onPress={handleAutoTimestamp} />
          <Button title="Submit" onPress={handleSubmit} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Show Picker" onPress={() => setIsPickerVisible(true)} />
          <ModalDatetimePicker
            isVisible={isPickerVisible}
            mode="datetime"
            onConfirm={(date) => {
              setSelectedDate(date);
              setIsPickerVisible(false);
            }}
            onCancel={() => setIsPickerVisible(false)}
          />
          <Button title="Hide Picker" onPress={() => setIsPickerVisible(false)} />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
});

export default HomeScreen;
