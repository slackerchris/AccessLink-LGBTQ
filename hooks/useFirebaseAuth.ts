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
  role: 'user' | 'admin' | 'bizmanager' | 'bizowner';
  isEmailVerified: boolean;
  createdAt: any;
  updatedAt: any;
  profile: {
    details: any;
    identity?: {
      visible?: boolean;
      pronouns?: string;
      identities?: string[];
      preferredName?: string;
    };
    accessibilityPreferences?: {
      wheelchairAccess?: boolean;
      visualImpairment?: boolean;
      hearingImpairment?: boolean;
      cognitiveSupport?: boolean;
      mobilitySupport?: boolean;
      sensoryFriendly?: boolean;
    };
    bio?: string;
    //preferredPronouns?: string;
    interests?: string[];
  //  accessibilityNeeds?: string[];
  };
}

interface Business {
  id: string;
  name: string;
  description: string;
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates
?: {
      latitude: number;
      longitude: number;
    };  
  };
  ownerId: string;
  //address: string;
  status?: string;
  tags?: string[];
  categories?: string[];
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
  businesses: Business[];
  loading: boolean;
  error: string | null;
  getMyBusinesses: () => Promise<Business[]>;
  createBusiness: (businessData: Partial<Business>) => Promise<Business>;
  updateBusiness: (businessId: string, updates: Partial<Business>) => Promise<void>;
  deleteBusiness: (businessId: string) => Promise<void>;
  refreshBusinesses: () => Promise<void>;
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
  
  // Business state
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businessError, setBusinessError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Load user profile from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            setUserProfile(profile);
            
            // Auto-load businesses for business owners/managers
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
          setBusinesses([]); // Clear businesses when user logs out
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
        role: role === 'business_owner' ? 'bizowner' : role,
        isEmailVerified: firebaseUser.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profile: { details: {} }
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

      // Use the web client ID for OAuth flow (required for expo-auth-session)
      const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      if (!webClientId) {
        throw new Error('Google Web Client ID not configured');
      }
      
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'accesslink',
        path: 'oauth'
      });
      
      console.log('🔗 Google OAuth redirect URI:', redirectUri);
      console.log('🔗 Platform:', Platform.OS);
      console.log('🔗 Web Client ID:', webClientId);

      const request = new AuthSession.AuthRequest({
        clientId: webClientId,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.IdToken,
        extraParams: {},
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      console.log('🔗 Google OAuth result:', result);

      if (result.type === 'success' && result.params.id_token) {
        const credential = GoogleAuthProvider.credential(result.params.id_token);
        const userCredential = await signInWithCredential(auth, credential);
        const firebaseUser = userCredential.user;
        
        // Create or update user profile
        await createOrUpdateUserProfile(firebaseUser, 'user');
      } else if (result.type === 'cancel') {
        throw new Error('Google sign-in was cancelled');
      } else {
        throw new Error('Google sign-in failed: ' + (result.type || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('🚨 Google OAuth Error:', err);
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
        role: defaultRole === 'business_owner' ? 'bizowner' : defaultRole,
        isEmailVerified: firebaseUser.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profile: { details: {} }
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

  // Helper function to load user businesses
  const loadUserBusinesses = async (userId: string) => {
    try {
      setBusinessLoading(true);
      setBusinessError(null);
      
      const businessesQuery = query(
        collection(db, 'businesses'),
        where('ownerId', '==', userId)
      );
      
      const querySnapshot = await getDocs(businessesQuery);
      const userBusinesses: Business[] = [];
      
      querySnapshot.forEach((doc) => {
        userBusinesses.push({ id: doc.id, ...doc.data() } as Business);
      });
      
      console.log('📊 Loaded businesses from database:', userBusinesses.length, 'businesses');
      setBusinesses(userBusinesses);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setBusinessError('Failed to load businesses');
    } finally {
      setBusinessLoading(false);
    }
  };

  // Business Actions
  const getMyBusinesses = async (): Promise<Business[]> => {
    if (!user) return [];
    
    try {
      setBusinessLoading(true);
      setBusinessError(null);
      
      const businessesQuery = query(
        collection(db, 'businesses'),
        where('ownerId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(businessesQuery);
      const userBusinesses: Business[] = [];
      
      querySnapshot.forEach((doc) => {
        userBusinesses.push({ id: doc.id, ...doc.data() } as Business);
      });
      
      setBusinesses(userBusinesses);
      return userBusinesses;
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setBusinessError('Failed to load businesses');
      return [];
    } finally {
      setBusinessLoading(false);
    }
  };

  const refreshBusinesses = async (): Promise<void> => {
    if (user) {
      await loadUserBusinesses(user.uid);
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
    // Business data
    businesses,
    loading: businessLoading,
    error: businessError,
    
    // Business actions
    getMyBusinesses,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    refreshBusinesses,
  };

  // Implement update profile functionality
  async function handleUpdateProfile(profileUpdates: { displayName?: string; profile?: any; }) {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);

      // Update Firebase display name if provided
      if (profileUpdates.displayName) {
        await updateProfile(user, { displayName: profileUpdates.displayName });
      }

      // Update Firestore user profile
      const userDocRef = doc(db, 'users', user.uid);

      const updateData: any = {
        updatedAt: serverTimestamp()
      };

      if (profileUpdates.displayName) {
        updateData.displayName = profileUpdates.displayName;
      }

      if (profileUpdates.profile) {
        // Remove identity-related fields from details before merging
        const { details = {}, ...restProfile } = userProfile?.profile || {};
        // Remove unwanted keys from details
        const {
          preferredName: _pn, pronouns: _pr, preferredPronouns: _pp, identityVisible: _iv, identities: _ids, ...cleanDetails
        } = details;
        updateData.profile = {
          ...restProfile,
          details: cleanDetails,
          ...profileUpdates.profile
        };
      }

      await updateDoc(userDocRef, updateData);

      // Update local state
      if (userProfile) {
        // Remove identity-related fields from details before merging in local state
        const { details = {}, ...restProfile } = userProfile.profile || {};
        const {
          preferredName: _pn, pronouns: _pr, preferredPronouns: _pp, identityVisible: _iv, identities: _ids, ...cleanDetails
        } = details;
        setUserProfile({
          ...userProfile,
          displayName: profileUpdates.displayName || userProfile.displayName,
          profile: {
            ...restProfile,
            details: cleanDetails,
            ...(profileUpdates.profile || {})
          }
        });
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      throw new Error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }
  
  const authActionsValue: AuthActionsType = {
    updateProfile: handleUpdateProfile
  };

  return React.createElement(
    AuthContext.Provider,
    { value: authValue },
    React.createElement(
      AuthActionsContext.Provider,
      { value: authActionsValue },
      React.createElement(
        BusinessContext.Provider,
        { value: businessValue },
        children
      )
    )
  );
};

// Define AuthActions interface
interface AuthActionsType {
  updateProfile: (profileUpdates: {
    displayName?: string;
    profile?: any;
  }) => Promise<void>;
}

// Create auth actions context
const AuthActionsContext = createContext<AuthActionsType | undefined>(undefined);

// Custom Hooks
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthActions = (): AuthActionsType => {
  const context = useContext(AuthActionsContext);
  if (context === undefined) {
    throw new Error('useAuthActions must be used within an AuthProvider');
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
