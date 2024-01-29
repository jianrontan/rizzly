import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

const CarbCountingScreen = () => {
  const [carbIntake, setCarbIntake] = useState('');
  const [icr, setICR] = useState('');

  const calculateInsulinDosage = () => {
    if (carbIntake && icr) {
      const dosage = parseFloat(carbIntake) / parseFloat(icr);
      Alert.alert('Insulin Dosage', `You need ${dosage.toFixed(2)} units of insulin.`);
    } else {
      Alert.alert('Error', 'Please enter both carbohydrate intake and insulin-to-carbohydrate ratio.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carb Counting Screen</Text>
      <TextInput
        style={styles.input}
        placeholder="Carbohydrate Intake (grams)"
        keyboardType="numeric"
        value={carbIntake}
        onChangeText={(text) => setCarbIntake(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Insulin-to-Carbohydrate Ratio"
        keyboardType="numeric"
        value={icr}
        onChangeText={(text) => setICR(text)}
      />
      <Button title="Calculate Insulin Dosage" onPress={calculateInsulinDosage} />
    </View>
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
});

export default CarbCountingScreen;
