import React, { useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { getAuth, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const DeleteAccountScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  const deleteAccount = async () => {
    setLoading(true);
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        // Prompt the user to enter their password for reauthentication
        const credentials = {
          email: user.email, // Use the user's email
          password: password.trim(),
        };

        // Reauthenticate user with their password
        const credential = EmailAuthProvider.credential(credentials.email, credentials.password);
        await reauthenticateWithCredential(user, credential);

        // Delete user's document from Firestore collections
        await Promise.all([
          deleteDoc(doc(db, 'profiles', auth.currentUser.uid)), // Delete from 'profiles'
          deleteDoc(doc(db, 'filters', auth.currentUser.uid)), // Delete from 'filters'
          deleteDoc(doc(db, 'emails', auth.currentUser.uid)), // Delete from 'emails'
          deleteDoc(doc(db, 'units', auth.currentUser.uid)), // Delete from 'units'
          // Delete user's private chat rooms (assuming each chat room ID contains the user's UID)
          db.collection('privatechatrooms').where('users', 'array-contains', auth.currentUser.uid)
            .get().then(querySnapshot => {
              // Delete each document in the query snapshot
              querySnapshot.forEach(doc => {
                // Delete the document
                deleteDoc(doc.ref);

                // Delete all documents in the 'messages' subcollection of the chat room
                const messagesCollection = db.collection('privatechatrooms').doc(doc.id).collection('messages');
                messagesCollection.get().then(snapshot => {
                  snapshot.docs.forEach(messageDoc => deleteDoc(messageDoc.ref));
                });
              });
            })
        ]);

        // Delete user from Firebase Auth
        await deleteUser(user);

        Alert.alert('Success!', 'Your account has been deleted.');

      } catch (error) {
        console.error('Error deleting user:', error);
        Alert.alert('Error!', 'Failed to delete account. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Are you sure you want to delete your account?</Text>
      <TextInput
        placeholder="Enter your password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <TouchableOpacity onPress={deleteAccount} disabled={loading} style={styles.button}>
        <Text style={styles.buttonText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6e4639', // Deep brown background
  },
  text: {
    fontSize: 18,
    color: '#FFFFFF', // White text color
  },
  input: {
    borderWidth: 1,
    borderColor: '#D3A042', // Gold border color
    margin: 10,
    padding: 8,
    width: 200,
    backgroundColor: '#FFFFFF', // White input background
    color: '#000000', // Black input text color
  },
  button: {
    backgroundColor: '#D3A042', // Gold button color
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF', // White button text color
    fontWeight: 'bold',
  },
});

export default DeleteAccountScreen;