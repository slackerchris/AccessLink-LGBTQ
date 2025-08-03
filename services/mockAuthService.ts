/**
 * Mock Authentication Service for Development
 * Provides authentication interface without requiring Firebase setup
 */

import { useState } from 'react';
import { validators } from '../utils/validators';

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
    savedBusinesses?: string[];
    reviews?: {
      id: string;
      businessId: string;
      rating: number;
      comment: string;
      photos?: {
        id: string;
        uri: string;
        caption?: string;
        category: 'accessibility' | 'interior' | 'exterior' | 'menu' | 'staff' | 'event' | 'other';
        uploadedAt: string;
      }[];
      accessibilityTags?: string[]; // Tags for specific accessibility features
      helpfulCount?: number;
      createdAt: string;
      updatedAt: string;
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
  };
  businessId?: string; // For business owners
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: any | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

// Mock user data for development
const mockUsers: Record<string, UserProfile> = {
  'admin@accesslinklgbtq.app': {
    uid: 'mock-admin-123',
    email: 'admin@accesslinklgbtq.app',
    displayName: 'Admin User',
    role: 'admin' as const,
    profile: {
      firstName: 'Admin',
      lastName: 'User',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'admin@AccessLinkLGBTQ.app': {
    uid: 'mock-admin-123',
    email: 'admin@AccessLinkLGBTQ.app',
    displayName: 'Admin User',
    role: 'admin' as const,
    profile: {
      firstName: 'Admin',
      lastName: 'User',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'admin': {
    uid: 'mock-admin-789',
    email: 'admin',
    displayName: 'Administrator',
    role: 'admin' as const,
    profile: {
        firstName: 'Admin',
        lastName: 'Istrator',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'business@example.com': {
    uid: 'mock-business-001',
    email: 'business@example.com',
    displayName: 'Rainbow Cafe Owner',
    role: 'business_owner' as const,
    businessId: 'rainbow-cafe-001',
    profile: {
        firstName: 'Cafe',
        lastName: 'Owner',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'owner@pridehealth.com': {
    uid: 'mock-business-002',
    email: 'owner@pridehealth.com',
    displayName: 'Pride Health Center',
    role: 'business_owner' as const,
    businessId: 'pride-health-center-002',
    profile: {
        firstName: 'Pride',
        lastName: 'Health',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'owner@pridefitness.com': {
    uid: 'mock-business-003',
    email: 'owner@pridefitness.com',
    displayName: 'Pride Fitness Studio',
    role: 'business_owner' as const,
    businessId: 'mock-business-3',
    profile: {
        firstName: 'Fitness',
        lastName: 'Studio',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'hello@inclusivebooks.com': {
    uid: 'mock-business-004',
    email: 'hello@inclusivebooks.com',
    displayName: 'Inclusive Bookstore',
    role: 'business_owner' as const,
    businessId: 'inclusive-bookstore-003',
    profile: {
        firstName: 'Inclusive',
        lastName: 'Books',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'user@example.com': {
    uid: 'mock-user-456',
    email: 'user@example.com',
    displayName: 'Demo User',
    role: 'user' as const,
    profile: {
        firstName: 'Demo',
        lastName: 'User',
        savedBusinesses: ['business-123'],
        reviews: [
            {
                id: 'review-1',
                businessId: 'business-123',
                rating: 5,
                comment: 'Great place!',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        ],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

const mockPasswords: Record<string, string> = {
    'admin@accesslinklgbtq.app': 'drowssapnimda-hashed',
    'admin@AccessLinkLGBTQ.app': 'drowssapnimda-hashed',
    'admin': 'drowssapnimda-hashed',
    'business@example.com': '321drowssap-hashed',
    'owner@pridehealth.com': '321drowssap-hashed',
    'owner@pridefitness.com': '321drowssap-hashed',
    'hello@inclusivebooks.com': '321drowssap-hashed',
    'user@example.com': '321drowssap-hashed',
    'newuser@example.com': '321drowssapwen-hashed',
};

// Simulate password hashing
const hashPassword = async (password: string): Promise<string> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const hashedPassword = password.split('').reverse().join('') + '-hashed';
            resolve(hashedPassword);
        }, 100);
    });
};

const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newHashedPassword = password.split('').reverse().join('') + '-hashed';
            resolve(newHashedPassword === hashedPassword);
        }, 100);
    });
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

  async signUp(email: string, password: string, displayName: string, role: string = 'user', additionalInfo?: Partial<UserProfile['profile']>): Promise<UserProfile> {
    // Validate input
    const emailValidation = validators.email(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.message);
    }

    const passwordValidation = validators.password(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    const displayNameValidation = validators.displayName(displayName);
    if (!displayNameValidation.isValid) {
      throw new Error(displayNameValidation.message);
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if user already exists
    if (mockUsers[email as keyof typeof mockUsers]) {
      throw new Error('User already exists with this email');
    }

    const hashedPassword = await hashPassword(password);
    mockPasswords[email] = hashedPassword;

    const mockUser: UserProfile = {
      uid: `mock-${Date.now()}`,
      email,
      displayName,
      role: role as 'user' | 'business_owner' | 'admin',
      profile: {
        firstName: displayName.split(' ')[0] || '',
        lastName: displayName.split(' ')[1] || '',
        bio: '',
        preferredPronouns: '',
        interests: [],
        accessibilityNeeds: [],
        savedBusinesses: [],
        reviews: [],
        accessibilityPreferences: {
          wheelchairAccess: false,
          visualImpairment: false,
          hearingImpairment: false,
          cognitiveSupport: false,
          mobilitySupport: false,
          sensoryFriendly: false
        },
        lgbtqIdentity: {
          visible: false,
          pronouns: '',
          identities: [],
          preferredName: ''
        },
        ...additionalInfo
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockUsers[email] = mockUser;

    this.currentAuthState = {
      user: { uid: mockUser.uid, email: mockUser.email },
      userProfile: mockUser,
      loading: false
    };

    this.notifyListeners();
    return mockUser;
  }

  async signIn(email: string, password: string): Promise<UserProfile> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Try exact match first, then try case-insensitive match for email domains
    let mockUser = mockUsers[email as keyof typeof mockUsers];
    let hashedPassword = mockPasswords[email as keyof typeof mockPasswords];
    
    // If not found, try case-insensitive match for common admin emails
    if (!mockUser || !hashedPassword) {
      const normalizedEmail = email.toLowerCase();
      mockUser = mockUsers[normalizedEmail as keyof typeof mockUsers];
      hashedPassword = mockPasswords[normalizedEmail as keyof typeof mockPasswords];
    }
    
    // Proper error for non-existent user
    if (!mockUser || !hashedPassword) {
      throw { code: 'auth/user-not-found', message: 'User not found' };
    }

    const isPasswordCorrect = await comparePasswords(password, hashedPassword);

    // Password check for mock service
    if (!isPasswordCorrect) {
      throw { code: 'auth/wrong-password', message: 'Incorrect password' };
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
    const emailValidation = validators.email(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.message);
    }

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

  async saveBusiness(businessId: string): Promise<void> {
    if (!this.currentAuthState.userProfile) {
      throw new Error('No user logged in');
    }

    const savedBusinesses = this.currentAuthState.userProfile.profile?.savedBusinesses || [];
    if (!savedBusinesses.includes(businessId)) {
      await this.updateProfile({
        profile: {
          ...this.currentAuthState.userProfile.profile,
          savedBusinesses: [...savedBusinesses, businessId]
        }
      });
    }
  }

  async unsaveBusiness(businessId: string): Promise<void> {
    if (!this.currentAuthState.userProfile) {
      throw new Error('No user logged in');
    }

    const savedBusinesses = this.currentAuthState.userProfile.profile?.savedBusinesses || [];
    await this.updateProfile({
      profile: {
        ...this.currentAuthState.userProfile.profile,
        savedBusinesses: savedBusinesses.filter(id => id !== businessId)
      }
    });
  }

  async addReview(businessId: string, rating: number, comment: string, photos?: Array<{
    uri: string;
    caption?: string;
    category: 'accessibility' | 'interior' | 'exterior' | 'menu' | 'staff' | 'event' | 'other';
  }>, accessibilityTags?: string[]): Promise<void> {
    if (!this.currentAuthState.userProfile) {
      throw new Error('No user logged in');
    }

    const reviews = this.currentAuthState.userProfile.profile?.reviews || [];
    const reviewPhotos = photos?.map(photo => ({
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      uri: photo.uri,
      caption: photo.caption,
      category: photo.category,
      uploadedAt: new Date().toISOString()
    })) || [];

    const newReview = {
      id: `review-${Date.now()}`,
      businessId,
      rating,
      comment,
      photos: reviewPhotos,
      accessibilityTags: accessibilityTags || [],
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.updateProfile({
      profile: {
        ...this.currentAuthState.userProfile.profile,
        reviews: [...reviews, newReview]
      }
    });
  }
}

export const authService = new MockAuthService();
export default authService;
