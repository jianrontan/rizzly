import React, { useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { getAuth, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

import { SIZES } from '../constants';

const DeleteAccountScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  const deleteAccount = async () => {
    setLoading(true);
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        const credentials = {
          email: user.email,
          password: password.trim(),
        };

        const credential = EmailAuthProvider.credential(credentials.email, credentials.password);
        await reauthenticateWithCredential(user, credential);

        await Promise.all([
          deleteDoc(doc(db, 'profiles', auth.currentUser.uid)), 
          deleteDoc(doc(db, 'filters', auth.currentUser.uid)), 
          deleteDoc(doc(db, 'emails', auth.currentUser.uid)), 
          deleteDoc(doc(db, 'units', auth.currentUser.uid)), 

          db.collection('privatechatrooms').where('users', 'array-contains', auth.currentUser.uid)
            .get().then(querySnapshot => {
              querySnapshot.forEach(doc => {
                deleteDoc(doc.ref);

                const messagesCollection = db.collection('privatechatrooms').doc(doc.id).collection('messages');
                messagesCollection.get().then(snapshot => {
                  snapshot.docs.forEach(messageDoc => deleteDoc(messageDoc.ref));
                });
              });
            })
        ]);

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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.text}>Are you sure you want to delete your account?</Text>
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor={'white'}
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <TouchableOpacity onPress={deleteAccount} disabled={loading} style={styles.button}>
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6e4639', 
  },
  text: {
    fontSize: SIZES.xLarge,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center' 
  },
  input: {
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    textAlignVertical: 'top', 
    color: 'white',
    top: 20,
  },
  button: {
    backgroundColor: '#D3A042', 
    padding: 10,
    borderRadius: 5,
    marginTop: 30,
  },
  buttonText: {
    color: '#FFFFFF', 
    fontWeight: 'bold',
  },
});

export default DeleteAccountScreen;