/**
 * SQLite Authentication Service
 * Provides authentication interface using SQLite database
 */

import { databaseService } from './databaseService';

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
      accessibilityTags?: string[];
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
      supportCauses: string[];
    };
  };
  settings: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisible: boolean;
      reviewsVisible: boolean;
      locationSharing: boolean;
    };
    accessibility: {
      fontSize: 'small' | 'medium' | 'large';
      highContrast: boolean;
      screenReader: boolean;
      voiceCommands: boolean;
    };
  };
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'business_owner';
  businessInfo: {
    businessId: string;
    businessName: string;
    description: string;
    category: string;
    address: string;
    phone: string;
    website?: string;
    hours: {
      [key: string]: string;
    };
    photos: string[];
    accessibilityFeatures: string[];
    amenities: string[];
    verified: boolean;
    claimedAt: string;
  };
  profile: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
  };
  settings: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisible: boolean;
      businessVisible: boolean;
    };
  };
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  businessId: string;
  userId: string;
  userDisplayName: string;
  rating: number;
  comment: string;
  photos?: {
    id: string;
    uri: string;
    caption?: string;
    category: 'accessibility' | 'interior' | 'exterior' | 'menu' | 'staff' | 'event' | 'other';
    uploadedAt: string;
  }[];
  accessibilityTags?: string[];
  helpfulCount?: number;
  createdAt: string;
  updatedAt: string;
}

class SQLiteAuthService {
  private currentUser: UserProfile | BusinessProfile | null = null;
  private initialized = false;

