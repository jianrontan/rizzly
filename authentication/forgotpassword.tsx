import { useState } from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Input } from 'react-native-elements';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

import { COLORS, SIZES } from '../constants';

const auth = getAuth();

const ForgotPassword = () => {
  const [value, setValue] = useState({
    email: '',
    error: ''
  })

  async function resetPassword() {
    if (value.email === '') {
      setValue({
        ...value,
        error: 'Please enter your email address.'
      })
      return;
    }

    sendPasswordResetEmail(auth, value.email)
        .then(() => {
            setValue({
            ...value,
            email: '',
            error: ''
            });
            Alert.alert(
                'Alert',
                'Check your email to reset your password.',
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
  }


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightBeige }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, padding: SIZES.medium, }}>

          <View>
            <Text>Forgot Password</Text>
          </View>

          {!!value.error && <View><Text>{value.error}</Text></View>}

          <View>
            <Input
              placeholder='Email'
              value={value.email}
              onChangeText={(text) => setValue({ ...value, email: text })}
            />

            <View style={{ alignItems: 'center', padding: SIZES.large }}>
              <TouchableOpacity onPress={resetPassword} >
                <Text>Reset Password</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ForgotPassword;