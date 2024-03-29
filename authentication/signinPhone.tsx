import React, { useState, useRef } from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Input } from 'react-native-elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal, FirebaseRecaptchaBanner } from 'expo-firebase-recaptcha';
import { COLORS, SIZES, FONT } from '../constants';
import { db } from '../firebase/firebase'

const auth = getAuth();

const SignInPhone: React.FC<NativeStackScreenProps<any>> = ({ navigation }) => {
  const recaptchaVerifier = useRef(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationID] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [info, setInfo] = useState('');
  const attemptInvisibleVerification = false;

  const handleSendVerificationCode = async () => {
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
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
      // Navigate to the appropriate screen after successful sign-in
      navigation.navigate('LoggedInScreen');
    } catch (error) {
      setInfo(`Error : ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#6e4639' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, padding: SIZES.medium }}>

          <View>
            <Text style={{ color: 'white', fontFamily: FONT.regular, padding: SIZES.small }}>Sign In with Phone</Text>
          </View>

          {info && <View><Text style={{ color: 'white' }}>{info}</Text></View>}

          <View>
            <Input
              placeholder='Phone Number'
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(text)}
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
              inputStyle={{ color: 'white', fontFamily: FONT.regular, paddingTop: SIZES.mediumlarge }}
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

export default SignInPhone;
