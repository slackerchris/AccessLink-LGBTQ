/**
 * Web Authentication Service using IndexedDB
 * Handles user authentication and authorization for web platform
 */

import { databaseService } from './webDatabaseService';
import { debugService } from './debugService';
import { PasswordUtils } from '../utils/passwordUtils';
import type { User, Business, Review } from './webDatabaseService';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  userType: 'user' | 'business' | 'admin';
}

class WebAuthService {
  private currentUser: AuthUser | null = null;

  async initialize(): Promise<void> {
    // Initialize the database service first
    await databaseService.initialize();
    debugService.info('Auth', 'Web Auth Service initialized');
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    debugService.debug('Auth', 'Getting current user', { userId: this.currentUser?.id });
    return this.currentUser;
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<AuthUser> {
    debugService.info('Auth', 'Attempting to sign in', { email });
    
    // Get user from database
    const user = await databaseService.getUserByEmail(email);
    
    if (!user) {
      debugService.warn('Auth', 'Login failed - user not found', { email });
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await PasswordUtils.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      debugService.warn('Auth', 'Login failed - invalid password', { email });
      throw new Error('Invalid email or password');
    }

    // Check account status
    if (user.accountStatus === 'suspended') {
      debugService.warn('Auth', 'Login failed - account suspended', { email });
      throw new Error('Account is suspended. Please contact support.');
    }

    if (user.accountStatus === 'inactive') {
      debugService.warn('Auth', 'Login failed - account inactive', { email });
      throw new Error('Account is inactive. Please contact support.');
    }

    // Update last login time
    user.lastLoginAt = new Date().toISOString();
    await databaseService.updateUser(user);

    this.currentUser = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      userType: user.userType
    };

    debugService.info('Auth', 'User signed in successfully', { 
      userId: this.currentUser.id, 
      userType: this.currentUser.userType,
      displayName: this.currentUser.displayName 
    });
    return this.currentUser;
  }

  async createUserWithEmailAndPassword(email: string, password: string, displayName: string, userType: 'user' | 'business' = 'user'): Promise<AuthUser> {
    debugService.info('Auth', 'Creating new user', { email, userType });
    
    // Check if user already exists
    const existingUser = await databaseService.getUserByEmail(email);
    if (existingUser) {
      debugService.warn('Auth', 'User creation failed - user already exists', { email });
      throw new Error('User already exists');
    }

    // Hash the password
    const passwordHash = await PasswordUtils.hashPassword(password);

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      displayName,
      userType,
      passwordHash,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      profileData: JSON.stringify({}),
      accountStatus: 'active'
    };

    await databaseService.createUser(newUser);

    this.currentUser = {
      id: newUser.id,
      email: newUser.email,
      displayName: newUser.displayName,
      userType: newUser.userType
    };

