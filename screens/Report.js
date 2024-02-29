import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Text } from 'react-native-elements';

const Report = ({ navigation }) => {
  const [reportCategory, setReportCategory] = useState(null);
  const [incidentDetails, setIncidentDetails] = useState('');

  const reportCategories = [
    { label: 'Fake Person/ Scammer', value: '1' },
    { label: 'Inappropriate content', value: '2' },
    { label: 'Safety Issues', value: '3' },
    { label: 'Others', value: '4' },
  ];

  const handleSendReport = () => {
    console.log(`Report Category: ${reportCategory}`);
    console.log(`Incident Details: ${incidentDetails}`);

    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.categoriesContainer}>
          {reportCategories.map((category) => (
            <TouchableOpacity
              key={category.value}
              style={[styles.button, reportCategory === category.value && styles.selectedButton]}
              onPress={() => setReportCategory(category.value)}
            >
              <Text style={styles.label}>{category.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Describe the incident..."
            placeholderTextColor={'white'}
            value={incidentDetails}
            onChangeText={(text) => setIncidentDetails(text)}
            multiline
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>
        <TouchableOpacity style={styles.sendButton} onPress={handleSendReport}>
          <Text style={styles.sendButtonText}>Send Report</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#6e4639'
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  button: {
    padding: 10,
    margin: 5,
    backgroundColor: '#D3A042',
    alignItems: 'center',
    borderRadius: 20,
  },
  selectedButton: {
    opacity: 0.6,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  textInputContainer: {
    marginBottom: 20,
  },
  textInput: {
    height: 200,
    borderColor: 'white',
    borderWidth: 1,
    padding: 10,
    color: 'white',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#D3A042',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Report;
