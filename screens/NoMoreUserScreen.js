import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NoMoreUserScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>No more users</Text>
      <Text style={styles.text}> Perhaps try a different approach? Use filters to find the exact type of rizzler you want!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default NoMoreUserScreen;
