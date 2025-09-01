/**
 * Firebase Configuration for AccessLink LGBTQ+
 * Backend authentication and database services
 */

import { initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'dotenv/config';

// Initialize Firebase
console.log('🔥 Firebase Debug - Using environment variables for configuration');

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with React Native AsyncStorage persistence
let auth;
try {
  // Prefer React Native persistence when available
  const maybeGetRNP = (FirebaseAuth as any).getReactNativePersistence;
  if (typeof maybeGetRNP === 'function') {
    auth = (FirebaseAuth as any).initializeAuth(app, {
      persistence: maybeGetRNP(AsyncStorage),
    });
  } else {
    auth = (FirebaseAuth as any).initializeAuth(app);
  }
} catch {
  auth = (FirebaseAuth as any).getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

export { auth, db, storage };
export default app;
