import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { Keyboard } from 'react-native';
import { Text } from 'react-native-elements';

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
    <View style={styles.categoriesContainer}>
      {reportCategories.map((category) => (
        <TouchableOpacity
          key={category.value}
          style={[styles.button, reportCategory === category.value && styles.selectedButton]}
          onPress={() => setReportCategory(category.value)}
        >
          <Text>{category.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
    <View style={styles.textInputContainer}>
      <TextInput
        style={styles.textInput}
        placeholder="Describe the incident..."
        value={incidentDetails}
        onChangeText={(text) => setIncidentDetails(text)}
        multiline
        onSubmitEditing={Keyboard.dismiss}
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
 categoriesContainer: {
   marginBottom: 10,
 },
 button: {
   padding: 10,
   margin: 5,
   backgroundColor: '#007bff',
   alignItems: 'center',
 },
 selectedButton: {
   opacity: 0.6,
 },
 textInputContainer: {
   marginBottom: 10,
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
