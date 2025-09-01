/**
 * Authentication Service for AccessLink LGBTQ+
 * Handles user registration, login, and session management
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
  UserCredential,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, FieldValue } from 'firebase/firestore';
import { auth, db } from './firebase';

export type TimestampField = Date | FieldValue;

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'business_owner';
  isEmailVerified: boolean;
  createdAt: TimestampField;
  updatedAt: TimestampField;
  profile: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    location?: string;
    bio?: string;
    savedBusinesses?: string[];
    reviews?: {
      id: string;
      businessId: string;
      rating: number;
      comment: string;
      createdAt: TimestampField;
      updatedAt: TimestampField;
    }[];
    accessibilityPreferences?: {
      wheelchairAccess: boolean;
      visualImpairment: boolean;
      hearingImpairment: boolean;
      cognitiveSupport: boolean;
      mobilitySupport: boolean;
      sensoryFriendly: boolean;
    };
    lgbtqIdentity?: {
      visible: boolean;
      pronouns: string;
      identities: string[];
      preferredName: string;
    };
    preferences?: {
      notifications: boolean;
      marketingEmails: boolean;
      accessibility: {
        highContrast: boolean;
        largeText: boolean;
        screenReader: boolean;
      };
    };
  };
}

export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

class AuthService {
  private authStateListeners: ((authState: AuthState) => void)[] = [];
  private currentAuthState: AuthState = {
    user: null,
    userProfile: null,
    loading: true,
    error: null
  };

  constructor() {
    this.initializeAuthListener();
  }

  private initializeAuthListener() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userProfile = await this.getUserProfile(user.uid);
          this.updateAuthState({
            user,
            userProfile,
            loading: false,
            error: null
          });
        } catch (error) {
          console.error('Error loading user profile:', error);
          this.updateAuthState({
            user,
            userProfile: null,
            loading: false,
            error: 'Failed to load user profile'
          });
        }
      } else {
        this.updateAuthState({
          user: null,
          userProfile: null,
          loading: false,
          error: null
        });
      }
    });
  }

  private updateAuthState(newState: AuthState) {
    this.currentAuthState = newState;
    this.authStateListeners.forEach(listener => listener(newState));
  }

  public onAuthStateChange(listener: (authState: AuthState) => void) {
    this.authStateListeners.push(listener);
    // Immediately call with current state
    listener(this.currentAuthState);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(listener);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  public getCurrentAuthState(): AuthState {
    return this.currentAuthState;
  }

  // User Registration
  public async registerUser(
    email: string,
    password: string,
    displayName: string,
    additionalInfo: Partial<UserProfile['profile']> = {}
  ): Promise<UserCredential> {
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName });

      // Send email verification
      await sendEmailVerification(user);

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || email,
        displayName,
        role: 'user',
        isEmailVerified: user.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profile: {
          firstName: additionalInfo.firstName || '',
          lastName: additionalInfo.lastName || '',
          phoneNumber: additionalInfo.phoneNumber || '',
          location: additionalInfo.location || '',
          preferences: {
            notifications: true,
            marketingEmails: false,
            accessibility: {
              highContrast: false,
              largeText: false,
              screenReader: false
            }
          }
        }
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      return userCredential;
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error && 'code' in error) {
        throw new Error(this.getAuthErrorMessage((error as {code: string}).code));
      }
      throw new Error('An unknown registration error occurred');
    }
  }

  // User Login
  public async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      if (error instanceof Error && 'code' in error) {
        throw new Error(this.getAuthErrorMessage((error as {code: string}).code));
      }
      throw new Error('An unknown sign-in error occurred');
    }
  }

  // User Logout
  public async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  // Password Reset
  public async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      if (error instanceof Error && 'code' in error) {
        throw new Error(this.getAuthErrorMessage((error as {code: string}).code));
      }
      throw new Error('An unknown password reset error occurred');
    }
  }

  // Get User Profile
  public async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Update User Profile
  public async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Check if user is admin
  public isAdmin(userProfile: UserProfile | null): boolean {
    return userProfile?.role === 'admin';
  }

  // Check if user is business owner
  public isBusinessOwner(userProfile: UserProfile | null): boolean {
    return userProfile?.role === 'business_owner' || userProfile?.role === 'admin';
  }

  // Promote user to admin (admin only)
  public async promoteToAdmin(uid: string, currentUserProfile: UserProfile): Promise<void> {
    if (!this.isAdmin(currentUserProfile)) {
      throw new Error('Only admins can promote users to admin');
    }

    try {
      await this.updateUserProfile(uid, { role: 'admin' });
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      throw error;
    }
  }

  // Promote user to business owner (admin only)
  public async promoteToBusinessOwner(uid: string, currentUserProfile: UserProfile): Promise<void> {
    if (!this.isAdmin(currentUserProfile)) {
      throw new Error('Only admins can promote users to business owner');
    }

    try {
      await this.updateUserProfile(uid, { role: 'business_owner' });
    } catch (error) {
      console.error('Error promoting user to business owner:', error);
      throw error;
    }
  }

  private getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/operation-not-allowed':
        return 'Operation not allowed';
      default:
        return 'An error occurred during authentication';
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
