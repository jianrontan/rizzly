import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs, updateDoc, arrayUnion, doc } from 'firebase/firestore';
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
          const userGender = user.gender?.toLowerCase?.();
          const userOrientation = user.orientation?.toLowerCase?.();

          if (currentUserOrientation === 'default') {
            return true;
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
            return true;
          }
        });

        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [currentUserOrientation]);

  const calculateAge = (birthday) => {
    const today = new Date();
    const birthDate = parse(birthday, 'MM/dd/yyyy', new Date());

    if (!isDate(birthDate) || isNaN(birthDate.getTime())) {
      return 'Invalid Date';
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

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

      // Show the next user
      setCurrentIndex((prevIndex) => (prevIndex + 1) % users.length);
    } catch (error) {
      console.error('Error adding like:', error);
    }
  };

  // Access the current user directly
  const user = users[currentIndex];

  return (
    <View style={styles.container}>
      {user && (
        <View key={user.id} style={styles.userContainer}>
          <Image
            source={{ uri: user.imageURLs && user.imageURLs.length > 0 ? user.imageURLs[0] : null }}
            onLoad={() => console.log('Image loaded')}
            onError={(error) => console.log('Error loading image: ', error)}
            style={styles.backgroundImage}
          />
          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userDetails}>{calculateAge(user.birthday)}</Text>
            <Text style={styles.userDetails}>{user.gender}</Text>
          </View>
          <TouchableOpacity style={styles.likeButton} onPress={() => handleLikeClick(user.id)}>
            <Text style={styles.likeButtonText}>✔ Like</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userContainer: {
    position: 'relative',
    width: '100%',
    height: 200, // Set an appropriate height, adjust as needed
    marginBottom: 20,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
    borderRadius: 10,
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
    bottom: 10,
    right: 10,
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 20,
  },
  likeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
