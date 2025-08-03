/**
 * React Hooks for Authentication with SQLite
 * Custom hooks for managing auth state in React components
 */

import { useState, useEffect, useCallback } from 'react';
import { sqliteAuthService, UserProfile, BusinessProfile } from '../services/sqliteAuthService';

// Auth state interface
export interface AuthState {
  isAuthenticated: boolean;
  userProfile: UserProfile | BusinessProfile | null;
  loading: boolean;
}

// Hook for authentication state
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userProfile: null,
    loading: true
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await sqliteAuthService.initialize();
        const currentUser = sqliteAuthService.getCurrentUser();
        setAuthState({
          isAuthenticated: !!currentUser,
          userProfile: currentUser,
          loading: false
        });
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setAuthState({
          isAuthenticated: false,
          userProfile: null,
          loading: false
        });
      }
    };

    initializeAuth();
  }, []);

  // Update auth state when user signs in/out
  const updateAuthState = useCallback(() => {
    const currentUser = sqliteAuthService.getCurrentUser();
    setAuthState({
      isAuthenticated: !!currentUser,
      userProfile: currentUser,
      loading: false
    });
  }, []);

  return { ...authState, updateAuthState };
};

// Hook for authentication actions
export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateAuthState } = useAuth();

  const signUp = useCallback(async (
    email: string,
    password: string,
    displayName: string,
    userType: 'user' | 'business' = 'user',
    additionalInfo?: { firstName?: string; lastName?: string }
  ) => {
    setLoading(true);
    setError(null);
    try {
      await sqliteAuthService.createUserWithEmailAndPassword(email, password, {
        displayName,
        userType,
        firstName: additionalInfo?.firstName,
        lastName: additionalInfo?.lastName
      });
      updateAuthState();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateAuthState]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await sqliteAuthService.signInWithEmailAndPassword(email, password);
      updateAuthState();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateAuthState]);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await sqliteAuthService.signOut();
      updateAuthState();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateAuthState]);

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      // Mock password reset - in real app, this would send an email
      console.log('Password reset requested for:', email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile['profile']>) => {
    setLoading(true);
    setError(null);
    try {
      // For now, we'll implement this later as it requires more complex profile updating
      console.log('Profile update requested:', updates);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveBusiness = useCallback(async (businessId: string) => {
    setLoading(true);
    setError(null);
    try {
      // For now, we'll implement this later
      console.log('Save business requested:', businessId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const unsaveBusiness = useCallback(async (businessId: string) => {
    setLoading(true);
    setError(null);
    try {
      // For now, we'll implement this later
      console.log('Unsave business requested:', businessId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addReview = useCallback(async (
    businessId: string,
    rating: number,
    comment: string,
    photos: any[] = [],
    accessibilityTags: string[] = []
  ) => {
    setLoading(true);
    setError(null);
    try {
      await sqliteAuthService.addReview(businessId, rating, comment, photos, accessibilityTags);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    saveBusiness,
    unsaveBusiness,
    addReview,
    loading,
    error,
    clearError: () => setError(null)
  };
};

// Hook for checking user permissions
export const usePermissions = () => {
  const { userProfile } = useAuth();

  const isAdmin = useCallback(() => {
    return userProfile?.role === 'admin';
  }, [userProfile]);

  const isBusinessOwner = useCallback(() => {
    return userProfile?.role === 'business_owner';
  }, [userProfile]);

  const canManageBusinesses = useCallback(() => {
    return isAdmin() || isBusinessOwner();
  }, [isAdmin, isBusinessOwner]);

  const canApproveBusinesses = useCallback(() => {
    return isAdmin();
  }, [isAdmin]);

  return {
    isAdmin,
    isBusinessOwner,
    canManageBusinesses,
    canApproveBusinesses
  };
};

// Hook for business operations
export const useBusinessActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await sqliteAuthService.getBusinesses();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await sqliteAuthService.getStats();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await sqliteAuthService.clearAllData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getBusinesses,
    getStats,
    clearAllData,
    loading,
    error,
    clearError: () => setError(null)
  };
};
