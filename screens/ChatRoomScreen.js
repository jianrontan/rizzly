import React, { useEffect, useState } from 'react';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

const ChatRoom = ({ route }) => {
  const { chatRoomID, userId, userName } = route.params;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const messagesCollection = collection(db, 'privatechatrooms', chatRoomID, 'messages');
    const messagesQuery = query(messagesCollection, orderBy('createdAt'));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          _id: doc.id,
          text: data.content,
          createdAt: data.createdAt ? data.createdAt.toDate() : null,
          user: {
            _id: data.senderId,
            name: data.user.name,
          },
        };
      });

      setMessages(newMessages);
    });

    return () => {
      unsubscribe();
    };
  }, [chatRoomID]);

  const onSend = async (newMessages = []) => {
    const messagesCollection = collection(db, 'privatechatrooms', chatRoomID, 'messages');

    newMessages.forEach(async (message) => {
      await addDoc(messagesCollection, {
        content: message.text,
        createdAt: serverTimestamp(),
        senderId: auth.currentUser.uid,
        user: {
          name: auth.currentUser.displayName,
        },
        // Add the current timestamp when the message is sent
        timestamp: new Date(),
      });
    });
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={(newMessages) => onSend(newMessages)}
      user={{
        _id: auth.currentUser.uid,
      }}
      inverted={false} // Set the inverted prop to false
      renderBubble={(props) => {
        if (props.currentMessage.user._id === auth.currentUser.uid) {
          return <BubbleRight {...props} />;
        }
        return <BubbleLeft {...props} />;
      }}
    />
  );
};

const BubbleRight = (props) => {
  return (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: 'blue',
        },
      }}
    />
  );
};

const BubbleLeft = (props) => {
  return (
    <Bubble
      {...props}
      wrapperStyle={{
        left: {
          backgroundColor: 'green',
        },
      }}
    />
  );
};

export default ChatRoom;
