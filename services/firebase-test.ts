/**
 * Firebase Testing Configuration
 * Provides different Firebase configs for testing vs production
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Test Firebase configuration (using emulator or test project)
const testFirebaseConfig = {
  apiKey: "demo-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project", 
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

// Production Firebase configuration
const prodFirebaseConfig = {
  apiKey: "AIzaSyDQOnwLXW_PtQKtxhfxasWp2C4c7Bp2GKw",
  authDomain: "acceinklgbtq-a1de8.firebaseapp.com",
  projectId: "acceinklgbtq-a1de8",
  storageBucket: "acceinklgbtq-a1de8.firebasestorage.app",
  messagingSenderId: "580679166679",
  appId: "1:580679166679:android:ea493c0f288e2f5cd65e92"
};

// Choose config based on environment
const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.FIREBASE_INTEGRATION_TESTS === 'true';
const firebaseConfig = isTestEnvironment ? testFirebaseConfig : prodFirebaseConfig;

// Initialize Firebase app (avoid duplicate initialization)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators in test environment
if (isTestEnvironment) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔥 Connected to Firebase emulators for testing');
  } catch (error) {
    console.warn('Firebase emulators not available, using mocks:', (error as Error).message);
  }
}

export { auth, db };
export default app;
