import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';

function ChatRoomScreen({ route }) {
  const { userId, userName } = route.params;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Fetch initial chat messages from your server/database
    // Update the 'messages' state with the fetched messages
  }, []);

  const onSend = useCallback((newMessages = []) => {
    setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
    
    // Send the new messages to your server/database
  }, []);

  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={{ _id: userId, name: userName }}
    />
  );
}

export default ChatRoomScreen;
