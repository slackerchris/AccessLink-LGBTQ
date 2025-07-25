/**
 * Mock Authentication Service for Development
 * Provides authentication interface without requiring Firebase setup
 */

import { useState } from 'react';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'business_owner' | 'admin';
  profile: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
    preferredPronouns?: string;
    interests?: string[];
    accessibilityNeeds?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: any | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

// Mock user data for development
const mockUsers = {
  'admin@accesslinklgbtq.app': {
    uid: 'mock-admin-123',
    email: 'admin@accesslinklgbtq.app',
    displayName: 'Admin User',
    role: 'admin' as const,
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      bio: 'System administrator for AccessLink LGBTQ+'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  'user@example.com': {
    uid: 'mock-user-456',
    email: 'user@example.com',
    displayName: 'Demo User',
    role: 'user' as const,
    profile: {
      firstName: 'Demo',
      lastName: 'User',
      bio: 'Community member'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

class MockAuthService {
  private currentAuthState: AuthState = {
    user: null,
    userProfile: null,
    loading: false
  };

  private listeners: Array<(state: AuthState) => void> = [];

  getCurrentAuthState(): AuthState {
    return this.currentAuthState;
  }

  onAuthStateChange(callback: (state: AuthState) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentAuthState));
  }

  async signUp(email: string, password: string, displayName: string, additionalInfo?: Partial<UserProfile['profile']>): Promise<UserProfile> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const uid = `mock-${Date.now()}`;
    const userProfile: UserProfile = {
      uid,
      email,
      displayName,
      role: 'user',
      profile: additionalInfo || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.currentAuthState = {
      user: { uid, email },
      userProfile,
      loading: false
    };

    this.notifyListeners();
    return userProfile;
  }

  async signIn(email: string, password: string): Promise<UserProfile> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockUser = mockUsers[email as keyof typeof mockUsers];
    if (!mockUser) {
      throw new Error('Invalid email or password');
    }

    this.currentAuthState = {
      user: { uid: mockUser.uid, email: mockUser.email },
      userProfile: mockUser,
      loading: false
    };

    this.notifyListeners();
    return mockUser;
  }

  async signOut(): Promise<void> {
    this.currentAuthState = {
      user: null,
      userProfile: null,
      loading: false
    };

    this.notifyListeners();
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!this.currentAuthState.userProfile) {
      throw new Error('No user logged in');
    }

    this.currentAuthState.userProfile = {
      ...this.currentAuthState.userProfile,
      ...updates,
      updatedAt: new Date()
    };

    this.notifyListeners();
  }

  async resetPassword(email: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Password reset email sent to ${email}`);
  }

  async deleteAccount(): Promise<void> {
    this.currentAuthState = {
      user: null,
      userProfile: null,
      loading: false
    };

    this.notifyListeners();
  }
}

export const authService = new MockAuthService();
export default authService;
