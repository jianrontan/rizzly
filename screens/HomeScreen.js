import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  collection,
  getDocs,
  updateDoc,
  arrayUnion,
  doc,
  getDoc,
} from 'firebase/firestore';
import { parse, isDate } from 'date-fns';
import { db, auth } from '../firebase/firebase';
import { useAuthentication } from '../hooks/useAuthentication';

const HomeScreen = () => {
  const { user, loading } = useAuthentication();
  const [users, setUsers] = useState([]);
  const [currentUserOrientation, setCurrentUserOrientation] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!loading) {
      if (user) {
        const userId = user.uid;
        const fetchData = async () => {
          try {
            // Fetch the authenticated user's profile
            const userDoc = doc(db, 'profiles', userId);
            const userSnapshot = await getDoc(userDoc);
            const currentUserData = userSnapshot.exists()
              ? { id: userSnapshot.id, ...userSnapshot.data() }
              : null;

            if (currentUserData && currentUserData.orientation) {
              setCurrentUserOrientation(currentUserData.orientation);
            }

            // Fetch all profiles
            const usersCollection = collection(db, 'profiles');
            const snapshot = await getDocs(usersCollection);
            const usersData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            // Filter usersData to only include profiles that contain all the required fields
            const completeUsersData = usersData.filter(user =>
              user.imageURLs && user.name && user.gender && user.birthday
            );

            // Filter users based on both gender and orientation
            const filteredUsers = completeUsersData.filter((user) => {
              const userGender = user.gender?.toLowerCase?.(); // Ensure user.gender is defined before calling toLowerCase
              const userOrientation = user.orientation?.toLowerCase?.(); // Ensure user.orientation is defined before calling toLowerCase

              if (currentUserOrientation === 'default') {
                return true; // Display all users if no specific orientation is set
              }

              // Modify the logic to compare with the authenticated user's orientation
              if (currentUserOrientation === 'male') {
                return userOrientation === 'male';
              } else if (currentUserOrientation === 'female') {
                return userOrientation === 'female';
              } else if (currentUserOrientation === 'nonbinary') {
                return userOrientation === 'nonbinary';
              } else if (currentUserOrientation === 'maleandfemale') {
                return userOrientation === 'male' || userOrientation === 'female';
              } else if (currentUserOrientation === 'femaleandnonbinary') {
                return userOrientation === 'female' || userOrientation === 'nonbinary';
              } else if (currentUserOrientation === 'maleandnonbinary') {
                return userOrientation === 'male' || userOrientation === 'nonbinary';
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
      } else {
        console.log("User is not logged in.")
      }
    }
  }, [user, currentUserOrientation]);

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

      setCurrentIndex((prevIndex) => (prevIndex + 1) % users.length);
    } catch (error) {
      console.error('Error adding like:', error);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollViewContainer}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onScroll={(event) => {
        const offset = event.nativeEvent.contentOffset.x;
        const index = Math.round(offset / styles.scrollViewContainer.width);
        setCurrentIndex(index);
      }}
    >
      {users.map((user) => (
        <View key={user.id} style={styles.scrollViewItem}>
          {user?.imageURLs?.length > 1 ? (
            <ScrollView
              style={styles.photoScrollView}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
            >
              {user.imageURLs.map((imageUrl, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image
                    source={{ uri: imageUrl }}
                    onLoad={() => console.log('Image loaded')}
                    onError={(error) => console.log('Error loading image: ', error)}
                    style={styles.photo}
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <Image
              source={{ uri: user.imageURLs[0] }}
              onLoad={() => console.log('Image loaded')}
              onError={(error) => console.log('Error loading image: ', error)}
              style={styles.image}
            />
          )}
          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userDetails}>{user.gender}</Text>
            <Text style={styles.userDetails}>Age: {calculateAge(user.birthday)}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexDirection: 'row',
  },
  scrollViewItem: {
    width: '100%',
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
  photoScrollView: {
    height: '100%',
  },
  photoContainer: {
    flex: 1,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});

export default HomeScreen;
