import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Linking } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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

  const handleLearnMore = () => {
    // Open link to educational resource explaining insulin-to-carbohydrate ratio
    Linking.openURL('https://www.healthline.com/health/diabetes/insulin-to-carb-ratio#about-insulin-to-carb-ratio');
  };

  return (
    <KeyboardAwareScrollView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Carb Counting Screen</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Carbohydrate Intake (grams)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={carbIntake}
            onChangeText={(text) => setCarbIntake(text)}
            placeholder='Usually found online or on the package for 1 serving'
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Insulin-to-Carbohydrate Ratio</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={icr}
            onChangeText={(text) => setICR(text)}
            placeholder='1 unit of insulin: how many grams of carbohydrates'
          />
        </View>
        <TouchableOpacity onPress={handleLearnMore}>
          <Text style={styles.learnMore}>Do not know your insulin-to-carbohydrate ratio?</Text>
        </TouchableOpacity>
        <Button title="Calculate Insulin Dosage" onPress={calculateInsulinDosage} />
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    paddingHorizontal: 10,
  },
  learnMore: {
    marginTop: 10,
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default CarbCountingScreen;
