import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Type1Screen = () => {
  return (
    <View style={styles.container}>
      <Text>Type 1 Diabetes Screen</Text>
      <Text>Well looks like you have been brought to the type 1 diabetes screen, which means insulin injections will be a part and parcel of your life</Text>
      <Text>However, this app will walk you through how to enjoy life while having type 1 diabetes</Text>
      <TouchableOpacity onPress={navigatetoInsulin}>
        <Text>Click here to learn more about insulin </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default Type1Screen;
