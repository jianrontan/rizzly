import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { collection, getDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';

const LikesScreen = () => {
  const [likedUsersData, setLikedUsersData] = useState([]);
  const auth = getAuth();
  const [currentUserId, setCurrentUserId] = useState(auth.currentUser?.uid || null);

  useEffect(() => {
    const fetchLikedUsersData = async () => {
      try {
        if (!currentUserId) {
          console.log('No user logged in ');
          return;
        }

        const currentUserDocRef = doc(db, 'profiles', currentUserId);
        const currentUserDocSnapshot = await getDoc(currentUserDocRef);
        const currentUserData = currentUserDocSnapshot.data();

        if (currentUserData && currentUserData.likedBy && currentUserData.likedBy.length > 0) {
          const likedUsersIds = currentUserData.likedBy || [];
          const likedUsersDataPromises = likedUsersIds.map(async (userId) => {
            const likedUserDocRef = doc(db, 'profiles', userId);
            const likedUserDocSnapshot = await getDoc(likedUserDocRef);
            const likedUserData = likedUserDocSnapshot.data();

            // Get the first image URL from the liked user's imageURLs
            const firstImageURL = likedUserData?.imageURLs?.[0];

            return {
              name: likedUserData?.name || 'N/A',
              imageURL: firstImageURL || 'N/A',
            };
          });

          const likedUsersData = await Promise.all(likedUsersDataPromises);
          setLikedUsersData(likedUsersData);
        } else {
          setLikedUsersData([]);
        }
      } catch (error) {
        console.error('Error fetching liked users data:', error);
      }
    };

    fetchLikedUsersData();
  }, [currentUserId]);


  return (
    <View>
      {likedUsersData.length > 0 ? (
        likedUsersData.map((user, index) => (
          <View key={index}>
            <Text>Username: {user.name}</Text>
            <Image
              source={{ uri: user.imageURL }}
              style={{ width: 100, height: 100 }} // Add your desired styling here
            />
          </View>
        ))
      ) : (
        <Text>No Liked Users</Text>
      )}
    </View>
  );
};

export default LikesScreen;