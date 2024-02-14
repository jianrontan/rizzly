import React, { useState, useEffect } from 'react';
import { Button, TextInput, View, FlatList, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { getFirestore, collection, query, where, getDoc, arrayRemove, updateDoc, doc, getDocs, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import { FlashList } from '@shopify/flash-list';

const BlockList = () => {
  const [blockInput, setBlockInput] = useState('');
  const [blockedEmails, setBlockedEmails] = useState([]);

  const handleBlock = () => {
    Alert.alert(
      'Confirmation',
      'Do you really want to block this email?',
      [
        {
          text: 'Cancel',
          onPress: () => { },
          style: 'cancel',
        },
        { text: 'Confirm', onPress: () => performBlockingOperation() },
      ],
      { cancelable: false }
    );
  };

  const performBlockingOperation = async () => {
    // Create a query against the 'emails' collection
    const q = query(collection(db, 'emails'), where('email', '==', blockInput));

    // Execute the query
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // If a document is found, log the UID of the document
      const docRef = querySnapshot.docs[0];
      console.log('UID: ', docRef.id);

      const email = docRef.data().email;

      // Check if the entered email is the current user's email
      if (email === auth.currentUser.email) {
        Alert.alert("Cannot block your own email");
        return;
      }

      // Add the blocked email to the 'blocked' array in the user's document
      const userRef = doc(db, 'profiles', auth.currentUser.uid);
      await updateDoc(userRef, {
        blockedIDs: arrayUnion(docRef.id),
        blockedEmails: arrayUnion(email)
      })

      // Add the blocked email to the state
      setBlockedEmails([...blockedEmails, email]);
    } else {
      console.log('No document found with that email');
    }
    setBlockInput('');
  };

  const handleUnblock = async (email) => {
    // Remove the unblocked email from the 'blockedEmails' array in the user's document
    const userRef = doc(db, 'profiles', auth.currentUser.uid);
    await updateDoc(userRef, {
      blockedEmails: arrayRemove(email)
    });

    // Remove the unblocked email from the state
    setBlockedEmails(blockedEmails.filter(blockedEmail => blockedEmail !== email));
  };


  useFocusEffect(
    React.useCallback(() => {
      // This function runs every time the screen comes into focus
      const fetchBlockedEmails = async () => {
        const userRef = doc(db, 'profiles', auth.currentUser.uid);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          setBlockedEmails(userSnapshot.data().blockedEmails || []);
        }
      };

      fetchBlockedEmails();
    }, [])
  );

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text>{item}</Text>
      <TouchableOpacity onPress={() => handleUnblock(item)} style={styles.unblockButton}>
        <Icon name='close' type='material-icons' />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter email to block..."
        value={blockInput}
        onChangeText={text => setBlockInput(text)}
      />
      <TouchableOpacity
        style={styles.blockButton}
        onPress={handleBlock}
      >
        <Text style={styles.blockButtonText}>Block Email</Text>
      </TouchableOpacity>
      <FlatList
        data={blockedEmails}
        renderItem={renderItem}
        keyExtractor={(item, index) => item}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF', // Assuming a light background for the app
    padding: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  blockButton: {
    backgroundColor: 'black',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  blockButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  unblockButton: {
    paddingRight: 10,
  },
});

export default BlockList;