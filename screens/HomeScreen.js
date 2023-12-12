import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button } from 'react-native';
import { collection, getDocs, updateDoc, arrayUnion, doc } from 'firebase/firestore';
import { parse, isDate } from 'date-fns';
import { db, auth } from '../firebase/firebase';

const HomeScreen = () => {
  const [users, setUsers] = useState([]);
  const [currentUserOrientation, setCurrentUserOrientation] = useState('');

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
      // Reference to the clicked user's document
      const likedUserDocRef = doc(db, 'profiles', likedUserId);

      // Update likedBy field in the clicked user's document
      await updateDoc(likedUserDocRef, {
        likedBy: arrayUnion(auth.currentUser.uid),
      });

      // Reference to the current user's document
      const currentUserDocRef = doc(db, 'profiles', auth.currentUser.uid);

      // Update likes field in the current user's document
      await updateDoc(currentUserDocRef, {
        likes: arrayUnion(likedUserId),
      });

      // Remove the liked user from the state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== likedUserId));
    } catch (error) {
      console.error('Error adding like:', error);
    }
  };

  return (
    <View>
      {users.map((user) => (
        <View key={user.id}>
          <Text>Name: {user.name}</Text>
          <Text>Age: {calculateAge(user.birthday)}</Text>
          <Text>Gender: {user.gender}</Text>
          <Text>Image: </Text>
          {user.imageURLs && user.imageURLs.length > 0 && (
            <Image
              source={{ uri: user.imageURLs[0] }}
              onLoad={() => console.log('Image loaded')}
              onError={(error) => console.log('Error loading image: ', error)}
              style={{ width: 100, height: 100 }}
            />
          )}
          <Button
            title="Like"
            onPress={() => handleLikeClick(user.id)}
          />
        </View>
      ))}
    </View>
  );
};

export default HomeScreen;
