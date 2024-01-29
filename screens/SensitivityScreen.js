import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const SensitivityScreen = () => {
  const [currentBloodSugar, setCurrentBloodSugar] = useState('');
  const [targetBloodSugar, setTargetBloodSugar] = useState('');
  const [totalDailyDose, setTotalDailyDose] = useState('');
  const [isf, setISF] = useState('');
  const [correctionInsulinDose, setCorrectionInsulinDose] = useState('');

  const calculateISF = () => {
    if (totalDailyDose) {
      const calculatedISF = 1800 / parseFloat(totalDailyDose);
      setISF(calculatedISF.toFixed(2));
    } else {
      setISF('');
    }
  };

  const calculateCorrectionInsulinDose = () => {
    if (currentBloodSugar && targetBloodSugar && isf) {
      const correctionDose =
        (parseFloat(currentBloodSugar) - parseFloat(targetBloodSugar)) / parseFloat(isf);
      setCorrectionInsulinDose(correctionDose.toFixed(2));
    } else {
      setCorrectionInsulinDose('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insulin Sensitivity and Correction</Text>
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
      <Text style={styles.subtitle}>Calculate Correction Insulin Dose</Text>
      <TextInput
        style={styles.input}
        placeholder="Current Blood Sugar (mg/dL)"
        keyboardType="numeric"
        value={currentBloodSugar}
        onChangeText={(text) => setCurrentBloodSugar(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Target Blood Sugar (mg/dL)"
        keyboardType="numeric"
        value={targetBloodSugar}
        onChangeText={(text) => setTargetBloodSugar(text)}
      />
      <Button title="Calculate Correction Insulin Dose" onPress={calculateCorrectionInsulinDose} />
      {correctionInsulinDose !== '' && (
        <Text style={styles.result}>Correction Insulin Dose: {correctionInsulinDose} units</Text>
      )}
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
