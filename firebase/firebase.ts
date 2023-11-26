import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
 apiKey: process.env.FIREBASE_API_KEY,
 authDomain: process.env.FIREBASE_AUTH_DOMAIN,
 projectId: process.env.FIREBASE_PROJECT_ID,
 storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
 messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
 appId: process.env.FIREBASE_APP_ID,
 measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services using the app instance
const auth = initializeAuth(app, {
 persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getDatabase(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics };
