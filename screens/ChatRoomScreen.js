import React, { useEffect, useState } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { getDatabase, ref, onValue, push } from "firebase/database";
import { auth , db } from '../firebase/firebase';

const ChatRoomScreen = ({ userID1, userID2 }) => {
 const [messages, setMessages] = useState([]);

 // Create a unique chat room ID for each pair of users
 const sortedIDs = [userID1, userID2].sort();
 const chatRoomID = sortedIDs.join('-');
 console.log(chatRoomID)
 
 useEffect(() => {
 const db = getDatabase();
 const messagesRef = ref(db, 'messages/' + chatRoomID);
 onValue(messagesRef, snapshot => {
 const data = snapshot.val();
 const newMessages = Object.keys(data).map(key => ({
   _id: key,
   text: data[key].text,
   createdAt: data[key].createdAt,
   user: {
     _id: data[key].userId,
   },
 }));
 setMessages(newMessages);
 });
 }, [chatRoomID]);

 const onSend = (newMessages = []) => {
  setMessages(GiftedChat.append(messages, newMessages));
  newMessages.forEach((message) => {
    push(ref(db, 'messages/' + chatRoomID), {
      text: message.text,
      createdAt: message.createdAt,
      userId: message.user._id,
    });
  });
};

 return (
 <GiftedChat
 messages={messages}
 onSend={newMessages => onSend(newMessages)}
 user={{
 _id: auth.currentUser ? auth.currentUser.uid : null,
 }}
 />
 );
};

export default ChatRoomScreen;
