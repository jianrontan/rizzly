import React, { useState } from 'react';
import { TextInput, Button, View } from 'react-native';
import { getAuth } from 'firebase/auth';
import bcrypt from 'bcryptjs';
import { doc, setDoc } from 'firebase/firestore'; 
import { db } from '../firebase/firebase';


const EmailPasswordScreen = () => {
 const [value, setValue] = useState({
  email: '',
  password: '',
  confirmPassword: '',
  error: ''
 });

 const handleUpdateProfile = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
 
  if (!user) {
    console.log("No user is signed in.");
    return;
  }
 
  try {
    await user.updateEmail(value.email);
    await user.updatePassword(value.password);
    console.log("Email and password updated successfully");
 
    // Hash the password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(value.password, salt);
 
    // Store the hashed password in Firestore
    await setDoc(doc(db, 'profiles', user.uid), { password: hashedPassword });
    console.log("Password hashed and stored successfully");
  } catch (error) {
    console.error("Failed to update email and password", error);
  }
 }; 

 return (
 <View>
   <TextInput
     placeholder="Email"
     value={value.email}
     onChangeText={(text) => setValue({...value, email: text})}
   />
   <TextInput
     placeholder="Password"
     value={value.password}
     onChangeText={(text) => setValue({...value, password: text})}
     secureTextEntry
   />
   <TextInput
     placeholder="Confirm Password"
     value={value.confirmPassword}
     onChangeText={(text) => setValue({...value, confirmPassword: text})}
     secureTextEntry
   />
   {value.error && <Text>{value.error}</Text>}
   <Button title="Update Profile" onPress={handleUpdateProfile} />
 </View>
 );
};

export default EmailPasswordScreen;
