import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';

const ContactUsScreen = () => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (message.trim() === '') {
      Alert.alert('Error', 'Please enter your message.');
      return;
    }

    // You can implement the logic to send the message to your backend or handle it as needed.
    // For now, just show an alert to indicate that the message has been sent.
    Alert.alert('Success', 'Your message has been sent. We will get back to you soon.');
    setMessage('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Us</Text>
      <TextInput
        style={styles.input}
        placeholder="Type your message here"
        multiline
        numberOfLines={5}
        value={message}
        onChangeText={(text) => setMessage(text)}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Send Message</Text>
      </TouchableOpacity>
      <Text>
        Alternatively, you can contact us at 6123 5678 or at rizzly@gmail.com
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top', // for multiline input to start from the top
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ContactUsScreen;
