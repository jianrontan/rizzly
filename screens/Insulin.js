import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';

const InsulinScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>What is Insulin?</Text>
      <Text style={styles.description}>
        Insulin is a hormone produced by the pancreas that regulates blood sugar levels. It allows your body to use glucose (sugar) from carbohydrates in the food you eat for energy or to store glucose for future use.
      </Text>
      <Text style={styles.sectionTitle}>Types of Insulin</Text>
      <Text style={styles.sectionDescription}>
        There are different types of insulin, each with its own onset, peak, and duration of action:
      </Text>
      <Text style={styles.subTitle}>Long-Acting (Basal) Insulin:</Text>
      <Text style={styles.subDescription}>
        Long-acting insulin is designed to provide a steady level of insulin over an extended period, usually covering the body's basal insulin needs between meals and overnight. Common types include insulin glargine (Lantus, Basaglar), insulin detemir (Levemir), and insulin degludec (Tresiba).
      </Text>
      <Text style={styles.subDescription}>
        The duration of action of long-acting insulin can vary depending on the specific type used, lasting for about 18 to 24 hours on average.
      </Text>
      <Text style={styles.subTitle}>Short-Acting (Bolus) Insulin:</Text>
      <Text style={styles.subDescription}>
        Short-acting insulin, also known as bolus insulin, is typically taken before meals to help manage blood sugar spikes that occur after eating. Common types include regular insulin (Humulin R, Novolin R) and rapid-acting insulin analogs such as insulin lispro (Humalog), insulin aspart (NovoLog), and insulin glulisine (Apidra).
      </Text>
      <Text style={styles.subDescription}>
        Short-acting insulin starts working within 30 minutes to 1 hour after injection, peaks in about 2 to 3 hours, and generally lasts for about 3 to 6 hours, depending on the specific type.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => Linking.openURL('https://www.betterhealth.vic.gov.au/health/conditionsandtreatments/diabetes-and-insulin')}>
        <Text style={styles.buttonText}>Learn More</Text>
      </TouchableOpacity>
      <Text> </Text>
      <Text> </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 16,
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  subDescription: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'justify',
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
