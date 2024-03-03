import 'dotenv/config';

export default {
  "expo": {
    "name": "Rizzly",
    "slug": "Rizzly",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.rizzly.rizzly"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.rizzly.rizzly"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to add to your profile.",
          "cameraPermission": "The app accesses your camera to add photos to your profile."
        }
      ],
      "expo-router"
    ],
    "extra": {
      "firebase": {
        firebaseApiKey: process.env.FIREBASE_API_KEY,
        firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
        firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
        firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        firebaseAppId: process.env.FIREBASE_APP_ID,
        firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID
      },
      "eas": {
        "projectId": "4181f824-6d94-4916-a82f-df7a49ad0a33"
      }
    },
    "updates": {
      "url": "https://u.expo.dev/4181f824-6d94-4916-a82f-df7a49ad0a33"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
