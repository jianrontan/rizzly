import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const HypoScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>How to Tackle Hypoglycemia (Low Blood Sugar)</Text>
      <Text style={styles.subtitle}>Recognize the Symptoms:</Text>
      <Text>- Shakiness</Text>
      <Text>- Sweating</Text>
      <Text>- Dizziness</Text>
      <Text>- Hunger</Text>
      <Text>- Confusion</Text>
      <Text>- Irritability</Text>
      <Text>- Rapid heartbeat</Text>
      <Text>- Weakness</Text>
      <Text style={styles.subtitle}>Check Blood Sugar Level:</Text>
      <Text>- Use a glucose meter to confirm hypoglycemia (blood sugar level below 70 mg/dL or 3.9 mmol/L).</Text>
      <Text style={styles.subtitle}>Immediate Treatment:</Text>
      <Text>- Consume 15-20 grams of fast-acting carbohydrates.</Text>
      <Text>- Examples: glucose tablets, fruit juice, hard candy, honey.</Text>
      <Text>- Wait 15 minutes and recheck blood sugar level.</Text>
      <Text style={styles.subtitle}>Follow Up:</Text>
      <Text>- After blood sugar returns to normal, have a snack or meal containing carbohydrates and protein.</Text>
      <Text style={styles.subtitle}>Monitor Symptoms:</Text>
      <Text>- Continue monitoring symptoms and blood sugar levels.</Text>
      <Text style={styles.subtitle}>Prevent Future Episodes:</Text>
      <Text>- Work with healthcare provider to identify causes and prevention strategies.</Text>
      <Text>- Always carry fast-acting glucose for emergencies.</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
});

export default HypoScreen;
