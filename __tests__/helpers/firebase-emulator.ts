/**
 * Firebase Emulator Setup for Testing
 * Provides local Firebase emulator integration for testing
 */

import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';

// Flag to track if emulators are already connected
let emulatorsConnected = false;

/**
 * Setup Firebase emulators for testing
 * Call this in test setup to use local Firebase emulators instead of production
 */
export const setupFirebaseEmulators = () => {
  if (emulatorsConnected || process.env.NODE_ENV !== 'test') {
    return;
  }

  try {
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('🔥 Connected to Firebase Auth emulator');

    // Connect to Firestore emulator  
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔥 Connected to Firestore emulator');

    emulatorsConnected = true;
  } catch (error) {
    console.warn('Firebase emulators not available:', error);
  }
};

/**
 * Check if Firebase emulators are running
 */
export const areEmulatorsRunning = async (): Promise<boolean> => {
  try {
    // Try to fetch from auth emulator
    const response = await fetch('http://localhost:9099');
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Clear all data from emulators (useful for test cleanup)
 */
export const clearEmulatorData = async () => {
  if (!emulatorsConnected) return;

  try {
    // Clear Auth emulator data
    await fetch('http://localhost:9099/emulator/v1/projects/demo-project/accounts', {
      method: 'DELETE'
    });

    // Clear Firestore emulator data
    await fetch('http://localhost:8080/emulator/v1/projects/demo-project/databases/(default)/documents', {
      method: 'DELETE'
    });

    console.log('🧹 Cleared Firebase emulator data');
  } catch (error) {
    console.warn('Could not clear emulator data:', error);
  }
};
