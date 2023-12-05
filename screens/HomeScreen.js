import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { parse, isDate } from 'date-fns';
import { db } from '../firebase/firebase';

const HomeScreen = () => {
  const [users, setUsers] = useState([]);
  const [currentUserOrientation, setCurrentUserOrientation] = useState('');

  useEffect(() => {
    const usersCollection = collection(db, 'profiles');

    // Set up a real-time snapshot listener
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Assuming you have a single user and want to get the orientation from that user
      // You may need to adjust this logic based on your actual data structure
      const currentUser = usersData[0];
      if (currentUser && currentUser.orientation) {
        const { male, female, nonBinary } = currentUser.orientation;

        // Determine the currentUserOrientation based on the fetched data
        if (male) {
          setCurrentUserOrientation('male');
        } else if (female) {
          setCurrentUserOrientation('female');
        } else if (nonBinary) {
          setCurrentUserOrientation('nonBinary');
        } else {
          // Handle other cases or set a default orientation
          setCurrentUserOrientation('default');
        }
      }
      
      // Filter users based on orientation
      const filteredUsers = usersData.filter((user) => {
        const isMale = user.orientation.male === true;
        const isFemale = user.orientation.female === true;
        const isNonBinary = user.orientation.nonBinary === true;

        if (currentUserOrientation === 'male') {
          return isMale && user.gender === 'male';
        } else if (currentUserOrientation === 'female') {
          return isFemale && user.gender === 'female';
        } else if (currentUserOrientation === 'nonBinary') {
          return isNonBinary;
        } else if (currentUserOrientation === 'maleAndfemale') {
          return isMale || isFemale;
        } else if (currentUserOrientation === 'maleAndnonBinary'){
          return isMale || isNonBinary;
        } else if (currentUserOrientation === 'femaleAndnonBinary') {
          return isFemale || isNonBinary; 
        } else {
          return true; 
        }
      });

      setUsers(filteredUsers);
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [currentUserOrientation]);

  const calculateAge = (birthday) => {
    const today = new Date();
    const birthDate = parse(birthday, 'MM/dd/yyyy', new Date());

    if (!isDate(birthDate) || isNaN(birthDate.getTime())) {
      // Handle invalid date
      return 'Invalid Date';
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  return (
    <View>
      {users.map((user) => (
        <View key={user.id}>
          <Text>Name: {user.name}</Text>
          <Text>Age: {calculateAge(user.birthday)}</Text>
          <Text>Gender: {user.gender}</Text>
          {/* Display the image only if imageURL is available */}
          <Text>Image: </Text>
          {user.imageURLs && user.imageURLs.length > 0 && (
            <Image 
              source={{ uri: user.imageURLs[0] }} 
              onLoad={() => console.log('Image loaded')}
              onError={(error) => console.log('Error loading image: ', error)}
            />
          )}
          {/* Add other user information */}
        </View>
      ))}
    </View>
  );
};
export default HomeScreen;