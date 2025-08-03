/**
 * Native Authentication Hooks for React Native
 * Simple mock authentication for testing purposes
 */

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import React from 'react';

// Mock auth user type
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  userType: 'user' | 'business' | 'admin';
}

// Mock business type
export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  phone: string;
  website: string;
  ownerId: string;
}

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

// Mock business data
const mockBusinesses: Business[] = [
  {
    id: 'business-1',
    name: 'Rainbow Café',
    description: 'LGBTQ+ friendly café with great coffee and community vibes',
    category: 'Restaurant',
    address: '123 Pride Street, Downtown',
    phone: '(555) 123-4567',
    website: 'https://rainbowcafe.com',
    ownerId: 'user-business-1'
  }
];

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auto-login as a business user for testing
    const initAuth = async () => {
      try {
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock business user
        const mockUser: AuthUser = {
          id: 'user-business-1',
          email: 'business@example.com',
          displayName: 'Business Owner',
          userType: 'business'
        };
        
        setUser(mockUser);
        console.log('✅ Mock auth initialized with business user:', mockUser);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Mock signIn called with:', email);
    setLoading(true);
    try {
      // Mock successful login
      const mockUser: AuthUser = {
        id: 'user-business-1',
        email: email,
        displayName: 'Business Owner',
        userType: 'business'
      };
      setUser(mockUser);
      console.log('✅ Mock signIn successful:', mockUser);
    } catch (error) {
      console.error('Mock signIn failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, userType: 'user' | 'business' = 'user') => {
    console.log('Mock signUp called:', { email, displayName, userType });
    setLoading(true);
    try {
      const mockUser: AuthUser = {
        id: 'user-new',
        email,
        displayName,
        userType
      };
      setUser(mockUser);
      console.log('✅ Mock signUp successful:', mockUser);
    } catch (error) {
      console.error('Mock signUp failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('Mock signOut called');
    setUser(null);
  };

  const updateProfile = async (profileData: any) => {
    console.log('Mock updateProfile called:', profileData);
    // Mock update
  };

  const getProfile = async () => {
    console.log('Mock getProfile called');
    return { displayName: user?.displayName };
  };

  return React.createElement(AuthContext.Provider, {
    value: {
      user,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      getProfile
    }
  }, children);
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for business actions
export function useBusinessActions() {
  const getMyBusinesses = async (): Promise<Business[]> => {
    console.log('Mock getMyBusinesses called');
    // Return mock business data
    return mockBusinesses;
  };

  const updateBusiness = async (businessId: string, data: Partial<Business>): Promise<void> => {
    console.log('Mock updateBusiness called:', { businessId, data });
    // Mock update
  };

  const deleteBusiness = async (businessId: string): Promise<void> => {
    console.log('Mock deleteBusiness called:', businessId);
    // Mock delete
  };

  return {
    getMyBusinesses,
    updateBusiness,
    deleteBusiness
  };
}