  /**
   * Initialize the auth service and database
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await databaseService.initialize();
      this.initialized = true;
      console.log('✅ SQLite Auth Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize SQLite Auth Service:', error);
      throw error;
    }
  }

  /**
   * Sign in with email and password (mock authentication)
   */
  async signInWithEmailAndPassword(email: string, password: string): Promise<UserProfile | BusinessProfile> {
    await this.initialize();
    
    console.log('🔐 Attempting sign in for:', email);

    // Get user from database
    const dbUser = await databaseService.getUserByEmail(email);
    
    if (!dbUser) {
      throw new Error('User not found. Please check your email or sign up.');
    }

    // Update last login
    await databaseService.updateUserLastLogin(dbUser.id);

    // Parse profile data
    const profileData = JSON.parse(dbUser.profileData || '{}');

    // Create user profile
    if (dbUser.userType === 'business') {
      this.currentUser = {
        uid: dbUser.id,
        email: dbUser.email,
        displayName: dbUser.displayName,
        role: 'business_owner',
        businessInfo: {
          businessId: profileData.businessId || '',
          businessName: profileData.businessName || dbUser.displayName,
          description: profileData.description || '',
          category: profileData.category || '',
          address: profileData.address || '',
          phone: profileData.phone || '',
          website: profileData.website || '',
          hours: profileData.hours || {},
          photos: profileData.photos || [],
          accessibilityFeatures: profileData.accessibilityFeatures || [],
          amenities: profileData.amenities || [],
          verified: profileData.verified || false,
          claimedAt: profileData.claimedAt || dbUser.createdAt
        },
        profile: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          bio: profileData.bio
        },
        settings: profileData.settings || {
          notifications: { email: true, push: true, sms: false },
          privacy: { profileVisible: true, businessVisible: true }
        },
        lastLoginAt: dbUser.lastLoginAt,
        createdAt: dbUser.createdAt,
        updatedAt: new Date().toISOString()
      } as BusinessProfile;
    } else {
      this.currentUser = {
        uid: dbUser.id,
        email: dbUser.email,
        displayName: dbUser.displayName,
        role: dbUser.userType as 'user' | 'admin',
        profile: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          bio: profileData.bio,
          preferredPronouns: profileData.preferredPronouns,
          interests: profileData.interests || [],
          accessibilityNeeds: profileData.accessibilityNeeds || [],
          savedBusinesses: profileData.savedBusinesses || [],
          reviews: profileData.reviews || [],
          accessibilityPreferences: profileData.accessibilityPreferences,
          lgbtqIdentity: profileData.lgbtqIdentity
        },
        settings: profileData.settings || {
          notifications: { email: true, push: true, sms: false },
          privacy: { profileVisible: true, reviewsVisible: true, locationSharing: false },
          accessibility: { fontSize: 'medium', highContrast: false, screenReader: false, voiceCommands: false }
        },
        lastLoginAt: dbUser.lastLoginAt,
        createdAt: dbUser.createdAt,
        updatedAt: new Date().toISOString()
      } as UserProfile;
    }

    console.log('✅ Sign in successful for:', email);
    return this.currentUser;
  }

  /**
   * Create a new user account
   */
  async createUserWithEmailAndPassword(
    email: string, 
    password: string, 
    additionalInfo: { 
      displayName: string; 
      userType: 'user' | 'business'; 
      firstName?: string; 
      lastName?: string;
    }
  ): Promise<UserProfile | BusinessProfile> {
    await this.initialize();
    
    console.log('📝 Creating new user:', email);

    // Check if user already exists
    const existingUser = await databaseService.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email address.');
    }

    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create basic profile data
    const profileData = {
      firstName: additionalInfo.firstName,
      lastName: additionalInfo.lastName,
      bio: '',
      interests: [],
      accessibilityNeeds: [],
      savedBusinesses: [],
      reviews: []
    };

    // Create user in database
    await databaseService.createUser({
      id: userId,
      email,
      displayName: additionalInfo.displayName,
      userType: additionalInfo.userType,
      profileData: JSON.stringify(profileData)
    });

    console.log('✅ User created successfully:', email);
    
    // Sign in the new user
    return this.signInWithEmailAndPassword(email, password);
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    this.currentUser = null;
    console.log('👋 User signed out');
  }

  /**
   * Get the current user
   */
  getCurrentUser(): UserProfile | BusinessProfile | null {
    return this.currentUser;
  }

  /**
   * Add a review for a business
   */
  async addReview(
    businessId: string,
    rating: number,
    comment: string,
    photos: any[] = [],
    accessibilityTags: string[] = []
  ): Promise<void> {
    await this.initialize();
    
    if (!this.currentUser) {
      throw new Error('You must be signed in to add a review.');
    }

    console.log('📝 Adding review for business:', businessId);

    // Add review to database
    const review = await databaseService.addReview({
      businessId,
      userId: this.currentUser.uid,
      rating,
      comment,
      photos,
      accessibilityTags,
      userDisplayName: this.currentUser.displayName
    });

    console.log('✅ Review added successfully:', review.id);
  }

  /**
   * Get all businesses
   */
  async getBusinesses(): Promise<any[]> {
    await this.initialize();
    
    const businesses = await databaseService.getAllBusinesses();
    
    // Get reviews for each business to calculate ratings
    const businessesWithReviews = await Promise.all(
      businesses.map(async (business) => {
        const reviews = await databaseService.getReviewsForBusiness(business.id);
        return {
          id: business.id,
          name: business.name,
          description: business.description,
          category: business.category,
          address: business.address,
          phone: business.phone,
          website: business.website,
          hours: business.hours,
          photos: business.photos,
          accessibilityFeatures: business.accessibilityFeatures,
          amenities: business.amenities,
          averageRating: business.averageRating,
          totalReviews: business.totalReviews,
          reviews: reviews.map(review => ({
            id: review.id,
            userId: review.userId,
            userDisplayName: review.userDisplayName,
            rating: review.rating,
            comment: review.comment,
            photos: JSON.parse(review.photos),
            accessibilityTags: JSON.parse(review.accessibilityTags),
            createdAt: review.createdAt,
            updatedAt: review.updatedAt
          })),
          distance: Math.random() * 10, // Mock distance
          verified: true,
          featured: Math.random() > 0.7,
          createdAt: business.createdAt,
          updatedAt: business.updatedAt
        };
      })
    );

    return businessesWithReviews;
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{ users: number; businesses: number; reviews: number }> {
    await this.initialize();
    return databaseService.getStats();
  }

  /**
   * Clear all data (for testing)
   */
  async clearAllData(): Promise<void> {
    await this.initialize();
    await databaseService.clearAllData();
    this.currentUser = null;
  }
}

// Export a singleton instance
export const sqliteAuthService = new SQLiteAuthService();
