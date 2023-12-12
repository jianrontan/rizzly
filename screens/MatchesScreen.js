// MatchesScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
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
        <View key={match.id}>
          <Text>Name: {match.name}</Text>
          <Button
            title={`Chat with ${match.name}`}
            onPress={() => {
              const chatRoomID = [auth.currentUser.uid, match.id].sort().join('_');
              navigation.navigate('ChatRoom', {
                chatRoomID,
                userId: match.id,
                userName: match.name,
              });
            }}
          />
        </View>
      ))}
    </View>
  );
};

export default MatchesScreen;
