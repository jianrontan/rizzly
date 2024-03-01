import React, { useState, useRef } from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Input } from 'react-native-elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal, FirebaseRecaptchaBanner } from 'expo-firebase-recaptcha';
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { COLORS, SIZES, FONT } from '../constants';
import { db } from '../firebase/firebase'
import AsyncStorage from '@react-native-async-storage/async-storage';

const auth = getAuth()

const SignUpPhone: React.FC<NativeStackScreenProps<any>> = ({ navigation }) => {
  const recaptchaVerifier = useRef(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAdd, setEmailAdd] = useState('');
  const [verificationId, setVerificationID] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [info, setInfo] = useState('');
  const attemptInvisibleVerification = false;

  const handleSendVerificationCode = async () => {
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const formattedPhoneNumber = "+65" + phoneNumber;

      // Check if user with this phone number already exists
      const q = query(collection(db, "users"), where("phoneNumber", "==", formattedPhoneNumber));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setInfo('Error : User with this phone number already exists');
        return;
      }

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

      // Retrieve the email from local storage
      const storedEmail = await AsyncStorage.getItem('@email');
      if (storedEmail !== null) {
        const userId = auth.currentUser.uid; 
        await setDoc(doc(db, "emails", userId), { email: storedEmail });
      }

    } catch (error) {
      setInfo(`Error : ${error.message}`);
    }
  };

  const saveEmail = async (email) => {
    try {
      await AsyncStorage.setItem('@email', email);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#6e4639' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, padding: SIZES.medium, }}>

        <View>
            <Text style={{ color: 'white', fontFamily: FONT.regular, padding: SIZES.small }}>Register a new account</Text>
          </View>

          {info && <View><Text style={{ color: 'white', fontFamily: FONT.regular }}>{info}</Text></View>}

          <View>
            <Input
              placeholder='Phone Number'
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(text)}
              autoCapitalize='none'
              inputStyle={{ color: 'white', fontFamily: FONT.regular }}
            />

            <Input
              placeholder='Email Address'
              value={emailAdd}
              onChangeText={(text) => {
                setEmailAdd(text);
                saveEmail(text);
              }}
              autoCapitalize='none'
              inputStyle={{ color: 'white', fontFamily: FONT.regular }}
            />

            <TouchableOpacity onPress={handleSendVerificationCode} style={{ backgroundColor: '#D3A042', borderRadius: SIZES.small, padding: SIZES.small, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontFamily: FONT.regular }}>Send Verification Code</Text>
            </TouchableOpacity>

            <Input
              placeholder='Verification Code'
              value={verificationCode}
              onChangeText={setVerificationCode}
              secureTextEntry={true}
              autoCapitalize='none'
              inputStyle={{ color: 'white', fontFamily: FONT.regular, paddingTop: SIZES.medium }}
            />

            <TouchableOpacity onPress={handleVerifyVerificationCode} style={{ backgroundColor: '#D3A042', borderRadius: SIZES.small, padding: SIZES.small, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontFamily: FONT.regular }}>Verify Code</Text>
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

export default SignUpPhone;
