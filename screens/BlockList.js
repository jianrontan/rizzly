import React, { useState, useEffect } from 'react';
import { Button, TextInput, View, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, collection, query, where, getDoc, arrayRemove, updateDoc, doc, getDocs, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from 'react-native-elements';

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
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text>{item}</Text>
      <TouchableOpacity onPress={() => handleUnblock(item)} style={{ marginLeft: -10 }}>
        <Icon name='close' type='material-icons' />
      </TouchableOpacity>
    </View>
  );

  return (
    <View>
      <TextInput
        placeholder="Enter email to block..."
        value={blockInput}
        onChangeText={text => setBlockInput(text)}
      />
      <Button title="Block Email" onPress={handleBlock} />
      <FlatList
        data={blockedEmails}
        renderItem={renderItem}
        keyExtractor={(item, index) => item}
      />
    </View>
  );
};

export default BlockList;
