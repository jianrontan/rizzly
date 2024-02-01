import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const HyperScreen = ({ navigation }) => {
  const navigateToCorrectionScreen = () => {
    navigation.navigate('Correction');
  };

  const navigateToCarbCountingScreen = () => {
    navigation.navigate('CarbCountingScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fight Against High Blood Glucose</Text>
      <Text style={styles.description}>
        What is High Blood Glucose? It is when there is insufficient insulin hence excess amounts of glucose are found in the body
      </Text>
      <Text style={styles.description}>What are common symptoms of hyperglycemia (high blood glucose)? </Text>
      <Text style={styles.description}>Urinating, excessive thirst and lethargy are symptoms of high blood glucose</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={navigateToCorrectionScreen}>
        <Text style={styles.buttonText}>Calculate how much bolus(short acting insulin) to give</Text>
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
    fontSize: 18,
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
