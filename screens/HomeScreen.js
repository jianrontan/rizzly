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
import { collection, getDocs, updateDoc, arrayUnion, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import Swiper from 'react-native-swiper';

const { width, height } = Dimensions.get('window');
const cardWidth = width;
const cardHeight = height - 170 ;

const HomeScreen = () => {
  const [users, setUsers] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [swipedUpUsers, setSwipedUpUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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

        setUsers(filteredUsers);
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

      // Move to the next card
      setCurrentIndex((prevIndex) => (prevIndex + 1) % users.length);
    } catch (error) {
      console.error('Error adding like:', error);
    }
  };

  const renderItem = ({ item: user }) => (
    <View style={styles.cardContainer}>
      <Swiper
        style={[styles.swiper]}
        index={0}
        loop={false}
      >
        {user.imageURLs.map((imageUrl, imageIndex) => (
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
              <TouchableOpacity onPress={() => handleLikeClick(user.id)}>
                <Text style={styles.likeButton}>Like</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </Swiper>
    </View>
  );
 
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(user) => user.id}
        renderItem={renderItem}
        pagingEnabled
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
