import { useState } from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Input } from 'react-native-elements';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

import { COLORS, SIZES } from '../constants';

const auth = getAuth();

const SignIn = ({navigation}) => {
  const [value, setValue] = useState({
    email: '',
    password: '',
    error: ''
  })

  async function signIn() {
    if (value.email === '' || value.password === '') {
      setValue({
        ...value,
        error: 'Email and password are mandatory.'
      })
      return;
    }

    signInWithEmailAndPassword(auth, value.email, value.password)
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

          <View>
            <Text>Log In</Text>
          </View>

          {!!value.error && <View><Text>{value.error}</Text></View>}

          <View>
            <Input
              placeholder='Email'
              value={value.email}
              onChangeText={(text) => setValue({ ...value, email: text })}
              autoCapitalize='none'
            />

            <Input
              placeholder='Password'
              value={value.password}
              onChangeText={(text) => setValue({ ...value, password: text })}
              secureTextEntry={true}
              autoCapitalize='none'
            />

            <View style={{ paddingLeft: 8, paddingTop: SIZES.xSmall, paddingBottom: SIZES.xLarge }}>
              <TouchableOpacity onPress={signIn} >
                <Text>Sign In</Text>
              </TouchableOpacity>
            </View>

            <View style={{ padding: 8 }}>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')} >
                <Text>Don't have an account? Sign up</Text>
              </TouchableOpacity>
            </View>

            <View style={{ padding: 8 }}>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} >
                <Text>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn;