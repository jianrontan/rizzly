import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  collection,
  getDocs,
  updateDoc,
  arrayUnion,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { useAuthentication } from '../hooks/useAuthentication';

const HomeScreen = () => {

};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexDirection: 'row',
  },
  scrollViewItem: {
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  userInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    color: 'white',
    fontSize: 16,
  },
  likeButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 20,
  },
  likeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoScrollView: {
    height: '100%',
  },
  photoContainer: {
    flex: 1,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});

export default HomeScreen;
