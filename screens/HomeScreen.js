import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { collection, getDocs, updateDoc, arrayUnion, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import SwipeCards from 'react-native-swipe-cards-deck';
import ViewPropTypes from 'deprecated-react-native-prop-types';

const { width, height } = Dimensions.get('window');
const cardWidth = width;
const cardHeight = height;

const HomeScreen = () => {
  const [users, setUsers] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [swipedUpUsers, setSwipedUpUsers] = useState([]);

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
        filteredUsers = filteredUsers.filter(user => user.id !== auth.currentUser.uid && !swipedUpUsers.includes(user.id));

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

    } catch (error) {
      console.error('Error adding like:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <SwipeCards
        cards={users.flatMap((user) =>
          user.imageURLs.map((imageUrl) => ({
            image: imageUrl,
            name: user.name,
            details: `${user.gender}, Age: ${user.age}`,
            userId: user.id,
          }))
        )}
        renderCard={(card) => (
          <View style={styles.cardContainer}>
            <Image
              source={{ uri: card.image }}
              onLoad={() => console.log('Image loaded')}
              onError={(error) => console.log('Error loading image: ', error)}
              style={styles.image}
            />
            <View style={styles.userInfoContainer}>
              <Text style={styles.userName}>{card.name}</Text>
              <Text style={styles.userDetails}>{card.details}</Text>
              <TouchableOpacity onPress={() => handleLikeClick(card.userId)}>
                <Text style={styles.likeButton}>Like</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        containerStyle={styles.swipeCardsContainer}
        renderNoMoreCards={() => (
          <View style={styles.noMoreUsers}>
            <Text style={styles.noMoreUsersText}>No more users left</Text>
          </View>
        )}
        stackSize={3}
        animateOverlayLabelsOpacity
        animateCardOpacity
        smoothTransition
        stackSeparation={15}
        overlayLabels={{
          top: {
            title: 'DISLIKE',
            style: {
              label: {
                backgroundColor: 'red',
                borderColor: 'black',
                color: 'white',
                borderWidth: 1,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              },
            },
          },
        }}
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
