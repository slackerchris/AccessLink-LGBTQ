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

// Initialize Firebase
console.log('🔥 Firebase Debug - Using hardcoded new project configuration');

const app = initializeApp({
  apiKey: "AIzaSyCIOMEqs_o2VTxj7HnVqGMtG5u2qRuT6TU",
  authDomain: "acceslink-lgbtq.firebaseapp.com",
  projectId: "acceslink-lgbtq",
  storageBucket: "acceslink-lgbtq.firebasestorage.app",
  messagingSenderId: "595597079040",
  appId: "1:595597079040:android:598b0e16a92f0fb2c49ee5",
});

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
