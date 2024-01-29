import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const LabReportScreen = () => {
  const [hba1c, setHba1c] = useState('');
  const [renalPanel, setRenalPanel] = useState('');
  // Add state variables for other lab report tests

  const checkRange = (value, lowerLimit, upperLimit) => {
    if (value >= lowerLimit && value <= upperLimit) return 'green';
    if (value < lowerLimit) return 'yellow';
    return 'red';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lab Report Levels</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>HbA1c (Glycated Hemoglobin):</Text>
        <TextInput
          style={[styles.input, { color: checkRange(hba1c, 4, 6) }]}
          value={hba1c}
          onChangeText={setHba1c}
          keyboardType="numeric"
        />
        <Text style={styles.description}>Enter your HbA1c level (%)</Text>
        {/* Add input fields for other lab report tests */}
      </View>
      {/* Display significance and explanation for each test result */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: 'gray',
  },
});

export default LabReportScreen;
