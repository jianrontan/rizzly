import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import ChatRoomScreen from '../screens/ChatRoomScreen'; // Import ChatRoomScreen

const MatchesScreen = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null); // State for current user
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const usersCollection = collection(db, 'profiles');
        const snapshot = await getDocs(usersCollection);
        const usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const user = usersData[0]; // Assuming the current user is the first user

        // Filter liked users who also liked the current user
        const matchedUsers = usersData.filter((otherUser) => {
          if (otherUser.likes && otherUser.likedBy) {
            const likedByCurrentUser = otherUser.likedBy.includes(user.id);
            const currentUserLikesOtherUser = user.likes.includes(otherUser.id);
            return likedByCurrentUser && currentUserLikesOtherUser;
          }
          return false;
        });

        setMatches(matchedUsers);
        setCurrentUser(user); // Set the current user
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
          <Button
            title="Go to Chat Room"
            onPress={() => {
              navigation.navigate('ChatRoom', {
                matchedUser: match,
                currentUser: currentUser,
              });
            }}
          />
        </View>
      ))}
    </View>
  );
};

export default MatchesScreen;
