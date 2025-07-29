/**
 * Firebase Authentication Integration Tests
 * Tests real Firebase authentication flows (optional - run with FIREBASE_INTEGRATION_TESTS=true)
 */

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { auth } from '../../services/firebase';

// Only run these tests when FIREBASE_INTEGRATION_TESTS=true
const shouldRunIntegrationTests = process.env.FIREBASE_INTEGRATION_TESTS === 'true';

describe('Firebase Auth Integration', () => {
  // Skip these tests by default to avoid hitting Firebase in CI
  beforeAll(() => {
    if (!shouldRunIntegrationTests) {
      console.log('🔥 Skipping Firebase integration tests. Set FIREBASE_INTEGRATION_TESTS=true to run.');
    }
  });

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    displayName: 'Integration Test User'
  };

  let testUserCredential: any = null;

  afterAll(async () => {
    if (shouldRunIntegrationTests && testUserCredential?.user) {
      // Cleanup: delete test user
      try {
        await deleteUser(testUserCredential.user);
        console.log('🧹 Cleaned up test user');
      } catch (error) {
        console.warn('Could not delete test user:', error);
      }
    }
  });

  describe('Real Firebase Authentication', () => {
    (shouldRunIntegrationTests ? it : it.skip)('should create user with Firebase', async () => {
      testUserCredential = await createUserWithEmailAndPassword(
        auth,
        testUser.email,
        testUser.password
      );

      expect(testUserCredential).toBeDefined();
      expect(testUserCredential.user.email).toBe(testUser.email);
      
      // Update profile
      await updateProfile(testUserCredential.user, {
        displayName: testUser.displayName
      });
      
      expect(testUserCredential.user.displayName).toBe(testUser.displayName);
    }, 15000); // Longer timeout for Firebase calls

    (shouldRunIntegrationTests ? it : it.skip)('should sign in with Firebase', async () => {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        testUser.email,
        testUser.password
      );

      expect(userCredential).toBeDefined();
      expect(userCredential.user.email).toBe(testUser.email);
      expect(userCredential.user.displayName).toBe(testUser.displayName);
    }, 15000);

    (shouldRunIntegrationTests ? it : it.skip)('should handle Firebase auth state', async () => {
      // Sign out first
      await auth.signOut();
      expect(auth.currentUser).toBeNull();
      
      // Sign back in
      const userCredential = await signInWithEmailAndPassword(
        auth,
        testUser.email,
        testUser.password
      );
      
      expect(auth.currentUser).toBeDefined();
      expect(auth.currentUser?.email).toBe(testUser.email);
    }, 15000);
  });
});
