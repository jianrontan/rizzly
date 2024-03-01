import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, Dimensions } from 'react-native';
import { collection, getDocs, query, where, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { setMatchesCount, setMatchesRedux, setUnreadChatroomsCount } from '../redux/actions';

const cardWidth = Dimensions.get('window').width;
const cardHeight = Dimensions.get('window').height;

const MatchesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [unreadMessages, setUnreadMessages] = useState({});
  const [matches, setMatches] = useState([]);
  const [openedChatrooms, setOpenedChatrooms] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const usersCollection = collection(db, 'profiles');
        const currentUser = auth.currentUser;

        const likesQuery = query(usersCollection, where('likes', 'array-contains', currentUser.uid));
        const likesSnapshot = await getDocs(likesQuery);
        const likesUsers = likesSnapshot.docs.map((doc) => {
          const data = doc.data();
          const { datePickerValue, ...restOfData } = data;
          return { id: doc.id, ...restOfData };
        });

        const likedByQuery = query(usersCollection, where('likedBy', 'array-contains', currentUser.uid));
        const likedBySnapshot = await getDocs(likedByQuery);
        const likedByUsers = likedBySnapshot.docs.map((doc) => {
          const data = doc.data();
          const { datePickerValue, ...restOfData } = data;
          return { id: doc.id, ...restOfData };
        });

        const matchedUsers = likesUsers.filter((likeUser) =>
          likedByUsers.some((likedByUser) => likedByUser.id === likeUser.id)
        );

        const serializableMatches = matchedUsers.map(user => ({
          ...user,
          lastActive: user.lastActive ? new Date(user.lastActive.seconds * 1000).toISOString() : null,
        }));


        setMatches(matchedUsers);
        dispatch(setMatchesRedux(serializableMatches));
        dispatch(setMatchesCount(serializableMatches.length));
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

      let unreadCount = 0;

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
      });

      onSnapshot(messagesCollection, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const messageData = change.doc.data();
          }
        });
      });

      return () => unsubscribe();
    });
  }, [matches, dispatch]);

  const renderMatchItem = ({ item }) => {
    const chatRoomID = [auth.currentUser.uid, item.id].sort().join('_');
    return (
      <TouchableOpacity
        style={unreadMessages[chatRoomID] ? {
          backgroundColor: 'white',
          padding: 10,
          marginVertical: 5,
          borderRadius: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          borderWidth: 4,
          borderColor: 'gold'
        } : {
          backgroundColor: 'white',
          padding: 10,
          marginVertical: 5,
          borderRadius: 10,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5
        }}
        onPress={async () => {
          const chatRoomID = [auth.currentUser.uid, item.id].sort().join('_');
          navigation.navigate('ChatRoom', {
            chatRoomID,
            userId: item.id,
            userFirstName: item.firstName,
          });

          if (!openedChatrooms.includes(chatRoomID)) {
            setOpenedChatrooms([...openedChatrooms, chatRoomID]);
          }

          const messagesSnapshot = await getDocs(collection(db, 'privatechatrooms', chatRoomID, 'messages'));

          messagesSnapshot.docs.forEach(async (doc) => {
            const messageData = doc.data();

            if (messageData.senderId !== auth.currentUser.uid && !messageData.read) {
              const messageRef = doc.ref;
              await updateDoc(messageRef, { read: true });
            }
          });

          // Calculate the new unread count
          const unreadCount = messagesSnapshot.docs.reduce((count, doc) => {
            const messageData = doc.data();
            return messageData.senderId !== auth.currentUser.uid && !messageData.read ? count + 1 : count;
          }, 0);

          dispatch(setUnreadChatroomsCount(unreadCount));
        }}
      >
        <View style={styles.avatarWithNameContainer}>
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
        </View>
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
    backgroundColor: '#6e4639',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  matchContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatarWithNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#D3A042',
    marginLeft: cardWidth / 2,
  },

});

export default MatchesScreen;
