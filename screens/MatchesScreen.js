import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, Dimensions } from 'react-native';
import { collection, getDocs, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { setMatchesCount, setMatchesRedux, setUnreadChatroomsCount } from '../redux/actions';

const cardWidth = Dimensions.get('window').width;
const cardHeight = Dimensions.get('window').height;

const MatchesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [unreadMessages, setUnreadMessages] = useState({});
  const [matches, setMatches] = useState([]);
  const [openedChatrooms, setOpenedChatrooms] = useState([]);
  const chatVal = Number(useSelector(state => state.chatVal));

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const usersCollection = collection(db, 'profiles');
        const currentUser = auth.currentUser;

        // Query for documents where the 'likes' array contains the current user's ID
        const likesQuery = query(usersCollection, where('likes', 'array-contains', currentUser.uid));
        const likesSnapshot = await getDocs(likesQuery);
        const likesUsers = likesSnapshot.docs.map((doc) => {
          const data = doc.data();
          // Exclude the datePickerValue field
          const { datePickerValue, ...restOfData } = data;
          return { id: doc.id, ...restOfData };
        });

        // Query for documents where the 'likedBy' array contains the current user's ID
        const likedByQuery = query(usersCollection, where('likedBy', 'array-contains', currentUser.uid));
        const likedBySnapshot = await getDocs(likedByQuery);
        const likedByUsers = likedBySnapshot.docs.map((doc) => {
          const data = doc.data();
          // Exclude the datePickerValue field
          const { datePickerValue, ...restOfData } = data;
          return { id: doc.id, ...restOfData };
        });

        // Combine the results locally
        const matchedUsers = likesUsers.filter((likeUser) =>
          likedByUsers.some((likedByUser) => likedByUser.id === likeUser.id)
        );

        setMatches(matchedUsers);
        dispatch(setMatchesRedux(matchedUsers));
        dispatch(setMatchesCount(matchedUsers.length));
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };

    fetchMatches();
  }, []);

  useEffect(() => {
    matches.forEach((match) => {
      const chatRoomID = [auth.currentUser.uid, match.id].sort().join('_');
      const messagesCollection = collection(db, 'privatechatrooms', chatRoomID, 'messages');

      let unreadCount = 0; // Add this line to initialize the counter

      const unsubscribe = onSnapshot(messagesCollection, (snapshot) => {
        const hasUnread = snapshot.docs.some((doc) => {
          const messageData = doc.data();
          // If the message is unread and was sent by another user, increment the counter
          if (messageData.senderId !== auth.currentUser.uid && !messageData.read) {
            unreadCount++;
          }
          return messageData.senderId !== auth.currentUser.uid && !messageData.read;
        });

        setUnreadMessages((prev) => ({ ...prev, [chatRoomID]: hasUnread }));
        // Dispatch the count to your redux store
      });

      onSnapshot(messagesCollection, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const messageData = change.doc.data();
            // No need to mark the message as read here
          }
        });
      });

      // Clean up the listener when the component unmounts
      return () => unsubscribe();
    });
  }, [matches, dispatch]);

  const renderMatchItem = ({ item }) => {
    const chatRoomID = [auth.currentUser.uid, item.id].sort().join('_');
    return (
      <TouchableOpacity
        style={styles.matchContainer}
        onPress={async () => {
          const chatRoomID = [auth.currentUser.uid, item.id].sort().join('_');
          navigation.navigate('ChatRoom', {
            chatRoomID,
            userId: item.id,
            userName: item.firstName,
          });

          if (!openedChatrooms.includes(chatRoomID)) {
            setOpenedChatrooms([...openedChatrooms, chatRoomID]); // Add the chat room to the list of opened chatrooms
          }

          // Fetch all messages in the chat room
          const messagesSnapshot = await getDocs(collection(db, 'privatechatrooms', chatRoomID, 'messages'));

          // Iterate over all messages
          messagesSnapshot.docs.forEach(async (doc) => {
            const messageData = doc.data();

            // Only mark the message as read if the current user is the receiver
            if (messageData.senderId !== auth.currentUser.uid && !messageData.read) {
              // Use the correct syntax to create a reference to the document
              const messageRef = doc.ref; // Use doc.ref instead of doc
              await updateDoc(messageRef, { read: true });
            }
          });

          // Calculate the new unread count
          const unreadCount = messagesSnapshot.docs.reduce((count, doc) => {
            const messageData = doc.data();
            return messageData.senderId !== auth.currentUser.uid && !messageData.read ? count + 1 : count;
          }, 0);

          // Update chatVal with the new unread count
          dispatch(setUnreadChatroomsCount(unreadCount));
        }}
      >
        {/* Display the circular avatar */}
        <Image
          source={{
            uri:
              item.imageURLs && item.imageURLs.length > 0
                ? item.imageURLs[0]
                : null,
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{item.firstName}</Text>
        {unreadMessages[chatRoomID] && <View style={styles.unreadCircle} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>View all your matches here</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatchItem}
        ListEmptyComponent={<Text style={styles.noMatchesText}>You have no matches.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25, // Make it half of width and height to create a circular shape
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  newMessage: {
    color: 'red',
    fontSize: 12,
  },
  noMatchesText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  unreadCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'black',
    marginLeft: cardWidth / 2, // Adjust this value to control the distance between the circle and the text
  },

});

export default MatchesScreen;
