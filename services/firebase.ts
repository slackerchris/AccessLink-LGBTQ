/**
 * Firebase Configuration for AccessLink LGBTQ+
 * Backend authentication and database services
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Temporary Firebase configuration for development
// TODO: Replace with actual Firebase project config
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "accesslinklgbtq-demo.firebaseapp.com",
  projectId: "accesslinklgbtq-demo",
  storageBucket: "accesslinklgbtq-demo.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:demo",
  measurementId: "G-DEMO"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
