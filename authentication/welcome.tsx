import React from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { COLORS, SIZES } from '../constants';

const Welcome: React.FC<NativeStackScreenProps<any>> = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightBeige }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, padding: SIZES.medium, }}>

          <View style={{ alignItems: 'center', padding: SIZES.xLarge }}>
            <Text>Welcome to Rizzly</Text>
          </View>

          <View style={{ alignItems: 'center', padding: SIZES.xLarge }}>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text>Sign In</Text>
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: 'center', padding: SIZES.xLarge }}>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Welcome;