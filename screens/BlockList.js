import React, { useState } from 'react';
import { TextInput, View, FlatList, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { collection, query, where, getDoc, arrayRemove, updateDoc, doc, getDocs, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from 'react-native-elements';

import { SIZES } from '../constants';

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

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // If a document is found, log the UID of the document
      const docRef = querySnapshot.docs[0];
      console.log('UID: ', docRef.id);

      const email = docRef.data().email;

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
      <Text style={styles.cardText}>{item}</Text>
      <TouchableOpacity onPress={() => handleUnblock(item)} style={styles.unblockButton}>
        <Icon name='close' type='material-icons' color='white' />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter email to block..."
        placeholderTextColor={'white'}
        value={blockInput}
        onChangeText={text => setBlockInput(text)}
      />
      <TouchableOpacity
        style={{
          backgroundColor: '#D3A042', 
          padding: 10,
          borderRadius: 5,
          marginTop: 40, 
          width: 150, 
          alignSelf: 'center', 
        }} 
        onPress={handleBlock}
      >
        <Text style={{ color: 'white', fontSize: SIZES.medium, fontWeight: 'bold', textAlign: 'center' }}>Block Email</Text>
      </TouchableOpacity>
      <FlatList style={{ top: 20, fontSize: SIZES.medium }}
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
    backgroundColor: '#6e4639', 
    padding: 10,
  },
  input: {
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    textAlignVertical: 'top', 
    color: 'white',
    top: 30,
    fontSize: SIZES.large,
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
  card: {
    backgroundColor: 'white', 
    padding: 10, 
    marginVertical: 10, 
    borderRadius: 5, 
  },
  cardText: {
    color: 'white', 
    fontSize: SIZES.medium,
    fontWeight: 'bold'
  },
});

export default BlockList;