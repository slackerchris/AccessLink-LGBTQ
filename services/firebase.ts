/**
 * Firebase Configuration for AccessLink LGBTQ+
 * Backend authentication and database services
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7JlbYrHmblNfE7kBa_7Pb9NqOjFjR2u8", // You'll need to replace this with your actual config
  authDomain: "accesslinklgbtq.firebaseapp.com",
  projectId: "accesslinklgbtq-app",
  storageBucket: "accesslinklgbtq-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012abcd",
  measurementId: "G-ABCDEFGHIJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
