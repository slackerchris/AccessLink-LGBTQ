/**
 * Firebase Authentication Hook for React Native
 * Provides Firebase authentication context for the AccessLink LGBTQ+ app
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Complete the auth session for Expo
WebBrowser.maybeCompleteAuthSession();

// Types
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'business_owner';
  isEmailVerified: boolean;
  createdAt: any;
  updatedAt: any;
  profile: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    location?: string;
    bio?: string;
  };
}

interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  ownerId: string;
  categories: string[];
  accessibilityFeatures: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  createdAt: any;
  updatedAt: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, role?: 'user' | 'business_owner') => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

interface BusinessContextType {
  getMyBusinesses: () => Promise<Business[]>;
  createBusiness: (businessData: Partial<Business>) => Promise<Business>;
  updateBusiness: (businessId: string, updates: Partial<Business>) => Promise<void>;
  deleteBusiness: (businessId: string) => Promise<void>;
}

// Create contexts
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Load user profile from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            // Create a basic profile if none exists
            const basicProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'User',
              role: 'user',
              isEmailVerified: firebaseUser.emailVerified,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              profile: {}
            };
            
            await setDoc(userDocRef, basicProfile);
            setUserProfile(basicProfile);
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string, 
    password: string, 
    displayName: string, 
    role: 'user' | 'business_owner' = 'user'
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update display name
      await updateProfile(firebaseUser, { displayName });
      
      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: email,
        displayName: displayName,
        role: role,
        isEmailVerified: firebaseUser.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profile: {}
      };
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, userProfile);
      
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);

      // React Native platform - use Expo AuthSession
      const redirectUri = AuthSession.makeRedirectUri();
      console.log('🔗 Google OAuth redirect URI:', redirectUri);
      
      const request = new AuthSession.AuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.IdToken,
        extraParams: {},
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type === 'success' && result.params.id_token) {
        const credential = GoogleAuthProvider.credential(result.params.id_token);
        const userCredential = await signInWithCredential(auth, credential);
        const firebaseUser = userCredential.user;
        
        // Create or update user profile
        await createOrUpdateUserProfile(firebaseUser, 'user');
      } else {
        throw new Error('Google sign-in was cancelled or failed');
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateUserProfile = async (firebaseUser: User, defaultRole: 'user' | 'business_owner' = 'user') => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Create new user profile
      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'User',
        role: defaultRole,
        isEmailVerified: firebaseUser.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profile: {}
      };
      
      await setDoc(userDocRef, userProfile);
    } else {
      // Update existing profile with latest info
      await updateDoc(userDocRef, {
        displayName: firebaseUser.displayName || userDoc.data().displayName,
        isEmailVerified: firebaseUser.emailVerified,
        updatedAt: serverTimestamp()
      });
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut(auth);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Business Actions
  const getMyBusinesses = async (): Promise<Business[]> => {
    if (!user) return [];
    
    try {
      const businessesQuery = query(
        collection(db, 'businesses'),
        where('ownerId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(businessesQuery);
      const businesses: Business[] = [];
      
      querySnapshot.forEach((doc) => {
        businesses.push({ id: doc.id, ...doc.data() } as Business);
      });
      
      return businesses;
    } catch (err) {
      console.error('Error fetching businesses:', err);
      return [];
    }
  };

  const createBusiness = async (businessData: Partial<Business>): Promise<Business> => {
    if (!user) throw new Error('User not authenticated');
    
    const newBusiness: Partial<Business> = {
      ...businessData,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      rating: 0,
      reviewCount: 0,
      images: [],
      accessibilityFeatures: []
    };
    
    const docRef = doc(collection(db, 'businesses'));
    await setDoc(docRef, newBusiness);
    
    return { id: docRef.id, ...newBusiness } as Business;
  };

  const updateBusiness = async (businessId: string, updates: Partial<Business>): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    const businessRef = doc(db, 'businesses', businessId);
    await updateDoc(businessRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  };

  const deleteBusiness = async (businessId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    const businessRef = doc(db, 'businesses', businessId);
    await deleteDoc(businessRef);
  };

  const authValue: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    clearError
  };

  const businessValue: BusinessContextType = {
    getMyBusinesses,
    createBusiness,
    updateBusiness,
    deleteBusiness
  };

  return React.createElement(
    AuthContext.Provider,
    { value: authValue },
    React.createElement(
      BusinessContext.Provider,
      { value: businessValue },
      children
    )
  );
};

// Custom Hooks
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useBusinessActions = (): BusinessContextType => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusinessActions must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
