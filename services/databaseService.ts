/**
 * SQLite Database Service
 * Handles all database operations for the AccessLink LGBTQ+ app
 */

import * as SQLite from 'expo-sqlite';

// Database and table names
const DATABASE_NAME = 'accesslink.db';

// Type definitions
export interface User {
  id: string;
  email: string;
  displayName: string;
  userType: 'user' | 'business' | 'admin';
  createdAt: string;
  lastLoginAt: string;
  profileData: string; // JSON string of profile data
}

export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  phone: string;
  website: string;
  hours: string; // JSON string
  photos: string; // JSON string array
  accessibilityFeatures: string; // JSON string array
  amenities: string; // JSON string array
  averageRating: number;
  totalReviews: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  businessId: string;
  userId: string;
  rating: number;
  comment: string;
  photos: string; // JSON string array
  accessibilityTags: string; // JSON string array
  createdAt: string;
  updatedAt: string;
  userDisplayName: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private initialized = false;

  /**
   * Initialize the database and create tables
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await this.createTables();
      await this.insertSampleData();
      this.initialized = true;
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Create all necessary tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Users table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        displayName TEXT NOT NULL,
        userType TEXT NOT NULL DEFAULT 'user',
        createdAt TEXT NOT NULL,
        lastLoginAt TEXT NOT NULL,
        profileData TEXT DEFAULT '{}'
      );
    `);

    // Businesses table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS businesses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT,
        website TEXT,
        hours TEXT DEFAULT '{}',
        photos TEXT DEFAULT '[]',
        accessibilityFeatures TEXT DEFAULT '[]',
        amenities TEXT DEFAULT '[]',
        averageRating REAL DEFAULT 0,
        totalReviews INTEGER DEFAULT 0,
        ownerId TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (ownerId) REFERENCES users (id)
      );
    `);

    // Reviews table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        businessId TEXT NOT NULL,
        userId TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT NOT NULL,
        photos TEXT DEFAULT '[]',
        accessibilityTags TEXT DEFAULT '[]',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        userDisplayName TEXT NOT NULL,
        FOREIGN KEY (businessId) REFERENCES businesses (id),
        FOREIGN KEY (userId) REFERENCES users (id)
      );
    `);

    console.log('✅ Database tables created successfully');
  }

  /**
   * Insert sample data if tables are empty
   */
  private async insertSampleData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Check if we already have data
    const userCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM users');
    if ((userCount as any)?.count > 0) {
      console.log('📊 Sample data already exists, skipping insertion');
      return;
    }

    console.log('📊 Inserting sample data...');

    // Insert sample users
    const sampleUsers = [
      {
        id: 'user-1',
        email: 'user@example.com',
        displayName: 'Demo User',
        userType: 'user',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profileData: JSON.stringify({
          bio: 'Community member exploring inclusive spaces',
          accessibilityNeeds: ['Wheelchair Accessible', 'Good Lighting'],
          lgbtqIdentity: ['Ally']
        })
      },
      {
        id: 'business-owner-1',
        email: 'owner@rainbowcafe.com',
        displayName: 'Rainbow Café Owner',
        userType: 'business',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profileData: JSON.stringify({
          businessName: 'Rainbow Café',
          ownerBio: 'Proud to serve the LGBTQ+ community'
        })
      }
    ];

    for (const user of sampleUsers) {
      await this.db.runAsync(
        'INSERT INTO users (id, email, displayName, userType, createdAt, lastLoginAt, profileData) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user.id, user.email, user.displayName, user.userType, user.createdAt, user.lastLoginAt, user.profileData]
      );
    }

    // Insert sample businesses
    const sampleBusinesses = [
      {
        id: 'rainbow-cafe-001',
        name: 'Rainbow Café',
        description: 'A welcoming space for everyone in the LGBTQ+ community. Great coffee, delicious pastries, and a safe environment for all.',
        category: 'Restaurant',
        address: '123 Pride Street, Rainbow District',
        phone: '(555) 123-4567',
        website: 'https://rainbowcafe.com',
        hours: JSON.stringify({
          monday: '7:00 AM - 6:00 PM',
          tuesday: '7:00 AM - 6:00 PM',
          wednesday: '7:00 AM - 6:00 PM',
          thursday: '7:00 AM - 6:00 PM',
          friday: '7:00 AM - 8:00 PM',
          saturday: '8:00 AM - 8:00 PM',
          sunday: '8:00 AM - 5:00 PM'
        }),
        photos: JSON.stringify([
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
          'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80'
        ]),
        accessibilityFeatures: JSON.stringify([
          'Wheelchair Accessible',
          'Wide Doorways',
          'Accessible Bathroom',
          'Good Lighting',
          'Easy Navigation'
        ]),
        amenities: JSON.stringify([
          'WiFi',
          'Outdoor Seating',
          'Pet Friendly',
          'Vegan Options',
          'Gender Neutral Bathrooms'
        ]),
        averageRating: 4.5,
        totalReviews: 0,
        ownerId: 'business-owner-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'equality-bookstore-002',
        name: 'Equality Bookstore',
        description: 'Independent bookstore featuring LGBTQ+ authors, diverse voices, and community events.',
        category: 'Retail',
        address: '456 Diversity Ave, Community Center',
        phone: '(555) 234-5678',
        website: 'https://equalitybookstore.com',
        hours: JSON.stringify({
          monday: '10:00 AM - 7:00 PM',
          tuesday: '10:00 AM - 7:00 PM',
          wednesday: '10:00 AM - 7:00 PM',
          thursday: '10:00 AM - 7:00 PM',
          friday: '10:00 AM - 8:00 PM',
          saturday: '9:00 AM - 8:00 PM',
          sunday: '11:00 AM - 6:00 PM'
        }),
        photos: JSON.stringify([
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80'
        ]),
        accessibilityFeatures: JSON.stringify([
          'Wheelchair Accessible',
          'Wide Aisles',
          'Good Lighting',
          'Audio Books Available'
        ]),
        amenities: JSON.stringify([
          'Reading Areas',
          'Community Events',
          'Author Readings',
          'Book Clubs',
          'WiFi'
        ]),
        averageRating: 4.8,
        totalReviews: 0,
        ownerId: 'business-owner-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const business of sampleBusinesses) {
      await this.db.runAsync(
        'INSERT INTO businesses (id, name, description, category, address, phone, website, hours, photos, accessibilityFeatures, amenities, averageRating, totalReviews, ownerId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          business.id, business.name, business.description, business.category,
          business.address, business.phone, business.website, business.hours,
          business.photos, business.accessibilityFeatures, business.amenities,
          business.averageRating, business.totalReviews, business.ownerId,
          business.createdAt, business.updatedAt
        ]
      );
    }

    console.log('✅ Sample data inserted successfully');
  }

  /**
   * User operations
   */
  async createUser(userData: Omit<User, 'createdAt' | 'lastLoginAt'>): Promise<User> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const user: User = {
      ...userData,
      createdAt: now,
      lastLoginAt: now
    };

    await this.db.runAsync(
      'INSERT INTO users (id, email, displayName, userType, createdAt, lastLoginAt, profileData) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user.id, user.email, user.displayName, user.userType, user.createdAt, user.lastLoginAt, user.profileData]
    );

    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync('SELECT * FROM users WHERE email = ?', [email]);
    return result as User | null;
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'UPDATE users SET lastLoginAt = ? WHERE id = ?',
      [new Date().toISOString(), userId]
    );
  }

  /**
   * Business operations
   */
  async getAllBusinesses(): Promise<Business[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync('SELECT * FROM businesses ORDER BY name');
    return results.map(row => {
      const businessRow = row as any;
      return {
        id: businessRow.id,
        name: businessRow.name,
        description: businessRow.description,
        category: businessRow.category,
        address: businessRow.address,
        phone: businessRow.phone,
        website: businessRow.website,
        hours: JSON.parse(businessRow.hours || '{}'),
        photos: JSON.parse(businessRow.photos || '[]'),
        accessibilityFeatures: JSON.parse(businessRow.accessibilityFeatures || '[]'),
        amenities: JSON.parse(businessRow.amenities || '[]'),
        averageRating: businessRow.averageRating,
        totalReviews: businessRow.totalReviews,
        ownerId: businessRow.ownerId,
        createdAt: businessRow.createdAt,
        updatedAt: businessRow.updatedAt
      } as Business;
    });
  }

  async getBusinessById(businessId: string): Promise<Business | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync('SELECT * FROM businesses WHERE id = ?', [businessId]);
    if (!result) return null;

    const businessRow = result as any;
    return {
      id: businessRow.id,
      name: businessRow.name,
      description: businessRow.description,
      category: businessRow.category,
      address: businessRow.address,
      phone: businessRow.phone,
      website: businessRow.website,
      hours: JSON.parse(businessRow.hours || '{}'),
      photos: JSON.parse(businessRow.photos || '[]'),
      accessibilityFeatures: JSON.parse(businessRow.accessibilityFeatures || '[]'),
      amenities: JSON.parse(businessRow.amenities || '[]'),
      averageRating: businessRow.averageRating,
      totalReviews: businessRow.totalReviews,
      ownerId: businessRow.ownerId,
      createdAt: businessRow.createdAt,
      updatedAt: businessRow.updatedAt
    } as Business;
  }

  /**
   * Review operations
   */
  async addReview(reviewData: {
    businessId: string;
    userId: string;
    rating: number;
    comment: string;
    photos?: any[];
    accessibilityTags?: string[];
    userDisplayName: string;
  }): Promise<Review> {
    if (!this.db) throw new Error('Database not initialized');

    const reviewId = `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const review: Review = {
      id: reviewId,
      businessId: reviewData.businessId,
      userId: reviewData.userId,
      rating: reviewData.rating,
      comment: reviewData.comment,
      photos: JSON.stringify(reviewData.photos || []),
      accessibilityTags: JSON.stringify(reviewData.accessibilityTags || []),
      createdAt: now,
      updatedAt: now,
      userDisplayName: reviewData.userDisplayName
    };

    // Insert the review
    await this.db.runAsync(
      'INSERT INTO reviews (id, businessId, userId, rating, comment, photos, accessibilityTags, createdAt, updatedAt, userDisplayName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        review.id, review.businessId, review.userId, review.rating,
        review.comment, review.photos, review.accessibilityTags,
        review.createdAt, review.updatedAt, review.userDisplayName
      ]
    );

    // Update business rating
    await this.updateBusinessRating(reviewData.businessId);

    console.log('✅ Review added successfully:', reviewId);
    return review;
  }

  async getReviewsForBusiness(businessId: string): Promise<Review[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync(
      'SELECT * FROM reviews WHERE businessId = ? ORDER BY createdAt DESC',
      [businessId]
    );

    return results.map(row => {
      const reviewRow = row as any;
      return {
        id: reviewRow.id,
        businessId: reviewRow.businessId,
        userId: reviewRow.userId,
        rating: reviewRow.rating,
        comment: reviewRow.comment,
        photos: JSON.parse(reviewRow.photos || '[]'),
        accessibilityTags: JSON.parse(reviewRow.accessibilityTags || '[]'),
        createdAt: reviewRow.createdAt,
        updatedAt: reviewRow.updatedAt,
        userDisplayName: reviewRow.userDisplayName
      } as Review;
    });
  }

  private async updateBusinessRating(businessId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync(
      'SELECT AVG(rating) as avgRating, COUNT(*) as totalReviews FROM reviews WHERE businessId = ?',
      [businessId]
    );

    const avgRating = (result as any)?.avgRating || 0;
    const totalReviews = (result as any)?.totalReviews || 0;

    await this.db.runAsync(
      'UPDATE businesses SET averageRating = ?, totalReviews = ?, updatedAt = ? WHERE id = ?',
      [avgRating, totalReviews, new Date().toISOString(), businessId]
    );
  }

  /**
   * Clear all data (for testing/reset purposes)
   */
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync('DELETE FROM reviews');
    await this.db.execAsync('DELETE FROM businesses');
    await this.db.execAsync('DELETE FROM users');
    
    console.log('🗑️ All data cleared from database');
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{ users: number; businesses: number; reviews: number }> {
    if (!this.db) throw new Error('Database not initialized');

    const userCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM users');
    const businessCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM businesses');
    const reviewCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM reviews');

    return {
      users: (userCount as any)?.count || 0,
      businesses: (businessCount as any)?.count || 0,
      reviews: (reviewCount as any)?.count || 0
    };
  }
}

// Export a singleton instance
export const databaseService = new DatabaseService();
