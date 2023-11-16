import { useEffect, useState } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { getDoc, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';

import { COLORS, SIZES, FONT } from '../constants';

export default function ProfileScreen({ navigation }) {
    const auth = getAuth();
    const [name, setName] = useState('');

    // Submits users name and navigates user to the main App screen
    const handleSetName = async () => {
        try {
            setName('');

            const userId = auth.currentUser.uid;
            const userDocRef = doc(db, 'profiles', userId);
            await updateDoc(userDocRef, {
                name: name,
                complete: true,
            });
            navigation.navigate('App');
        } catch(e) {
            console.error("Error adding name: ", e);
        }
    };

    return (
        <View style={styles.container}>
            <Text>Set up your profile here</Text>
            <View>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                />
            </View>
            <TouchableOpacity activeOpacity={0.69} style={styles.btnContainer} onPress={handleSetName}>
                <View>
                    <Text style={styles.textStyle}>Submit</Text>
                </View>
            </TouchableOpacity>
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
    btnContainer: {
        width: 200,
        height: 60,
        backgroundColor: COLORS.themeColor,
        borderRadius: SIZES.large / 1.25,
        borderWidth: 1.5,
        borderColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
    },
    textStyle: {
      fontFamily: FONT.medium,
      fontSize: SIZES.smallmedium,
      color: COLORS.white,
    }
});