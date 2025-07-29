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
  'admin': {
    uid: 'mock-admin-789',
    email: 'admin',
    displayName: 'Administrator',
    role: 'admin' as const,
    profile: {
      firstName: 'System',
      lastName: 'Administrator',
      bio: 'Primary admin account for AccessLink LGBTQ+'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  'business@example.com': {
    uid: 'mock-business-001',
    email: 'business@example.com',
    displayName: 'Rainbow Cafe Owner',
    role: 'business_owner' as const,
    profile: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      bio: 'Owner of Rainbow Cafe - creating inclusive spaces since 2020',
      phone: '(555) 123-4567'
    },
    businessId: 'rainbow-cafe-001',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  'owner@pridehealth.com': {
    uid: 'mock-business-002',
    email: 'owner@pridehealth.com',
    displayName: 'Pride Health Center',
    role: 'business_owner' as const,
    profile: {
      firstName: 'Dr. Alex',
      lastName: 'Martinez',
      bio: 'Medical Director at Pride Health Center - LGBTQ+ affirming healthcare',
      phone: '(555) 987-6543'
    },
    businessId: 'pride-health-center-002',
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
      bio: 'Community member',
      savedBusinesses: ['rainbow-cafe-001'],
      reviews: [
        {
          id: 'review-1',
          businessId: 'rainbow-cafe-001',
          rating: 5,
          comment: 'Amazing coffee and such a welcoming space! The staff is incredibly friendly and the atmosphere is perfect for both working and socializing. Highly recommend their rainbow latte!',
          createdAt: '2025-01-15T10:30:00Z',
          updatedAt: '2025-01-15T10:30:00Z'
        },
        {
          id: 'review-2',
          businessId: 'pride-health-center-002',
          rating: 4,
          comment: 'Great healthcare experience. Dr. Martinez was very knowledgeable and made me feel comfortable throughout my visit. The only downside was the longer wait time.',
          createdAt: '2025-01-10T14:20:00Z',
          updatedAt: '2025-01-12T09:15:00Z'
        },
        {
          id: 'review-3',
          businessId: 'inclusive-bookstore-003',
          rating: 5,
          comment: 'Love this bookstore! They have an incredible selection of LGBTQ+ literature and the community events are fantastic. A true gem in the neighborhood.',
          createdAt: '2025-01-05T16:45:00Z',
          updatedAt: '2025-01-05T16:45:00Z'
        }
      ],
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
      }
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

  async signUp(email: string, password: string, displayName: string, role: string = 'user'): Promise<UserProfile> {
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
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

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

    const mockUser = mockUsers[email as keyof typeof mockUsers];
    if (!mockUser) {
      throw new Error('Invalid email or password');
    }

    // Password validation for demo accounts
    const validPasswords: { [key: string]: string } = {
      'admin@accesslinklgbtq.app': 'admin123',
      'admin': 'accesslink1234',
      'business@example.com': 'password123',
      'owner@pridehealth.com': 'password123',
      'user@example.com': 'password123'
    };

    if (password !== validPasswords[email]) {
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

  async addReview(businessId: string, rating: number, comment: string): Promise<void> {
    if (!this.currentAuthState.userProfile) {
      throw new Error('No user logged in');
    }

    const reviews = this.currentAuthState.userProfile.profile?.reviews || [];
    const newReview = {
      id: `review-${Date.now()}`,
      businessId,
      rating,
      comment,
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
