import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button } from 'react-native';
import { collection, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';

const LikesScreen = ({ navigation }) => {
  const [likedUsers, setLikedUsers] = useState([]);
  const { user } = getAuth();
  const [currentUserId, setCurrentUserId] = useState(user?.uid || null);

  useEffect(() => {
    const fetchLikedUsers = async () => {
      try {
        const currentUserDocRef = doc(db, 'profiles', currentUserId);
        const currentUserDocSnapshot = await getDocs(currentUserDocRef);
        const currentUserData = currentUserDocSnapshot.data();

        if (currentUserData && currentUserData.likes) {
          const likedUsersIds = currentUserData.likes;
          const likedUsersPromises = likedUsersIds.map(async (userId) => {
            const likedUserDocRef = doc(db, 'profiles', userId);
            const likedUserDocSnapshot = await getDocs(likedUserDocRef);
            return likedUserDocSnapshot.data();
          });

          const likedUsersData = await Promise.all(likedUsersPromises);
          setLikedUsers(likedUsersData.filter(Boolean)); // Filter out null values
        } else {
          setLikedUsers([]);
        }
      } catch (error) {
        console.error('Error fetching liked users:', error);
      }
    };

    if (currentUserId) {
      fetchLikedUsers();
    }
  }, [currentUserId]);

  return (
    <View>
      {likedUsers.length > 0 ? (
        likedUsers.map((likedUser) => (
          <View key={likedUser.id}>
            <Text>Name: {likedUser.name}</Text>
            {/* Add other user profile details here */}
          </View>
        ))
      ) : (
        <Text>No Liked Users</Text>
      )}
    </View>
  );
};

export default LikesScreen;
