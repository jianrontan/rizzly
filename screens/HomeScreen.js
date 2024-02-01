import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Switch } from 'react-native-gesture-handler';

const auth = getAuth();

const HomeScreen = () => {
  const [bloodSugarLevel, setBloodSugarLevel] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [hasEaten, setHasEaten] = useState(false);
  const [hasInsulin, setHasInsulin] = useState(false);
  const [insulinUnits, setInsulinUnits] = useState('');

  const userId = auth.currentUser.uid;

  const handleSubmit = async () => {
    // Check if both fields are filled
    if (!bloodSugarLevel || !selectedDateTime) {
      alert("Please fill up all fields");
      return;
    }

    // Create a Firestore document reference
    const docRef = doc(db, 'profiles', userId);

    try {
      // Update data in Firestore to append the new reading to the existing array
      await updateDoc(docRef, {
        bloodSugarLevels: arrayUnion(parseFloat(bloodSugarLevel)),
        times: arrayUnion(Timestamp.fromDate(selectedDateTime)),
        hasEaten: arrayUnion(hasEaten),
        hasInsulin: arrayUnion(hasInsulin),
        insulinUnits: arrayUnion(hasInsulin ? parseFloat(insulinUnits) : null),
      });
      console.log('Data successfully added to Firestore');
      // Clear form fields after submission
      setBloodSugarLevel('');
      setSelectedDateTime(new Date());
      setHasEaten(false);
      setHasInsulin(false);
      setInsulinUnits('');
    } catch (error) {
      console.error('Error adding data to Firestore:', error);
    }
  };

  const handleSwitchChange = (value) => {
    setHasEaten(value);
  };

  const handleSwitchChange2 = (value) => {
    setHasInsulin(value);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setSelectedDateTime(currentDate);
    setDatePickerVisibility(Platform.OS === 'ios');
  };

  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Record Blood Sugar Level</Text>
        <TextInput
          style={styles.input}
          placeholder="Blood Sugar Level (mg/dL)"
          keyboardType="numeric"
          value={bloodSugarLevel}
          onChangeText={(text) => setBloodSugarLevel(text)}
        />
        <View style={styles.buttonContainer}>
          <Button title="Select Date & Time" onPress={showDatePicker} />
          {isDatePickerVisible && (
            <DateTimePicker
              testID="dateTimePicker"
              value={selectedDateTime}
              mode="datetime"
              is24Hour={true}
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
          <Button title="Close" onPress={hideDatePicker} />
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Consumed food? </Text>
            <Switch
              title="Consumed food?"
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={hasEaten ? "#81b0ff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={handleSwitchChange}
              value={hasEaten}
            />
            <Text style={styles.switchText}>{hasEaten ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Took Your Insulin? </Text>
            <Switch
              title="Took Insulin?"
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={hasInsulin ? "#81b0ff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={handleSwitchChange2}
              value={hasInsulin}
            />
            <Text style={styles.switchText}>{hasInsulin ? 'Yes' : 'No'}</Text>
          </View>
          <Text></Text>
          {hasInsulin && (
            <TextInput
              style={styles.insulininput}
              placeholder="If yes, How many units"
              keyboardType="numeric"
              value={insulinUnits}
              onChangeText={(text) => setInsulinUnits(text)}
            />
          )}
          <Button title="Submit" onPress={handleSubmit} />
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
    fontSize: 24,
    width: '100%',
    height: 60,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  insulininput: {
    width: '100%',
    height: 60,
    fontSize: 24,
    borderWidth: 1,
    borderColor: 'gray',
    paddingHorizontal: 10,
  },
  buttonContainer: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  switchLabel: {
    marginRight: 10,
    fontSize: 20,
  },
  switchText: {
    marginLeft: 10,
  },
});

export default HomeScreen;
