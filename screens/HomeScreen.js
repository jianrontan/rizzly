import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper';
import { collection, getDocs, updateDoc, arrayUnion, doc, getDoc } from 'firebase/firestore';
import { parse, isDate } from 'date-fns';
import { db, auth } from '../firebase/firebase';

const HomeScreen = () => {
  const [users, setUsers] = useState([]);
  const [currentUserOrientation, setCurrentUserOrientation] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersCollection = collection(db, 'profiles');
        const snapshot = await getDocs(usersCollection);
        const usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const currentUser = usersData[0];
        if (currentUser && currentUser.orientation) {
          const { male, female, nonBinary } = currentUser.orientation;

          if (male) setCurrentUserOrientation('male');
          else if (female) setCurrentUserOrientation('female');
          else if (nonBinary) setCurrentUserOrientation('nonBinary');
          else setCurrentUserOrientation('default');
        }

        // Filter users based on both gender and orientation
        const filteredUsers = usersData.filter((user) => {
          const userGender = user.gender?.toLowerCase?.(); // Ensure user.gender is defined before calling toLowerCase
          const userOrientation = user.orientation?.toLowerCase?.(); // Ensure user.orientation is defined before calling toLowerCase

          if (currentUserOrientation === 'default') {
            return true; // Display all users if no specific orientation is set
          }

          if (currentUserOrientation === 'male') {
            return userGender === 'male';
          } else if (currentUserOrientation === 'female') {
            return userGender === 'female';
          } else if (currentUserOrientation === 'nonbinary') {
            return userGender === 'nonbinary';
          } else if (currentUserOrientation === 'maleandfemale') {
            return userGender === 'male' || userGender === 'female';
          } else if (currentUserOrientation === 'femaleandnonbinary') {
            return userGender === 'female' || userGender === 'nonbinary';
          } else if (currentUserOrientation === 'maleandnonbinary') {
            return userGender === 'male' || userGender === 'nonbinary';
          } else {
            return true; // Display all users if no specific criteria match
          }
        });
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(); // Call the fetchData function when the component mounts
  }, [currentUserOrientation]);

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

  return (
    <View style={styles.container}>
      {users.map((user, userIndex) => (
        <View key={`${user.id}-${userIndex}`} style={styles.swiperItem}>
          <Swiper
            style={styles.swiper}
            index={0} // Start from the first image
            loop={false}
          >
            {user.imageURLs.map((imageUrl, imageIndex) => (
              <Image
                key={imageIndex}
                source={{ uri: imageUrl }}
                onLoad={() => console.log('Image loaded')}
                onError={(error) => console.log('Error loading image: ', error)}
                style={styles.image}
              />
            ))}
          </Swiper>
          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userDetails}>{user.gender}</Text>
            <Text style={styles.userAge}>Age: {user.age}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  swiper: {
    height: 200,
  },
  swiperItem: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  userInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  likeButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 20,
  },
  likeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  userAge: {
    color:'white', 
    fontSize: 16,
  }
});

export default HomeScreen;
