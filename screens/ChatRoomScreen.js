import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase'; // Import auth from Firebase

const ChatRoomScreen = ({ route }) => {
  // Destructure matchedUser from route.params
  const { matchedUser } = route.params || {};

  const currentUser = auth.currentUser; // Get the currently authenticated user

  // Ensure currentUser and matchedUser are defined
  const currentUserID = currentUser?.uid;
  const receiverID = matchedUser?.id;

  // Generate unique chatroomId using both user IDs
  const chatroomId = [currentUserID, receiverID].sort().join('_');

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const chatroomRef = doc(db, 'chatrooms', chatroomId);
        const chatroomSnapshot = await getDoc(chatroomRef);

        if (chatroomSnapshot.exists()) {
          setMessages(chatroomSnapshot.data().messages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [chatroomId]);

  const sendMessage = async () => {
    try {
      // Ensure currentUser and matchedUser are defined
      if (!currentUser || !matchedUser) {
        console.error('Error: currentUser or matchedUser is undefined');
        return;
      }

      const message = {
        senderId: currentUserID,
        receiverId: receiverID,
        content: newMessage,
        user: {
          _id: currentUserID,
          name: currentUser.displayName, // assuming you have a displayName in your Firebase user profile
        },
      };

      const chatroomRef = doc(db, 'chatrooms', chatroomId);
      const chatroomSnapshot = await getDoc(chatroomRef);

      if (chatroomSnapshot.exists()) {
        await updateDoc(chatroomRef, {
          messages: arrayUnion(message),
        });
      } else {
        await setDoc(chatroomRef, {
          messages: [message],
        });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <View>
      <Text>Chat Room Screen</Text>
      <Text>Chatroom ID: {chatroomId}</Text>
      {messages.map((message, index) => (
        <View key={index}>
          <Text>Sender: {message.senderId}</Text>
          <Text>Content: {message.content}</Text>
        </View>
      ))}
      <TextInput
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder="Type a message"
      />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
};

export default ChatRoomScreen;
