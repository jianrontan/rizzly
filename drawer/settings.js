import { useEffect } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { getDoc, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text>Open up settings.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});