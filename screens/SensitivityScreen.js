import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { db } from '../firebase/firebase';
import { doc, updateDoc } from '@firebase/firestore';
import { getAuth } from 'firebase/auth';

const auth = getAuth();

const SensitivityScreen = () => {
  const [totalDailyDose, setTotalDailyDose] = useState('');
  const [isf, setISF] = useState('');

  const calculateISF = async () => {
    if (totalDailyDose) {
      const calculatedISF = 1500 / parseFloat(totalDailyDose);
      setISF(calculatedISF.toFixed(2));

      // Update Firebase database with ISF value
      const userId = auth.currentUser.uid; 
      const userDocRef = doc(db, 'profiles', userId);
      
      try {
        await updateDoc(userDocRef, { ISF: calculatedISF.toFixed(2) });
        console.log('ISF updated successfully');
      } catch (error) {
        console.error('Error updating ISF:', error);
      }
    } else {
      setISF('');
    }
  };

  return (
    <KeyboardAwareScrollView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Insulin Sensitivity</Text>
        <Text style={styles.info}>
          Insulin sensitivity refers to how responsive your body's cells are to insulin. It's a
          measure of how effectively insulin helps lower your blood sugar levels.
        </Text>
        <Text style={styles.subtitle}>Calculate Insulin Sensitivity Factor (ISF)</Text>
        <TextInput
          style={styles.input}
          placeholder="Total Daily Dose (TDD) of Insulin (units)"
          keyboardType="numeric"
          value={totalDailyDose}
          onChangeText={(text) => setTotalDailyDose(text)}
        />
        <Button title="Calculate ISF" onPress={calculateISF} />
        {isf !== '' && <Text style={styles.result}>ISF: {isf} mg/dL per unit</Text>}
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
  info: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  result: {
    marginTop: 20,
    fontSize: 18,
  },
});

export default SensitivityScreen;