    debugService.info('Auth', 'User created successfully', { 
      userId: this.currentUser.id,
      displayName: this.currentUser.displayName 
    });
    return this.currentUser;
  }

  async signOut(): Promise<void> {
    console.log('👋 Signing out user');
    this.currentUser = null;
  }

  async updateProfile(profileData: any): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }

    const user = await databaseService.getUserById(this.currentUser.id);
    if (!user) {
      throw new Error('User not found');
    }

    // Merge with existing profile data
    const existingProfile = JSON.parse(user.profileData || '{}');
    const updatedProfile = { ...existingProfile, ...profileData };
    
    user.profileData = JSON.stringify(updatedProfile);
    await databaseService.updateUser(user);

    console.log('✅ Profile updated for:', this.currentUser.displayName);
  }

  async getProfile(): Promise<any> {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }

    const user = await databaseService.getUserById(this.currentUser.id);
    if (!user) {
      throw new Error('User not found');
    }

    return JSON.parse(user.profileData || '{}');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }

    debugService.info('Auth', 'Attempting password change', { userId: this.currentUser.id });

    const user = await databaseService.getUserById(this.currentUser.id);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await PasswordUtils.verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      debugService.warn('Auth', 'Password change failed - invalid current password', { userId: this.currentUser.id });
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await PasswordUtils.hashPassword(newPassword);
    
    // Update user with new password hash
    user.passwordHash = newPasswordHash;
    user.lastModified = new Date().toISOString();
    await databaseService.updateUser(user);

    debugService.info('Auth', 'Password changed successfully', { userId: this.currentUser.id });
  }

  // Business management methods
  async getMyBusinesses(): Promise<Business[]> {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }

    return await databaseService.getBusinessesByOwner(this.currentUser.id);
  }

  async createBusiness(businessData: Partial<Business>): Promise<Business> {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }

    const business: Business = {
      id: `biz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: businessData.name || '',
      description: businessData.description || '',
      category: businessData.category || '',
      address: businessData.address || '',
      phone: businessData.phone || '',
      website: businessData.website || '',
      hours: businessData.hours || JSON.stringify({}),
      location: businessData.location || JSON.stringify({}),
      amenities: businessData.amenities || JSON.stringify([]),
      photos: businessData.photos || JSON.stringify([]),
      lgbtqFriendly: businessData.lgbtqFriendly ?? 1,
      accessibilityFeatures: businessData.accessibilityFeatures || JSON.stringify([]),
      verified: 0,
      ownerId: this.currentUser.id,
      averageRating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await databaseService.createBusiness(business);
    console.log('✅ Business created:', business.name);
    return business;
  }

  async updateBusiness(businessId: string, updates: Partial<Business>): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }

    const business = await databaseService.getBusinessById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    if (business.ownerId !== this.currentUser.id && this.currentUser.userType !== 'admin') {
      throw new Error('Not authorized to update this business');
    }

    const updatedBusiness = {
      ...business,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await databaseService.updateBusiness(updatedBusiness);
    console.log('✅ Business updated:', business.name);
  }

  // Review methods
  async addReview(businessId: string, rating: number, comment: string, photos: string[] = []): Promise<Review> {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }

    const review: Review = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      businessId,
      userId: this.currentUser.id,
      rating,
      comment,
      photos: JSON.stringify(photos),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await databaseService.createReview(review);
    await databaseService.updateBusinessRating(businessId);
    
    console.log('✅ Review added for business:', businessId);
    return review;
  }

  async getMyReviews(): Promise<Review[]> {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }

    return await databaseService.getReviewsByUser(this.currentUser.id);
  }

  async updateReview(reviewId: string, rating: number, comment: string, photos: string[] = []): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }

    const existingReviews = await this.getMyReviews();
    const review = existingReviews.find(r => r.id === reviewId);
    
    if (!review) {
      throw new Error('Review not found or not owned by user');
    }

    const updatedReview: Review = {
      ...review,
      rating,
      comment,
      photos: JSON.stringify(photos),
      updatedAt: new Date().toISOString()
    };

    await databaseService.updateReview(updatedReview);
    await databaseService.updateBusinessRating(review.businessId);
    
    console.log('✅ Review updated:', reviewId);
  }

  async deleteReview(reviewId: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }

    const existingReviews = await this.getMyReviews();
    const review = existingReviews.find(r => r.id === reviewId);
    
    if (!review) {
      throw new Error('Review not found or not owned by user');
    }

    await databaseService.deleteReview(reviewId);
    await databaseService.updateBusinessRating(review.businessId);
    
    console.log('✅ Review deleted:', reviewId);
  }

  // Public data access methods
  async getAllBusinesses(): Promise<Business[]> {
    return await databaseService.getAllBusinesses();
  }

  async getBusinessById(id: string): Promise<Business | null> {
    return await databaseService.getBusinessById(id);
  }

  async getBusinessReviews(businessId: string): Promise<Review[]> {
    return await databaseService.getReviewsByBusiness(businessId);
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    if (!this.currentUser || this.currentUser.userType !== 'admin') {
      throw new Error('Admin access required');
    }

    // For IndexedDB, we need to implement a getAllUsers method
    // This is a simplified version - in a real app, you'd implement proper pagination
    return [];
  }

  async verifyBusiness(businessId: string): Promise<void> {
    if (!this.currentUser || this.currentUser.userType !== 'admin') {
      throw new Error('Admin access required');
    }

    const business = await databaseService.getBusinessById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    business.verified = 1;
    business.updatedAt = new Date().toISOString();
    await databaseService.updateBusiness(business);
    
    console.log('✅ Business verified:', business.name);
  }
}

// Export singleton instance
export const webAuthService = new WebAuthService();
export default webAuthService;
