import React, { useEffect, useState } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { useAuthentication } from '../hooks/useAuthentication.ts';

const ChatRoomScreen = () => {
  const [messages, setMessages] = useState([]);
  const { user } = useAuthentication();

  useEffect(() => {
    if (!user) {
      // Redirect to login or handle unauthenticated user
      return;
    }

    const sortedIDs = [user.uid, /* Other user ID */].sort();
    const chatRoomID = sortedIDs.join('-');

    const messagesCollection = collection(db, 'messages', chatRoomID, 'messages');
    const messagesQuery = query(messagesCollection, orderBy('createdAt'));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          _id: doc.id,
          text: data.text,
          createdAt: data.createdAt ? data.createdAt.toDate() : null,
          user: {
            _id: data.userId,
          },
        };
      });

      setMessages(newMessages);
    });

    return () => {
      // Unsubscribe from Firestore updates when the component unmounts
      unsubscribe();
    };
  }, [user]);

  const onSend = async (newMessages = []) => {
    if (!user) {
      // Redirect to login or handle unauthenticated user
      return;
    }

    const sortedIDs = [user.uid, /* Other user ID */].sort();
    const chatRoomID = sortedIDs.join('-');

    const messagesCollection = collection(db, 'messages', chatRoomID, 'messages');

    newMessages.forEach(async (message) => {
      await addDoc(messagesCollection, {
        text: message.text,
        createdAt: serverTimestamp(),
        userId: message.user._id,
      });
    });
  };

  const currentUserID = user ? user.uid : null;

  return (
    <GiftedChat
      messages={messages}
      onSend={(newMessages) => onSend(newMessages)}
      user={{
        _id: currentUserID,
      }}
    />
  );
};

export default ChatRoomScreen;
