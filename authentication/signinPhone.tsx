import React, { useState, useRef } from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Input } from 'react-native-elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal, FirebaseRecaptchaBanner } from 'expo-firebase-recaptcha';
import { COLORS, SIZES } from '../constants';

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
            <Text style={{ color: 'white' }}>Sign In with Phone</Text>
          </View>

          {info && <View><Text style={{ color: 'white' }}>{info}</Text></View>}

          <View>
            <Input
              placeholder='Phone Number'
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(text)}
              autoCapitalize='none'
              inputStyle={{ color: 'white' }}
            />

            <TouchableOpacity onPress={handleSendVerificationCode} style={{ backgroundColor: '#D3A042', borderRadius: SIZES.small, padding: SIZES.small, alignItems: 'center' }}>
              <Text style={{ color: 'white' }}>Send Verification Code</Text>
            </TouchableOpacity>

            <Input
              placeholder='Verification Code'
              value={verificationCode}
              onChangeText={setVerificationCode}
              secureTextEntry={true}
              autoCapitalize='none'
              inputStyle={{ color: 'white' }}
            />

            <TouchableOpacity onPress={handleVerifyVerificationCode} style={{ backgroundColor: '#D3A042', borderRadius: SIZES.small, padding: SIZES.small, alignItems: 'center' }}>
              <Text style={{ color: 'white' }}>Verify Code</Text>
            </TouchableOpacity>

            <FirebaseRecaptchaVerifierModal
              ref={recaptchaVerifier}
              firebaseConfig={{
                // Add your Firebase configuration here
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
