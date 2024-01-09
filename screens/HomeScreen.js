import React, { useEffect, useState } from 'react';
import {
 View,
 Text,
 Image,
Modal,
 Button,
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
import { Feather } from '@expo/vector-icons';


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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0)

  function toRadians(degrees) {
    return degrees * Math.PI / 180;
   }
   
   function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
   
    const a =
     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
     Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
   
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
   
    let distance = R * c; // Distance in kilometers
   
    // Round to the nearest 0.1 km
    distance = Math.round(distance * 10) / 10;
   
    // If distance is 0, return '<1 km'
    if (distance <= 1) {
     return '<1';
    }
   
    return distance;
   }   

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
  const newIndex = Math.round(offsetY / cardHeight);

  // If the current index is greater than the previous index, it means the user has swiped to the next user
  if (newIndex > currentIndex) {
    const dislikedUserId = users[currentIndex]?.id;

    if (dislikedUserId) {
      handleDislikeClick(dislikedUserId);
    }
  }

  // Update the previous index and scroll offset
  setCurrentIndex(newIndex);
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
                <Text style={styles.userName}>{user.name || 'No name'}</Text>
                <Text style={styles.userDetails}>{`${user.gender || 'No gender'}, Age: ${user.age || 'No age'}`}</Text>
                <Text style={styles.userDetails}>Number of retakes: {user.retakes || 'No retakes'} </Text>
                <Text style={styles.userDetails}>Bio: {user.bio || 'No bio'} </Text>
                <Text style={styles.userDetails}>Location: {user.location || 'No Location'} </Text>
                <TouchableOpacity onPress={() => handleLikeClick(user.id)}>
                  <Text style={styles.likeButton}>Like</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Swiper>
<TouchableOpacity onPress={() => {
          setSelectedUser(user); // Pass the user object directly
          setModalVisible(true);
          }}>
          <Feather name="chevron-up" size={30} color="white" style={styles.arrowIcon} />
          </TouchableOpacity>
          <Modal animationType="slide" transparent={true} visible={modalVisible}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
            {selectedUser && (
              <>
                <Text style={styles.modalinfo}>{selectedUser.name || 'No name'}</Text>
                <Text style={styles.modalinfo}>{`${selectedUser.gender || 'No gender'}, Age: ${selectedUser.age || 'No age'}`}</Text>
                <Text style={styles.modalinfo}>Number of retakes: {selectedUser.retakes || 'No retakes'} </Text>
                <Text style={styles.modalinfo}>Bio: {selectedUser.bio || 'No bio'} </Text>
                <Text style={styles.modalinfo}>Location: {selectedUser.location || 'No location'}</Text>
                <Text style={styles.modalinfo}>Distance: ~{haversineDistance(currentUserData.latitude, currentUserData.longitude, selectedUser.latitude, selectedUser.longitude)}km</Text>
              </>
            )}
              <Button title="Close Modal" onPress={() => {
                setModalVisible(false);
                setSelectedUser(null);
              }} />
            </View>
          </View>
        </Modal>
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
        onEndReachedThreshold={0}
        pagingEnabled
      />
    </SafeAreaView>
   );
   }

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
modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: cardHeight,
    width: cardWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    height: cardHeight, 
    width: cardWidth,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  arrowIcon: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  modalinfo: {
    color:'black',
    fontSize: 16,
  }
});

export default HomeScreen;
