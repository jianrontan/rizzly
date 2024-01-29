import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';

const ForumScreen = () => {
  const [comment, setComment] = useState('');
  const [imageUri, setImageUri] = useState(null);

  const handleCommentChange = (text) => {
    setComment(text);
  };

  const handleImageUpload = () => {
    // Implement image upload functionality here
    // You can use a library like React Native Image Picker or Expo Image Picker
    // Example:
    // pickImage().then(uri => setImageUri(uri)).catch(error => console.log(error));
  };

  const handleSubmit = () => {
    if (!comment) {
      Alert.alert('Error', 'Please enter a comment.');
      return;
    }
    
    // Implement submission functionality here
    // Example:
    // submitPost(comment, imageUri).then(() => {
    //   setComment('');
    //   setImageUri(null);
    // }).catch(error => console.log(error));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Forum</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your comment here..."
          multiline
          value={comment}
          onChangeText={handleCommentChange}
        />
        <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
          <Text style={styles.uploadButtonText}>Upload Image</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    padding: 8,
    marginRight: 16,
  },
  uploadButton: {
    backgroundColor: 'blue',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: 'white',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  submitButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ForumScreen;
