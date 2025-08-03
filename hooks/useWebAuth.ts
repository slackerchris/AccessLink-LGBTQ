/**
 * Web Authentication Hooks using IndexedDB
 * React hooks for authentication state management on web platform
 */

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { webAuthService } from '../services/webAuthService';
import type { AuthUser } from '../services/webAuthService';
import type { Business, Review } from '../services/webDatabaseService';
import React from 'react';

// Auth Context
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, userType?: 'user' | 'business') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
  getProfile: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth service and check for current user
    const initAuth = async () => {
      try {
        await webAuthService.initialize();
        const currentUser = await webAuthService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const authUser = await webAuthService.signInWithEmailAndPassword(email, password);
      setUser(authUser);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, userType: 'user' | 'business' = 'user') => {
    setLoading(true);
    try {
      const authUser = await webAuthService.createUserWithEmailAndPassword(email, password, displayName, userType);
      setUser(authUser);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await webAuthService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      await webAuthService.updateProfile(profileData);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const getProfile = async () => {
    try {
      return await webAuthService.getProfile();
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    getProfile
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

// Main auth hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth actions hook
export function useAuthActions() {
  const { signIn, signUp, signOut, updateProfile, getProfile } = useAuth();
  
  return {
    signIn,
    signUp,
    signOut,
    updateProfile,
    getProfile
  };
}

// Permissions hook
export function usePermissions() {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.userType === 'admin',
    isBusiness: user?.userType === 'business',
    isUser: user?.userType === 'user',
    canManageBusinesses: user?.userType === 'business' || user?.userType === 'admin',
    canManageUsers: user?.userType === 'admin'
  };
}

// Business management hook
export function useBusinessActions() {
  const { user } = useAuth();
  
  const getMyBusinesses = async (): Promise<Business[]> => {
    if (!user) throw new Error('Not authenticated');
    return await webAuthService.getMyBusinesses();
  };

  const createBusiness = async (businessData: Partial<Business>): Promise<Business> => {
    if (!user) throw new Error('Not authenticated');
    return await webAuthService.createBusiness(businessData);
  };

  const updateBusiness = async (businessId: string, updates: Partial<Business>): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    return await webAuthService.updateBusiness(businessId, updates);
  };

  const getAllBusinesses = async (): Promise<Business[]> => {
    return await webAuthService.getAllBusinesses();
  };

  const getBusinessById = async (id: string): Promise<Business | null> => {
    return await webAuthService.getBusinessById(id);
  };

  const getBusinessReviews = async (businessId: string): Promise<Review[]> => {
    return await webAuthService.getBusinessReviews(businessId);
  };

  return {
    getMyBusinesses,
    createBusiness,
    updateBusiness,
    getAllBusinesses,
    getBusinessById,
    getBusinessReviews
  };
}

// Review management hook
export function useReviewActions() {
  const { user } = useAuth();
  
  const addReview = async (businessId: string, rating: number, comment: string, photos: string[] = []): Promise<Review> => {
    if (!user) throw new Error('Not authenticated');
    return await webAuthService.addReview(businessId, rating, comment, photos);
  };

  const getMyReviews = async (): Promise<Review[]> => {
    if (!user) throw new Error('Not authenticated');
    return await webAuthService.getMyReviews();
  };

  const updateReview = async (reviewId: string, rating: number, comment: string, photos: string[] = []): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    return await webAuthService.updateReview(reviewId, rating, comment, photos);
  };

  const deleteReview = async (reviewId: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    return await webAuthService.deleteReview(reviewId);
  };

  return {
    addReview,
    getMyReviews,
    updateReview,
    deleteReview
  };
}

// Admin actions hook
export function useAdminActions() {
  const { user } = useAuth();
  
  const getAllUsers = async () => {
    if (!user || user.userType !== 'admin') {
      throw new Error('Admin access required');
    }
    return await webAuthService.getAllUsers();
  };

  const verifyBusiness = async (businessId: string): Promise<void> => {
    if (!user || user.userType !== 'admin') {
      throw new Error('Admin access required');
    }
    return await webAuthService.verifyBusiness(businessId);
  };

  return {
    getAllUsers,
    verifyBusiness
  };
}
