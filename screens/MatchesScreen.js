import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { collection, getDocs, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from 'expo-router';
import { setHasUnreadChats, setMatchesRedux } from '../redux/actions';
import { setMatchesCount } from '../redux/actions';

const MatchesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [unreadMessages, setUnreadMessages] = useState({});
  const [matches, setMatches] = useState([]);
  const hasUnreadChats = useSelector((state) => state.hasUnreadChats)

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const usersCollection = collection(db, 'profiles');
        const currentUser = auth.currentUser;

        // Query for documents where the 'likes' array contains the current user's ID
        const likesQuery = query(usersCollection, where('likes', 'array-contains', currentUser.uid));
        const likesSnapshot = await getDocs(likesQuery);
        const likesUsers = likesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Query for documents where the 'likedBy' array contains the current user's ID
        const likedByQuery = query(usersCollection, where('likedBy', 'array-contains', currentUser.uid));
        const likedBySnapshot = await getDocs(likedByQuery);
        const likedByUsers = likedBySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

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
  }, [dispatch]);

  useEffect(() => {
    const unreadChatsCount = Object.values(unreadMessages).reduce((count, hasUnread) => {
      return hasUnread ? count + 1 : count;
    }, 0);

    dispatch(setHasUnreadChats(unreadChatsCount));
  }, [unreadMessages, dispatch]);

  useEffect(() => {
    matches.forEach((match) => {
      const chatRoomID = [auth.currentUser.uid, match.id].sort().join('_');
      const messagesCollection = collection(db, 'privatechatrooms', chatRoomID, 'messages');

      const unsubscribe = onSnapshot(messagesCollection, (snapshot) => {
        const hasUnread = snapshot.docs.some((doc) => {
          const messageData = doc.data();
          return messageData.senderId !== auth.currentUser.uid && !messageData.read;
        });

        setUnreadMessages((prev) => ({ ...prev, [chatRoomID]: hasUnread }));
      });

      onSnapshot(messagesCollection, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const messageData = change.doc.data();
            if (messageData.senderId === auth.currentUser.uid && !messageData.read) {
              const messageRef = doc(db, 'privatechatrooms', chatRoomID, 'messages', change.doc.id);
              updateDoc(messageRef, { read: true });
            }
          }
        });
      });

      // Delay the calculation of unreadChatsCount
      setTimeout(() => {
        const unreadChatsCount = Object.values(unreadMessages).reduce((count, hasUnread) => {
          return hasUnread ? count + 1 : count;
        }, 0);

        dispatch(setHasUnreadChats(unreadChatsCount));
      }, 1000); // Adjust the delay as needed

      // Clean up the listener when the component unmounts
      return () => unsubscribe();
    });
  }, [matches]);

  return (
    <View>
      <Text>Matches Screen</Text>
      {matches.map((match) => {
        const chatRoomID = [auth.currentUser.uid, match.id].sort().join('_');
        return (
          <TouchableOpacity
            key={match.id}
            style={styles.matchContainer}
            onPress={async () => {
              const chatRoomID = [auth.currentUser.uid, match.id].sort().join('_');
              navigation.navigate('ChatRoom', {
                chatRoomID,
                userId: match.id,
                userName: match.name,
              });

              // Fetch all messages in the chat room
              const messagesSnapshot = await getDocs(collection(db, 'privatechatrooms', chatRoomID, 'messages'));

              // Iterate over all messages
              messagesSnapshot.docs.forEach(async (doc) => {
                const messageData = doc.data();

                if (messageData.senderId !== auth.currentUser.uid && !messageData.read) {
                  // Use the correct syntax to create a reference to the document
                  const messageRef = doc.ref;  // Use doc.ref instead of doc
                  await updateDoc(messageRef, { read: true });
                }
              });
            }}
          >
            {/* Display the circular avatar */}
            <Image
              source={{
                uri:
                  match.imageURLs && match.imageURLs.length > 0
                    ? match.imageURLs[0]
                    : null,
              }}
              style={styles.avatar}
            />
            <Text>{match.name}</Text>
            {unreadMessages[chatRoomID] && <Text style={{ color: 'red', fontSize: 30 }}> You have a new message </Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25, // Make it half of width and height to create a circular shape
    marginRight: 10,
  },
});

export default MatchesScreen;