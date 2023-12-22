import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import Swiper from 'react-native-swiper';
import { collection, getDocs, updateDoc, arrayUnion, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

const HomeScreen = () => {
  const [users, setUsers] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);

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
        const usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Filter users based on gender and current user's orientation
        const filteredUsers = usersData.filter((user) => {
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

        // Exclude the current user from the filtered list
        const filteredUsersWithoutCurrentUser = filteredUsers.filter(user => user.id !== auth.currentUser.uid);

        setUsers(filteredUsersWithoutCurrentUser);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [currentUserData]);

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

    } catch (error) {
      console.error('Error adding like:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.swiperItem}>
      <Swiper
        style={styles.swiper}
        index={0}
        loop={false}
      >
        {item.imageURLs.map((imageUrl, imageIndex) => (
          <View key={imageIndex}>
            <Image
              source={{ uri: imageUrl }}
              onLoad={() => console.log('Image loaded')}
              onError={(error) => console.log('Error loading image: ', error)}
              style={styles.image}
            />
            <View style={styles.userInfoContainer}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userDetails}>{item.gender}</Text>
              <Text style={styles.userAge}>Age: {item.age}</Text>
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
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  swiperItem: {
    flex: 1,
  },
  swiper: {
    height: '100%', // Adjusted to take 80% of the screen
  },
  image: {
    width: '100%',
    height: '80%', // Adjusted to take 100% of the swiper
  },
  userInfoContainer: {
    height: '20%', // Adjusted to take 20% of the screen
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
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
