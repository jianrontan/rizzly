import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

const MatchesScreen = ({ navigation }) => {
  const [matches, setMatches] = useState([]);

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
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };

    fetchMatches();
  }, []);

  return (
    <View>
      <Text>Matches Screen</Text>
      {matches.map((match) => (
        <TouchableOpacity
          key={match.id}
          style={styles.matchContainer}
          onPress={() => {
            const chatRoomID = [auth.currentUser.uid, match.id].sort().join('_');
            navigation.navigate('ChatRoom', {
              chatRoomID,
              userId: match.id,
              userName: match.name,
            });
          }}
        >
          {/* Display the circular avatar */}
          <Image
            source={{ uri: match.imageURLs && match.imageURLs.length > 0 ? match.imageURLs[0] : null }}
            style={styles.avatar}
          />
          <Text>Name: {match.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

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