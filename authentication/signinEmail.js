import { useState } from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

const auth = getAuth();

const SignIn = ({ navigation }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#6e4639', paddingHorizontal: SIZES.medium }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1 }}>

          <View style={{ alignItems: 'center', marginTop: SIZES.medium }}>
            <Text style={{ color: 'white', fontSize: SIZES.large }}>Log In</Text>
          </View>

          {!!value.error && <View style={{ alignItems: 'center', marginTop: SIZES.medium }}>
            <Text style={{ color: 'white' }}>{value.error}</Text>
          </View>}

          <View style={{ marginTop: SIZES.medium }}>
            <TextInput
              style={{ backgroundColor: 'white', padding: SIZES.small, borderRadius: SIZES.small }}
              placeholder='Email'
              value={value.email}
              onChangeText={(text) => setValue({ ...value, email: text })}
              autoCapitalize='none'
            />

            <View style={{ position: 'relative', marginTop: SIZES.medium }}>
              <TextInput
                style={{ backgroundColor: 'white', padding: SIZES.small, borderRadius: SIZES.small }}
                placeholder='Password'
                value={value.password}
                onChangeText={(text) => setValue({ ...value, password: text })}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize='none'
              />
              <TouchableOpacity style={{ position: 'absolute', right: SIZES.small, top: SIZES.small }} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <MaterialCommunityIcons name={isPasswordVisible ? "eye-off" : "eye"} size={28} color={'white'} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={{ backgroundColor: '#D3A042', borderRadius: SIZES.small, paddingVertical: SIZES.medium, alignItems: 'center', marginTop: SIZES.medium }} onPress={signIn} >
              <Text style={{ color: 'white', fontSize: SIZES.medium }}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: SIZES.medium }} onPress={() => navigation.navigate('SignUp')} >
              <Text style={{ color: 'white' }}>Don't have an account? Sign up</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: SIZES.small }} onPress={() => navigation.navigate('ForgotPassword')} >
              <Text style={{ color: 'white' }}>Forgot Password?</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn;
