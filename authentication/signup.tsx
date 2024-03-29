import { useState } from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Input } from 'react-native-elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/firebase';

import { COLORS, SIZES, FONT } from '../constants';

const auth = getAuth();

const SignUp: React.FC<NativeStackScreenProps<any>> = ({ navigation }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isCfmPasswordVisible, setIsCfmPasswordVisible] = useState(false);

  const [value, setValue] = useState({
    email: '',
    password: '',
    cfmPassword: '',
    error: ''
  })

  const isEmailValid = (email: string): boolean => {
    const pattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    return pattern.test(email);
  };

  const isPasswordValid = (password: string): boolean => {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
    return pattern.test(password);
  };

  async function signUp() {
    if (!isEmailValid(value.email) || value.password === '') {
      setValue({
        ...value,
        error: 'A valid email and password is required.'
      })
      return;
    }

    if (!isPasswordValid(value.password)) {
      setValue({
        ...value,
        error: 'Passwords need to be at least 8 characters, contain a number, a lowercase letter, and a uppercase letter.'
      })
      return;
    }

    const comparePasswords = value.password.localeCompare(value.cfmPassword)

    if (comparePasswords != 0) {
      setValue({
        ...value,
        error: 'Passwords have to match.'
      })
      return;
    }

    createUserWithEmailAndPassword(auth, value.email, value.password)
      .then((userCredential) => {
        // Send email verification
        sendEmailVerification(userCredential.user)
          .then(() => {
            setValue({
              ...value,
              error: ''
            });
            Alert.alert(
              'Alert',
              'Please check your email to verify your account.',
              [
                {
                  text: 'OK',
                },
              ],
            )
          })
          .catch((error) => {
            setValue({
              ...value,
              error: error.message
            });
          });

        const emailsCollection = collection(db, 'emails');
        addDoc(emailsCollection, { email: value.email })
          .then((docRef) => {
            console.log('Document written with ID: ', docRef.id);
          })
          .catch((error) => {
            console.error('Error adding document: ', error);
          });
      })
      .catch((error) => {
        setValue({
          ...value,
          error: error.message
        });
      });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#6e4639" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, padding: SIZES.medium, }}>

          <View>
            <Text style={{ color: 'white', fontFamily: FONT.regular, padding: SIZES.small }}>Register a new account</Text>
          </View>

          {!!value.error && <View><Text>{value.error}</Text></View>}

          <View>
            <Input
              placeholder='Email'
              value={value.email}
              onChangeText={(text) => setValue({ ...value, email: text })}
              autoCapitalize='none'
              inputStyle={{ color: 'white', fontFamily: FONT.regular }}
            />

            <View style={{ position: 'relative' }}>
              <Input
                placeholder='Password'
                value={value.password}
                onChangeText={(text) => setValue({ ...value, password: text })}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize='none'
                inputStyle={{ color: 'white', fontFamily: FONT.regular }}
              />
              <TouchableOpacity style={{ position: 'absolute', right: 10 }} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <MaterialCommunityIcons name={isPasswordVisible ? "eye-off" : "eye"} size={28} color={"gray"} />
              </TouchableOpacity>
            </View>

            <View style={{ position: 'relative' }}>
              <Input
                placeholder='Confirm password'
                value={value.cfmPassword}
                onChangeText={(text) => setValue({ ...value, cfmPassword: text })}
                secureTextEntry={!isCfmPasswordVisible}
                autoCapitalize='none'
                inputStyle={{ color: 'white', fontFamily: FONT.regular }}
              />
              <TouchableOpacity style={{ position: 'absolute', right: 10 }} onPress={() => setIsCfmPasswordVisible(!isCfmPasswordVisible)}>
                <MaterialCommunityIcons name={isCfmPasswordVisible ? "eye-off" : "eye"} size={28} color={"gray"} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={signUp} style={{ backgroundColor: '#D3A042', borderRadius: SIZES.small, padding: SIZES.small, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontFamily: FONT.regular }}>Sign Up</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUp;