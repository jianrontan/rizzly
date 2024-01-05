import React, { useEffect, useState } from 'react';
import {
 View,
 Text,
 Image,
 StyleSheet,
 SafeAreaView,
 TouchableOpacity,
 FlatList,
 Dimensions,
} from 'react-native';
import { collection, getDocs, updateDoc, arrayUnion, doc, getDoc, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import Swiper from 'react-native-swiper';
import { Swipeable } from 'react-native-gesture-handler';
import NoMoreUserScreen from './NoMoreUserScreen';
import * as Notifications from 'expo-notifications';

const { width, height } = Dimensions.get('window');
const cardWidth = width;
const cardHeight = height - 170 ;

const HomeScreen = () => {
 const [users, setUsers] = useState([]);
 const [currentUserData, setCurrentUserData] = useState(null);
 const [swipedUpUsers, setSwipedUpUsers] = useState([]);
 const [scrollOffset, setScrollOffset] = useState(0);
 const [previousIndex, setPreviousIndex] = useState(0);
 const [fetchedUsers, setFetchedUsers] = useState([]);
 const [pushToken, setPushToken] = useState(null);

 useEffect(() => {
  const requestUserPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
   
    const result = await Notifications.getExpoPushTokenAsync({
      projectId: 'b14252fb-4683-43e0-a451-f25c756a7bd5'
    });
    setPushToken(result.data);
   };
 requestUserPermission();
 }, []);
 
 useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const currentUserDocRef = doc(db, 'profiles', auth.currentUser.uid);
      const currentUserDoc = await getDoc(currentUserDocRef);

      if (currentUserDoc.exists()) {
        setCurrentUserData(currentUserDoc.data());
      }
    } catch (error) {
      console.error('Error fetching current user data:', error);
    }
  };

  fetchCurrentUser();
 }, []);

 useEffect(() => {
  const fetchData = async () => {
    try {
      const usersCollection = collection(db, 'profiles');
      const snapshot = await getDocs(usersCollection);
      let usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
 
      // Filter users based on gender and current user's orientation
      let filteredUsers = usersData.filter((user) => {
        const userGender = user.gender?.toLowerCase?.();
 
        if (currentUserData && currentUserData.orientation) {
          const { male, female, nonBinary } = currentUserData.orientation;
 
          if (userGender === 'female' && female) {
            return true;
          } else if (userGender === 'male' && male) {
            return true;
          } else if (userGender === 'nonbinary' && nonBinary) {
            return true;
          } else {
            return false;
          }
        }
 
        return true;
      });
 
      // Exclude the current user and swiped up users from the list
      filteredUsers = filteredUsers.filter(
        (user) => user.id !== auth.currentUser.uid && !swipedUpUsers.includes(user.id)
      );
 
      // Always include the "No More Users" item at the end of the users array
      setUsers([...filteredUsers ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
 
  fetchData();
 }, [currentUserData, swipedUpUsers]);
 
 const handleLikeClick = async (likedUserId) => {
  try {
   const likedUserDocRef = doc(db, 'profiles', likedUserId);
 
   await updateDoc(likedUserDocRef, {
     likedBy: arrayUnion(auth.currentUser.uid),
   });
 
   const currentUserDocRef = doc(db, 'profiles', auth.currentUser.uid);
 
   await updateDoc(currentUserDocRef, {
     likes: arrayUnion(likedUserId),
   });
 
   // Send a notification to the current user
   await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: likedUserId,
      data: { type: 'NEW_LIKE' },
      title: 'New Like',
      body: `${auth.currentUser.displayName} liked your profile!`,
    }),
  });
 
   // Remove the liked user from the users array
   setUsers((prevUsers) => prevUsers.filter((user) => user.id !== likedUserId));
  } catch (error) {
   console.error('Error adding like:', error);
  }
 };
 

 const handleDislikeClick = async (dislikedUserId) => {
  try {
   const currentUserDocRef = doc(db, 'profiles', auth.currentUser.uid);
 
   // Add the disliked user to the current user's document
   await updateDoc(currentUserDocRef, {
     dislikes: arrayUnion(dislikedUserId),
   });
 
   // Add the disliked user to the swipedUpUsers array
   setSwipedUpUsers((prevSwipedUpUsers) => [...prevSwipedUpUsers, dislikedUserId]);
 
   // After 10 seconds, remove the disliked user from the current user's document
   setTimeout(async () => {
     await updateDoc(currentUserDocRef, {
       dislikes: arrayRemove(dislikedUserId),
     });
 
     // Also remove the disliked user from the swipedUpUsers array
     setSwipedUpUsers((prevSwipedUpUsers) => prevSwipedUpUsers.filter(userId => userId !== dislikedUserId));
   }, 10000);
  } catch (error) {
   console.error('Error adding dislike:', error);
  }
 };
 

 const handleScroll = (event) => {
  const offsetY = event.nativeEvent.contentOffset.y;

  // Calculate the current index based on the scroll offset
  const currentIndex = Math.round(offsetY / cardHeight);

  // If the current index is greater than the previous index, it means the user has swiped to the next user
  if (currentIndex > previousIndex) {
    const dislikedUserId = users[previousIndex]?.id;

    if (dislikedUserId) {
      handleDislikeClick(dislikedUserId);
    }
  }

  // Update the previous index and scroll offset
  setPreviousIndex(currentIndex);
  setScrollOffset(offsetY);
 };
 
 const renderItem = ({ item: user }) => {
  if (user.id === 'no-more-users') {
    return (
      <View style={{ width: cardWidth, height: cardHeight }}>
        <NoMoreUserScreen />
      </View>
    );
  }

  const allImages = user.selfieURLs ? [user.selfieURLs, ...user.imageURLs] : user.imageURLs;

  return (
    <Swipeable
      onSwipeableRightComplete={() => handleDislikeClick(user.id)}
    >
      <View style={styles.cardContainer}>
        <Swiper
          style={[styles.swiper]}
          index={0}
          loop={false}
        >
          {allImages.map((imageUrl, imageIndex) => (
            <View key={imageIndex} style={{ flex: 1 }}>
              <Image
                source={{ uri: imageUrl }}
                onLoad={() => console.log('Image loaded')}
                onError={(error) => console.log('Error loading image: ', error)}
                style={styles.image}
              />
              <View style={styles.userInfoContainer}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userDetails}>{`${user.gender}, Age: ${user.age}`}</Text>
                <Text style={styles.userDetails}>Number of retakes: {user.retakes} </Text>
                <TouchableOpacity onPress={() => handleLikeClick(user.id)}>
                  <Text style={styles.likeButton}>Like</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Swiper>
      </View>
    </Swipeable>
  );
};

   return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(user) => user.id}
        renderItem={renderItem}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onEndReached={() => {
          if (users[users.length - 1]?.id !== 'no-more-users') {
            setUsers((prevUsers) => [...prevUsers, { id: 'no-more-users' }]);
          }
         }}             
        onEndReachedThreshold={0} // Adjust this value according to your needs
        pagingEnabled // Add this line
      />
    </SafeAreaView>
   );
   
 };

 const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  likeButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'green',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    color: 'white',
  },

  swiperItem: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'white', // Set the background color of the cards
    width: cardWidth,
    height: cardHeight,
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
  },
  userInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    color: 'white',
    fontSize: 16,
  },
  userAge: {
    color: 'white',
    fontSize: 16,
  },
});

export default HomeScreen;