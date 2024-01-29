import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const HyperScreen = ({ navigation }) => {
  const navigateToSensitivityScreen = () => {
    navigation.navigate('SensitivityScreen');
  };

  const navigateToCarbCountingScreen = () => {
    navigation.navigate('CarbCountingScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fight Against High Blood Glucose</Text>
      <Text style={styles.description}>
        Here are some tips to help you manage high blood glucose levels:
      </Text>
      {/* Add information on fighting high blood glucose */}
      <TouchableOpacity
        style={styles.button}
        onPress={navigateToSensitivityScreen}>
        <Text style={styles.buttonText}>Calculate Insulin Sensitivity</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={navigateToCarbCountingScreen}>
        <Text style={styles.buttonText}>Carbohydrate Counting</Text>
      </TouchableOpacity>
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
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
});

export default HyperScreen;
