import { useState } from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Input } from 'react-native-elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

import styles from '../myComponents/welcome/welcome.style';
import { COLORS, SIZES } from '../constants';

const auth = getAuth();

const SignUp: React.FC<NativeStackScreenProps<any>> = ({navigation}) => {
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
      })
      .catch((error) => {
        setValue({
          ...value,
          error: error.message
        });
      });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightBeige }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, padding: SIZES.medium, }}>

          <View style={styles.signupView}>
            <Text style={styles.welcomeText}>Register a new account</Text>
          </View>

          {!!value.error && <View><Text style={styles.errorText}>{value.error}</Text></View>}

          <View>
            <Input
              style={styles.signupInput}
              placeholder='Email'
              value={value.email}
              onChangeText={(text) => setValue({ ...value, email: text })}
              autoCapitalize='none'
            />

            <Input
              style={styles.signupInput}
              placeholder='Password'
              value={value.password}
              onChangeText={(text) => setValue({ ...value, password: text })}
              secureTextEntry={true}
              autoCapitalize='none'
            />

            <Input
              style={styles.signupInput}
              placeholder='Confirm password'
              value={value.cfmPassword}
              onChangeText={(text) => setValue({ ...value, cfmPassword: text })}
              secureTextEntry={true}
              autoCapitalize='none'
            />

            <View style={{ padding: 8 }}>
              <TouchableOpacity style={styles.signupButton} onPress={signUp} >
                <Text style={styles.signupText}>Sign Up</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUp;