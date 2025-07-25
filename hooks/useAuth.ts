/**
 * React Hooks for Authentication
 * Custom hooks for managing auth state in React components
 */

import { useState, useEffect, useCallback } from 'react';
import { authService, AuthState, UserProfile } from '../services/mockAuthService';

// Hook for authentication state
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(authService.getCurrentAuthState());

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(setAuthState);
    return unsubscribe;
  }, []);

  return authState;
};

// Hook for authentication actions
export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = useCallback(async (
    email: string,
    password: string,
    displayName: string,
    additionalInfo?: Partial<UserProfile['profile']>
  ) => {
    setLoading(true);
    setError(null);
    try {
      await authService.signUp(email, password, displayName, additionalInfo);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.signIn(email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.signOut();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword(email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setLoading(true);
    setError(null);
    try {
      const currentState = authService.getCurrentAuthState();
      if (currentState.user) {
        await authService.updateProfile(updates);
      } else {
        throw new Error('No user logged in');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    clearError,
    loading,
    error
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
    canApproveBusinesses,
    userRole: userProfile?.role || null
  };
};

// Hook for protected routes
export const useAuthGuard = (requiredRole?: 'admin' | 'business_owner') => {
  const { user, userProfile, loading } = useAuth();
  const { isAdmin, isBusinessOwner } = usePermissions();

  const isAuthenticated = !!user;
  const hasRequiredRole = () => {
    if (!requiredRole) return true;
    if (requiredRole === 'admin') return isAdmin();
    if (requiredRole === 'business_owner') return isBusinessOwner();
    return false;
  };

  const canAccess = isAuthenticated && hasRequiredRole();

  return {
    isAuthenticated,
    canAccess,
    loading,
    user,
    userProfile
  };
};
