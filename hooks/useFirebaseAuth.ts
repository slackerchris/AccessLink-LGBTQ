/**
 * Firebase Authentication Hook for React Native
 * Provides Firebase authentication and business management context for the AccessLink LGBTQ+ app
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
  serverTimestamp,
  FieldValue,
  addDoc
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import * as Google from 'expo-auth-session/providers/google';
import { BusinessListing } from '../types/business';
import { UserProfile } from '../types/user';

// Types
export type TimestampField = Date | FieldValue;

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    role: 'user' | 'business_owner'
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

interface BusinessContextType {
  businesses: BusinessListing[];
  loading: boolean;
  error: string | null;
  getMyBusinesses: () => Promise<BusinessListing[]>;
  createBusiness: (businessData: Partial<Omit<BusinessListing, 'id'>>) => Promise<BusinessListing>;
  updateBusiness: (businessId: string, updates: Partial<BusinessListing>) => Promise<void>;
  deleteBusiness: (businessId: string) => Promise<void>;
  refreshBusinesses: () => Promise<void>;
}

// Create contexts
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businessError, setBusinessError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
      clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setUserProfile(profile);
          if (profile.role === 'bizowner' || profile.role === 'bizmanager') {
            await loadUserBusinesses(firebaseUser.uid);
          }
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
            profile: { details: {} }
          };
          await setDoc(userDocRef, basicProfile);
          setUserProfile(basicProfile);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setBusinesses([]);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, role: 'user' | 'business_owner' = 'user') => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      await updateProfile(firebaseUser, { displayName });
      
      const newUserProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: email,
        displayName: displayName,
        role: role === 'business_owner' ? 'bizowner' : 'user',
        isEmailVerified: firebaseUser.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profile: { details: {} }
      };
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, newUserProfile);
      setUserProfile(newUserProfile);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await promptAsync();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      setError("No user is signed in to update.");
      return;
    }
    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      if (updates.displayName && updates.displayName !== user.displayName) {
        await updateProfile(user, { displayName: updates.displayName });
      }

      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      const updatedUserDoc = await getDoc(userDocRef);
      if (updatedUserDoc.exists()) {
        setUserProfile(updatedUserDoc.data() as UserProfile);
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadUserBusinesses = async (userId: string) => {
    setBusinessLoading(true);
    try {
      const businessesQuery = query(collection(db, 'businesses'), where('ownerId', '==', userId));
      const querySnapshot = await getDocs(businessesQuery);
      const userBusinesses: BusinessListing[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessListing));
      setBusinesses(userBusinesses);
    } catch (err) {
      setBusinessError('Failed to load businesses');
    } finally {
      setBusinessLoading(false);
    }
  };

  const getMyBusinesses = async (): Promise<BusinessListing[]> => {
    if (!user) {
      setBusinessError('User not authenticated');
      return [];
    }
    const businessesQuery = query(collection(db, 'businesses'), where('ownerId', '==', user.uid));
    const querySnapshot = await getDocs(businessesQuery);
    const userBusinesses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessListing));
    setBusinesses(userBusinesses);
    return userBusinesses;
  };

  const refreshBusinesses = async (): Promise<void> => {
    if (user) await loadUserBusinesses(user.uid);
  };

  const createBusiness = async (businessData: Partial<Omit<BusinessListing, 'id'>>): Promise<BusinessListing> => {
    if (!user) throw new Error('User not authenticated');
    
    const newBusinessData = {
      name: 'Unnamed Business',
      description: '',
      category: 'other',
      location: { address: '' },
      ...businessData,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      averageRating: 0,
      totalReviews: 0,
      images: [],
    };
    
    const docRef = await addDoc(collection(db, 'businesses'), newBusinessData);
    const newBusiness = { id: docRef.id, ...newBusinessData } as BusinessListing;
    setBusinesses(prev => [...prev, newBusiness]);
    return newBusiness;
  };

  const updateBusiness = async (businessId: string, updates: Partial<BusinessListing>): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    const businessRef = doc(db, 'businesses', businessId);
    await updateDoc(businessRef, { ...updates, updatedAt: serverTimestamp() });
    setBusinesses(prev => prev.map(b => b.id === businessId ? { ...b, ...updates } as BusinessListing : b));
  };

  const deleteBusiness = async (businessId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    const businessRef = doc(db, 'businesses', businessId);
    await deleteDoc(businessRef);
    setBusinesses(prev => prev.filter(b => b.id !== businessId));
  };

  const authContextValue: AuthContextType = { user, userProfile, loading, error, signIn, signUp, signInWithGoogle, logout, clearError, updateUserProfile };
  const businessContextValue: BusinessContextType = { businesses, loading: businessLoading, error: businessError, getMyBusinesses, createBusiness, updateBusiness, deleteBusiness, refreshBusinesses };

  return (
    <AuthContext.Provider value={authContextValue}>
      <BusinessContext.Provider value={businessContextValue}>
        {children}
      </BusinessContext.Provider>
    </AuthContext.Provider>
  );
};

// Custom Hooks
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const useBusiness = (): BusinessContextType => {
  const context = useContext(BusinessContext);
  if (!context) throw new Error('useBusiness must be used within an AuthProvider');
  return context;
};

export const usePermissions = () => {
  const { userProfile } = useAuth();
  return {
    isAdmin: userProfile?.role === 'admin',
    isBusinessOwner: userProfile?.role === 'bizowner',
  };
};

export default AuthProvider;
