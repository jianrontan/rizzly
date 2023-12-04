import { useEffect } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { getDoc, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';
import DraggableFlatList from 'react-native-draggable-flatlist';

export default function EditProfileScreen() {
    const [userData, setUserData] = useState(null);
    const [userImages, setUserImages] = useState([]);   

    useEffect(() => {
        const getFirestoreData = async () => {
            const auth = getAuth();
            const userId = auth.currentUser.uid;
            const docRef = doc(db, 'profiles', userId);
            const docSnap = await getDoc(docRef);
      
            if (docSnap.exists()) {
                setUserData(docSnap.data());
            } else {
                console.log('No such document!');
            }
        };
      
        getFirestoreData();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <DraggableFlatList

            />
        </SafeAreaView>
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