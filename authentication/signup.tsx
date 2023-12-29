import React, { useState, useRef } from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Input } from 'react-native-elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal, FirebaseRecaptchaBanner } from 'expo-firebase-recaptcha';
import { COLORS, SIZES } from '../constants';

const auth = getAuth();

const SignUp: React.FC<NativeStackScreenProps<any>> = ({navigation}) => {
 const recaptchaVerifier = useRef(null);
 const [phoneNumber, setPhoneNumber] = useState('');
 const [verificationId, setVerificationID] = useState('');
 const [verificationCode, setVerificationCode] = useState('');
 const [info, setInfo] = useState('');
 const attemptInvisibleVerification = false;

 const handleSendVerificationCode = async () => {
  try {
   const phoneProvider = new PhoneAuthProvider(auth);
   // Add the "+65" prefix to the phone number
   const formattedPhoneNumber = "+65" + phoneNumber;
   const verificationId = await phoneProvider.verifyPhoneNumber(
     formattedPhoneNumber,
     recaptchaVerifier.current
   );
   setVerificationID(verificationId);
   setInfo('Success : Verification code has been sent to your phone');
  } catch (error) {
   setInfo(`Error : ${error.message}`);
  }
 };
 

 const handleVerifyVerificationCode = async () => {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
    await signInWithCredential(auth, credential);
    setInfo('Success: Phone authentication successful');
    // Navigate to the "EmailAndPw" screen
    navigation.navigate('EmailAndPw');
  } catch (error) {
    setInfo(`Error : ${error.message}`);
  }
 };
 
 return (
   <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightBeige }}>
     <ScrollView showsVerticalScrollIndicator={false}>
       <View style={{ flex: 1, padding: SIZES.medium, }}>

         <View>
           <Text>Register a new account</Text>
         </View>

         {info && <View><Text>{info}</Text></View>}

         <View>
           <Input
             placeholder='Phone Number'
             value={phoneNumber}
             onChangeText={(text) => setPhoneNumber(text)}
             autoCapitalize='none'
           />

           <TouchableOpacity onPress={handleSendVerificationCode}>
             <Text>Send Verification Code</Text>
           </TouchableOpacity>

           <Input
             placeholder='Verification Code'
             value={verificationCode}
             onChangeText={setVerificationCode}
             secureTextEntry={true}
             autoCapitalize='none'
           />

           <TouchableOpacity onPress={handleVerifyVerificationCode}>
             <Text>Verify Code</Text>
           </TouchableOpacity>

           <FirebaseRecaptchaVerifierModal
           ref={recaptchaVerifier}
           firebaseConfig={{
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
            measurementId: process.env.FIREBASE_MEASUREMENT_ID,
           }}
         />

           {attemptInvisibleVerification && <FirebaseRecaptchaBanner />}
         </View>
       </View>
     </ScrollView>
   </SafeAreaView>
 )
}

export default SignUp;
