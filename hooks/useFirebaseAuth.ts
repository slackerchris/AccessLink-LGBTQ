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
  serverTimestamp,
  deleteField 
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
    interests?: string[];
    accessibilityNeeds?: string[];
    preferredPronouns?: string;
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
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  makeUserAdmin: (userEmail: string) => Promise<void>;
  removeAdminRole: (userEmail: string) => Promise<void>;
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
  const [cleanupCompleted, setCleanupCompleted] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Load user profile from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const profileData = userDoc.data() as UserProfile;
            setUserProfile(profileData);
            
            // Check if we need to clean up duplicate data (legacy fields) - only once
            if (!cleanupCompleted) {
              const legacyData = userDoc.data() as any;
              if (legacyData.firstName || legacyData.lastName || legacyData.bio) {
                console.log('Found duplicate profile data, cleaning up...');
                cleanupDuplicateProfileData();
                setCleanupCompleted(true);
              }
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

  const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Prepare update data
      const updateData: any = {
        updatedAt: serverTimestamp()
      };
      
      // Handle top-level fields
      if (profileData.displayName !== undefined) {
        updateData.displayName = profileData.displayName;
      }
      
      // Handle nested profile updates by merging with existing data
      if (profileData.profile) {
        updateData.profile = profileData.profile;
      }
      
      // Update Firestore document
      await updateDoc(userDocRef, updateData);
      
      // Update local state
      setUserProfile(prev => prev ? { 
        ...prev, 
        ...profileData,
        profile: {
          ...prev.profile,
          ...profileData.profile
        }
      } : prev);
      
      // If displayName is being updated, also update Firebase Auth
      if (profileData.displayName && profileData.displayName !== user.displayName) {
        await updateProfile(user, { displayName: profileData.displayName });
      }
    } catch (err) {
      console.error('Error updating user profile:', err);
      throw err;
    }
  };

  const cleanupDuplicateProfileData = async (): Promise<void> => {
    if (!user || !userProfile) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Remove duplicate top-level fields that should only be in profile object
      const cleanupData: any = {
        firstName: deleteField(),
        lastName: deleteField(),
        bio: deleteField(),
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userDocRef, cleanupData);
      console.log('Cleaned up duplicate profile data');
    } catch (err) {
      console.error('Error cleaning up duplicate data:', err);
    }
  };

  const makeUserAdmin = async (userEmail: string): Promise<void> => {
    if (!user || userProfile?.role !== 'admin') {
      throw new Error('Only admins can promote users to admin');
    }
    
    try {
      // Find user by email
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', userEmail)
      );
      
      const querySnapshot = await getDocs(usersQuery);
      
      if (querySnapshot.empty) {
        throw new Error('User not found');
      }
      
      const userDoc = querySnapshot.docs[0];
      const userDocRef = doc(db, 'users', userDoc.id);
      
      await updateDoc(userDocRef, {
        role: 'admin',
        updatedAt: serverTimestamp()
      });
      
      console.log(`Made user ${userEmail} an admin`);
    } catch (err) {
      console.error('Error making user admin:', err);
      throw err;
    }
  };

  const removeAdminRole = async (userEmail: string): Promise<void> => {
    if (!user || userProfile?.role !== 'admin') {
      throw new Error('Only admins can remove admin privileges');
    }
    
    try {
      // Find user by email
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', userEmail)
      );
      
      const querySnapshot = await getDocs(usersQuery);
      
      if (querySnapshot.empty) {
        throw new Error('User not found');
      }
      
      const userDoc = querySnapshot.docs[0];
      const userDocRef = doc(db, 'users', userDoc.id);
      
      await updateDoc(userDocRef, {
        role: 'user',
        updatedAt: serverTimestamp()
      });
      
      console.log(`Removed admin role from user ${userEmail}`);
    } catch (err) {
      console.error('Error removing admin role:', err);
      throw err;
    }
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
    clearError,
    updateUserProfile,
    makeUserAdmin,
    removeAdminRole
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

export const usePermissions = () => {
  const { userProfile } = useAuth();
  
  return {
    isAdmin: userProfile?.role === 'admin',
    isBusinessOwner: userProfile?.role === 'business_owner',
    isUser: userProfile?.role === 'user',
    role: userProfile?.role || 'user'
  };
};

export const useBusinessActions = (): BusinessContextType => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusinessActions must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
