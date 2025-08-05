/**
 * Firebase Configuration for AccessLink LGBTQ+
 * Backend authentication and database services
 */

import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Initialize Firebase Auth - Firebase v12 automatically handles persistence
let auth;
try {
  // Try to get existing auth instance first
  auth = getAuth(app);
} catch (error: any) {
  console.log('Getting auth instance failed, initializing new one');
  // If that fails, initialize auth
  try {
    auth = initializeAuth(app);
  } catch (initError: any) {
    console.log('Auth initialization failed, using getAuth as fallback');
    auth = getAuth(app);
  }
}

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
