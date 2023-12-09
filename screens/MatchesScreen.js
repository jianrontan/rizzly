import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import ChatRoomScreen from './ChatRoomScreen'; // Import ChatRoomScreen

const MatchesScreen = ({ navigation }) => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const usersCollection = collection(db, 'profiles');
        const snapshot = await getDocs(usersCollection);
        const usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const currentUser = usersData[0];

        // Filter liked users who also liked the current user
        const matchedUsers = usersData.filter((user) => {
          if (user.likes && user.likedBy) {
            // Check if the current user is in the likedBy array of the liked user
            const likedByCurrentUser = user.likedBy.includes(currentUser.id);

            // Check if the liked user is in the likes array of the current user
            const currentUserLikesLikedUser = currentUser.likes.includes(user.id);

            return likedByCurrentUser && currentUserLikesLikedUser;
          }

          return false;
        });

        setMatches(matchedUsers);
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };

    fetchMatches(); // Call the fetchMatches function when the component mounts
  }, []);

  return (
    <View>
      <Text>Matches Screen</Text>
      {matches.map((match) => (
        <View key={match.id}>
          <Text>Name: {match.name}</Text>
          {/* Display other details of the matched user as needed */}
        </View>
      ))}
      <Button
        title="Go to Chat Room"
        onPress={() => {
          // Navigate to the ChatRoomScreen
          navigation.navigate('ChatRoom', {
            userId: matches[0]?.id, // Pass the user ID to ChatRoomScreen (adjust as needed)
            userName: matches[0]?.name, // Pass the user name to ChatRoomScreen (adjust as needed)
          });
        }}
      />
    </View>
  );
};

export default MatchesScreen;