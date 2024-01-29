import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Prevention2 = () => {
    const navigation = useNavigation();

    const navigateToPrevention2 = () => {
      navigation.navigate('Insulin');
    };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Factors and Solutions to Keep Your Diabetes in Check</Text>
      <Text style={styles.description}>
        Diabetes management involves various factors and solutions to help control blood sugar levels and prevent complications. Here are some key factors and solutions to consider:
      </Text>
      <Text style={styles.subTitle}>Healthy Eating:</Text>
      <Text style={styles.description}>
        - Follow a balanced diet rich in fruits, vegetables, whole grains, lean proteins, and healthy fats.
      </Text>
      <Text style={styles.subTitle}>Regular Exercise:</Text>
      <Text style={styles.description}>
        - Engage in regular physical activity such as walking, cycling, swimming, or strength training to help manage blood sugar levels and improve overall health.
      </Text>
      <Text style={styles.subTitle}>Medication Adherence:</Text>
      <Text style={styles.description}>
        - Take prescribed medications as directed by your healthcare provider to control blood sugar levels and prevent complications.
      </Text>
      <Text style={styles.subTitle}>Stress Management:</Text>
      <Text style={styles.description}>
        - Practice stress-reducing techniques such as deep breathing, meditation, yoga, or mindfulness to help manage stress levels, which can affect blood sugar control.
      </Text>
      <Text style={styles.subTitle}>Regular Monitoring:</Text>
      <Text style={styles.description}>
        - Monitor your blood sugar levels regularly and keep track of your results to identify trends and make necessary adjustments to your diabetes management plan.
      </Text>
      <TouchableOpacity onPress={navigatetoInsulin}>
        <Text>Click here to learn more about insulin </Text>
      </TouchableOpacity>
      {/* Add more factors and solutions as needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'justify',
  },
});

export default Prevention2;
