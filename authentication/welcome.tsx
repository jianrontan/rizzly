import React from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { COLORS, SIZES, FONT } from '../constants';

const Welcome: React.FC<NativeStackScreenProps<any>> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome to Rizzly</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Sign In')}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Sign Up')}>
            <Text style={styles.buttonText}>Create a Rizzly account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6e4639',
  },
  content: {
    flex: 1,
    padding: SIZES.medium,
    alignItems: 'center',
  },
  titleContainer: {
    paddingVertical: SIZES.xLarge,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: 'white'
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D3A042',
    borderRadius: 8,
    paddingVertical: SIZES.smallmedium,
    paddingHorizontal: SIZES.smallmedium,
    marginVertical: SIZES.smallmedium,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: FONT.medium,
    color: COLORS.white,
  },
});

export default Welcome;
