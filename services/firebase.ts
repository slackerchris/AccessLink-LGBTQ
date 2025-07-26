/**
 * Firebase Configuration for AccessLink LGBTQ+
 * Backend authentication and database services
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyDQOnwLXW_PtQKtxhfxasWp2C4c7Bp2GKw",
  authDomain: "acceinklgbtq-a1de8.firebaseapp.com",
  projectId: "acceinklgbtq-a1de8",
  storageBucket: "acceinklgbtq-a1de8.firebasestorage.app",
  messagingSenderId: "580679166679",
  appId: "1:580679166679:android:ea493c0f288e2f5cd65e92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
