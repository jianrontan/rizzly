import React, { useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity } from 'react-native';
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
              querySnapshot.forEach(doc => deleteDoc(doc.ref));
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Are you sure you want to delete your account?</Text>
      <TextInput
        placeholder="Enter your password"
        secureTextEntry
        style={{ borderWidth: 1, margin: 10, padding: 8, width: 200 }}
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <TouchableOpacity onPress={deleteAccount} disabled={loading}>
        <Text>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DeleteAccountScreen;
