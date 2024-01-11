import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const Report = ({ navigation }) => {
  const [reportCategory, setReportCategory] = useState(null);
  const [incidentDetails, setIncidentDetails] = useState('');

  const reportCategories = [
    { label: 'Fake Person/ Scammer', value: '1' },
    { label: 'Inappropriate content/ Harassment', value: '2' },
    { label: 'Safety Issues', value: '3' },
    { label: 'Others', value: '4' },
  ];

  const handleSendReport = () => {
    // Handle sending the report here
    console.log(`Report Category: ${reportCategory}`);
    console.log(`Incident Details: ${incidentDetails}`);

    navigation.pop();
  };

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <Picker
          style={styles.dropdown}
          selectedValue={reportCategory}
          onValueChange={(itemValue, itemIndex) => setReportCategory(itemValue)}
        >
          {reportCategories.map((category) => (
            <Picker.Item
              key={category.value}
              label={category.label}
              value={category.value}
              color="black" // Set the label text color here
            />
          ))}
        </Picker>
      </View>
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Describe the incident..."
          value={incidentDetails}
          onChangeText={(text) => setIncidentDetails(text)}
          multiline
        />
      </View>
      <Button title="Send Report" onPress={handleSendReport} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  pickerContainer: {
    marginBottom: 10,
  },
  textInputContainer: {
    marginBottom: 16,
  },
  dropdown: {
    height: 220, // Set the height as needed
    fontSize: 12 ,
  },
  textInput: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    color: 'black', // Set the text color for TextInput
  },
});

export default Report;
