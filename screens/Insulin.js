import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const InsulinScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What is Insulin?</Text>
      <Text style={styles.description}>
        Insulin is a hormone produced by the pancreas that regulates blood sugar levels. It allows your body to use glucose (sugar) from carbohydrates in the food you eat for energy or to store glucose for future use.
      </Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Learn More</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InsulinScreen;
