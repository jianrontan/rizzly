import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, FlatList } from 'react-native';
import { collection, getDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { setLikes } from '../redux/actions';
import { onSnapshot } from 'firebase/firestore';
import { StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';

const LikesScreen = () => {
  const dispatch = useDispatch();
  const [likedUsersData, setLikedUsersData] = useState([]);
  const auth = getAuth();
  const [currentUserId, setCurrentUserId] = useState(auth.currentUser?.uid || null);

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('No notification permissions!');
      return;
    }
  };

  useEffect(() => {
    requestNotificationPermission();

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);

  useEffect(() => {
    let lastLikesCount = 0;

    const unsubscribe = onSnapshot(doc(db, 'profiles', currentUserId), (doc) => {
      const currentUserData = doc.data();
      const currentLikesCount = currentUserData?.likedBy?.length || 0;

      // Check if the number of likes has increased
      if (currentLikesCount > lastLikesCount) {
        // Schedule or send a notification
        Notifications.scheduleNotificationAsync({
          content: {
            title: 'New Like',
            body: 'Someone just liked your profile!',
          },
          trigger: null, // Trigger immediately
        });
      }

      lastLikesCount = currentLikesCount; // Update the last known likes count

      // Update the likes count in Redux store
      dispatch(setLikes(currentLikesCount));
    }, { includeMetadataChanges: true });

    return unsubscribe;
  }, [currentUserId, dispatch]);


  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'profiles', currentUserId), (doc) => {
      const currentUserData = doc.data();

      // Update the likes count in Redux store
      dispatch(setLikes(currentUserData?.likedBy?.length || 0));
    }, { includeMetadataChanges: true });

    return unsubscribe;
  }, [currentUserId, dispatch]);

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

            // Update the likes count in Redux store
            dispatch(setLikes(likedUsersIds.length));

            return {
              firstName: likedUserData?.firstName || 'N/A',
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
  }, [currentUserId, dispatch]);

  const renderItem = ({ item }) => (
    <View style={styles.userCard}>
      <Text style={styles.usernameText}>Username: {item.firstName}</Text>
      <Image
        source={{ uri: item.imageURL }}
        style={styles.userImage}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {likedUsersData.length > 0 ? (
        <FlatList
          data={likedUsersData}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <Text style={styles.noLikedText}>No Liked Users</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6e4639', // Light background color that complements the bear theme
    padding: 16,
  },
  userCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF', // White card with a bear-themed border or shadow
    borderRadius: 10,
    padding: 16,
    elevation: 3, // For Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  usernameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333', // Dark text for readability
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50, // Rounded corners for a softer look
    marginTop: 8,
  },
  noLikedText: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#999999', // Soft gray for less prominent text
  },
});

export default LikesScreen;