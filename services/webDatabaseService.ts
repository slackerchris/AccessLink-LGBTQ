/**
 * Web Database Service using IndexedDB
 * Persistent storage for web platform
 */

import { PasswordUtils } from '../utils/passwordUtils';

// Type definitions
export interface User {
  id: string;
  email: string;
  displayName: string;
  userType: 'user' | 'business' | 'admin';
  passwordHash: string; // Hashed password for authentication
  createdAt: string;
  lastLoginAt: string;
  profileData: string; // JSON string of profile data
  accountStatus?: 'active' | 'inactive' | 'suspended'; // Admin manageable status
  adminNotes?: string; // JSON string of admin notes array
  lastModified?: string; // Last modification timestamp
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
  location: string; // JSON string
  amenities: string; // JSON string
  photos: string; // JSON string array
  lgbtqFriendly: number; // 1 for true, 0 for false
  accessibilityFeatures: string; // JSON string
  verified: number; // 1 for true, 0 for false
  ownerId: string;
  averageRating: number;
  reviewCount: number;
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
  createdAt: string;
  updatedAt: string;
}

class WebDatabaseService {
  private dbName = 'accesslink_db';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = async () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized successfully');
        
        try {
          // Insert sample data after successful initialization
          await this.insertSampleData();
          console.log('✅ Sample data inserted');
          resolve();
        } catch (error) {
          console.error('❌ Error inserting sample data:', error);
          // Don't reject, just continue without sample data
          resolve();
        }
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log('📊 Creating IndexedDB schema...');

        // Create Users table
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id' });
          usersStore.createIndex('email', 'email', { unique: true });
          console.log('✅ Users table created');
        }

        // Create Businesses table
        if (!db.objectStoreNames.contains('businesses')) {
          const businessesStore = db.createObjectStore('businesses', { keyPath: 'id' });
          businessesStore.createIndex('ownerId', 'ownerId', { unique: false });
          console.log('✅ Businesses table created');
        }

        // Create Reviews table
        if (!db.objectStoreNames.contains('reviews')) {
          const reviewsStore = db.createObjectStore('reviews', { keyPath: 'id' });
          reviewsStore.createIndex('businessId', 'businessId', { unique: false });
          reviewsStore.createIndex('userId', 'userId', { unique: false });
          console.log('✅ Reviews table created');
        }
      };
    });
  }

  private async ensureAdminUserExists(): Promise<void> {
    if (!this.db) {
      console.warn('⚠️ Database not initialized, skipping admin user creation');
      return;
    }

    try {
      // Check if admin user exists
      const adminUser = await this.getUserByEmail('admin@accesslinklgbtq.app');
      if (adminUser) {
        console.log('✅ Admin user already exists');
        return;
      }

      // Create admin user with default password
      const passwordHash = await PasswordUtils.getDefaultPasswordHash();
      const adminUserData: User = {
        id: 'admin1',
        email: 'admin@accesslinklgbtq.app',
        displayName: 'AccessLink Admin',
        userType: 'admin',
        passwordHash,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profileData: JSON.stringify({})
      };

      await this.createUser(adminUserData);
      console.log('✅ Admin user created successfully with default password: password123');
    } catch (error) {
      console.warn('⚠️ Could not ensure admin user exists:', error);
      // Don't throw - this is not critical for app functionality
    }
  }

  private async insertSampleData(): Promise<void> {
    if (!this.db) {
      console.warn('⚠️ Database not initialized, skipping sample data insertion');
      return; // Exit gracefully
    }

    // Generate default password hash for all sample users
    const defaultPasswordHash = await PasswordUtils.getDefaultPasswordHash();

    const sampleUsers: User[] = [
      {
        id: 'user1',
        email: 'user@example.com',
        displayName: 'Alex Johnson',
        userType: 'user',
        passwordHash: defaultPasswordHash,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profileData: JSON.stringify({
          lgbtqIdentity: ['Gay', 'Non-binary'],
          pronouns: 'they/them',
          accessibilityNeeds: ['Wheelchair accessible']
        })
      },
      {
        id: 'business1',
        email: 'business@example.com',
        displayName: 'Rainbow Cafe Owner',
        userType: 'business',
        passwordHash: defaultPasswordHash,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profileData: JSON.stringify({})
      },
      {
        id: 'business2',
        email: 'owner@pridehealth.com',
        displayName: 'Pride Health Center',
        userType: 'business',
        passwordHash: defaultPasswordHash,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profileData: JSON.stringify({})
      },
      {
        id: 'business3',
        email: 'owner@pridefitness.com',
        displayName: 'Pride Fitness Studio',
        userType: 'business',
        passwordHash: defaultPasswordHash,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profileData: JSON.stringify({})
      },
      {
        id: 'business4',
        email: 'hello@inclusivebooks.com',
        displayName: 'Inclusive Bookstore',
        userType: 'business',
        passwordHash: defaultPasswordHash,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profileData: JSON.stringify({})
      },
      {
        id: 'owner1',
        email: 'owner@rainbowcafe.com',
        displayName: 'Rainbow Cafe Owner',
        userType: 'business',
        passwordHash: defaultPasswordHash,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profileData: JSON.stringify({})
      },
      {
        id: 'admin1',
        email: 'admin@accesslinklgbtq.app',
        displayName: 'AccessLink Admin',
        userType: 'admin',
        passwordHash: defaultPasswordHash,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profileData: JSON.stringify({})
      }
    ];    const sampleBusinesses: Business[] = [
      {
        id: 'biz1',
        name: 'Rainbow Cafe',
        description: 'A welcoming cafe celebrating diversity and inclusion with amazing coffee and community events.',
        category: 'Restaurant',
        address: '123 Pride Street, Rainbow District',
        phone: '(555) 123-4567',
        website: 'https://rainbowcafe.com',
        hours: JSON.stringify({
          monday: '7:00 AM - 9:00 PM',
          tuesday: '7:00 AM - 9:00 PM',
          wednesday: '7:00 AM - 9:00 PM',
          thursday: '7:00 AM - 9:00 PM',
          friday: '7:00 AM - 10:00 PM',
          saturday: '8:00 AM - 10:00 PM',
          sunday: '8:00 AM - 8:00 PM'
        }),
        location: JSON.stringify({ lat: 40.7128, lng: -74.0060 }),
        amenities: JSON.stringify(['WiFi', 'Outdoor Seating', 'Pet Friendly', 'Live Music']),
        photos: JSON.stringify([]),
        lgbtqFriendly: 1,
        accessibilityFeatures: JSON.stringify(['Wheelchair Accessible', 'Accessible Restrooms']),
        verified: 1,
        ownerId: 'owner1',
        averageRating: 4.5,
        reviewCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'biz2',
        name: 'Equality Books',
        description: 'Independent bookstore specializing in LGBTQ+ literature and community events.',
        category: 'Bookstore',
        address: '456 Equality Avenue, Pride City',
        phone: '(555) 234-5678',
        website: 'https://equalitybooks.com',
        hours: JSON.stringify({
          monday: '10:00 AM - 8:00 PM',
          tuesday: '10:00 AM - 8:00 PM',
          wednesday: '10:00 AM - 8:00 PM',
          thursday: '10:00 AM - 8:00 PM',
          friday: '10:00 AM - 9:00 PM',
          saturday: '9:00 AM - 9:00 PM',
          sunday: '11:00 AM - 7:00 PM'
        }),
        location: JSON.stringify({ lat: 40.7589, lng: -73.9851 }),
        amenities: JSON.stringify(['WiFi', 'Reading Corner', 'Event Space', 'Coffee Bar']),
        photos: JSON.stringify([]),
        lgbtqFriendly: 1,
        accessibilityFeatures: JSON.stringify(['Wheelchair Accessible', 'Large Print Books']),
        verified: 1,
        ownerId: 'owner1',
        averageRating: 4.8,
        reviewCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'biz3',
        name: 'Pride Health Center',
        description: 'Comprehensive healthcare services with LGBTQ+ specialization. Trans-friendly care and hormone therapy available.',
        category: 'Healthcare',
        address: '456 Wellness Ave, Portland, OR 97201',
        phone: '(555) 987-6543',
        website: 'https://pridehealthcenter.org',
        hours: JSON.stringify({
          monday: '8:00 AM - 6:00 PM',
          tuesday: '8:00 AM - 6:00 PM',
          wednesday: '8:00 AM - 6:00 PM',
          thursday: '8:00 AM - 6:00 PM',
          friday: '8:00 AM - 5:00 PM',
          saturday: '9:00 AM - 1:00 PM',
          sunday: 'Closed'
        }),
        location: JSON.stringify({ lat: 45.5152, lng: -122.6784 }),
        amenities: JSON.stringify(['Wheelchair Accessible', 'Private Consultation Rooms', 'LGBTQ+ Specialists']),
        photos: JSON.stringify([]),
        lgbtqFriendly: 1,
        accessibilityFeatures: JSON.stringify(['Wheelchair Accessible', 'Accessible Restrooms', 'Sign Language Interpreters']),
        verified: 1,
        ownerId: 'business2',
        averageRating: 4.9,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'biz4',
        name: 'Pride Fitness Studio',
        description: 'Body-positive fitness studio welcoming all body types and fitness levels. Group classes and personal training available.',
        category: 'Fitness',
        address: '789 Strength Blvd, Austin, TX 78701',
        phone: '(555) 456-7890',
        website: 'https://pridefitness.com',
        hours: JSON.stringify({
          monday: '5:00 AM - 10:00 PM',
          tuesday: '5:00 AM - 10:00 PM',
          wednesday: '5:00 AM - 10:00 PM',
          thursday: '5:00 AM - 10:00 PM',
          friday: '5:00 AM - 9:00 PM',
          saturday: '6:00 AM - 8:00 PM',
          sunday: '7:00 AM - 7:00 PM'
        }),
        location: JSON.stringify({ lat: 30.2672, lng: -97.7431 }),
        amenities: JSON.stringify(['Group Classes', 'Personal Training', 'Accessible Equipment', 'Gender-Neutral Facilities']),
        photos: JSON.stringify([]),
        lgbtqFriendly: 1,
        accessibilityFeatures: JSON.stringify(['Wheelchair Accessible', 'Accessible Equipment', 'Wide Doorways']),
        verified: 1,
        ownerId: 'business3',
        averageRating: 4.7,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'biz5',
        name: 'Inclusive Bookstore',
        description: 'Community bookstore featuring LGBTQ+ literature, diverse authors, and regular community events. Safe space for all.',
        category: 'Retail',
        address: '321 Literary Lane, Seattle, WA 98101',
        phone: '(555) 234-5678',
        website: 'https://inclusivebooks.com',
        hours: JSON.stringify({
          monday: '10:00 AM - 8:00 PM',
          tuesday: '10:00 AM - 8:00 PM',
          wednesday: '10:00 AM - 8:00 PM',
          thursday: '10:00 AM - 8:00 PM',
          friday: '10:00 AM - 9:00 PM',
          saturday: '9:00 AM - 9:00 PM',
          sunday: '11:00 AM - 7:00 PM'
        }),
        location: JSON.stringify({ lat: 47.6062, lng: -122.3321 }),
        amenities: JSON.stringify(['LGBTQ+ Literature', 'Community Events', 'Reading Corner', 'Author Signings']),
        photos: JSON.stringify([]),
        lgbtqFriendly: 1,
        accessibilityFeatures: JSON.stringify(['Wheelchair Accessible', 'Large Print Books', 'Audio Books']),
        verified: 1,
        ownerId: 'business4',
        averageRating: 4.8,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'biz6',
        name: 'Rainbow Cafe (Owner Account)',
        description: 'A welcoming cafe celebrating diversity and inclusion with amazing coffee and community events.',
        category: 'Restaurant',
        address: '123 Pride Street, Rainbow District',
        phone: '(555) 123-4567',
        website: 'https://rainbowcafe.com',
        hours: JSON.stringify({
          monday: '7:00 AM - 9:00 PM',
          tuesday: '7:00 AM - 9:00 PM',
          wednesday: '7:00 AM - 9:00 PM',
          thursday: '7:00 AM - 9:00 PM',
          friday: '7:00 AM - 10:00 PM',
          saturday: '8:00 AM - 10:00 PM',
          sunday: '8:00 AM - 8:00 PM'
        }),
        location: JSON.stringify({ lat: 40.7128, lng: -74.0060 }),
        amenities: JSON.stringify(['WiFi', 'Outdoor Seating', 'Pet Friendly', 'Live Music']),
        photos: JSON.stringify([]),
        lgbtqFriendly: 1,
        accessibilityFeatures: JSON.stringify(['Wheelchair Accessible', 'Accessible Restrooms']),
        verified: 1,
        ownerId: 'business1',
        averageRating: 4.5,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const sampleReviews: Review[] = [
      {
        id: 'review1',
        businessId: 'biz1',
        userId: 'user1',
        rating: 5,
        comment: 'Amazing inclusive space! The staff is so welcoming and the coffee is fantastic.',
        photos: JSON.stringify([]),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'review2',
        businessId: 'biz1',
        userId: 'user1',
        rating: 4,
        comment: 'Great atmosphere and community feel. The monthly book club is wonderful!',
        photos: JSON.stringify([]),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'review3',
        businessId: 'biz2',
        userId: 'user1',
        rating: 5,
        comment: 'Excellent selection of LGBTQ+ books and very knowledgeable staff.',
        photos: JSON.stringify([]),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Insert sample data with error handling
    try {
      await this.insertUsers(sampleUsers);
      await this.insertBusinesses(sampleBusinesses);
      await this.insertReviews(sampleReviews);
      console.log('✅ All sample data inserted successfully');
    } catch (error) {
      console.error('❌ Error inserting sample data:', error);
      // Don't throw - sample data is not critical
    }
  }

  private async getUsersCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async insertUsers(users: User[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');

      users.forEach(user => store.add(user));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private async insertBusinesses(businesses: Business[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['businesses'], 'readwrite');
      const store = transaction.objectStore('businesses');

      businesses.forEach(business => store.add(business));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private async insertReviews(reviews: Review[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['reviews'], 'readwrite');
      const store = transaction.objectStore('reviews');

      reviews.forEach(review => store.add(review));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // User operations
  async getUserByEmail(email: string): Promise<User | null> {
    console.log('🗃️ webDatabaseService.getUserByEmail called with:', email);
    return new Promise((resolve, reject) => {
      if (!this.db) {
        console.log('❌ Database not initialized in getUserByEmail');
        reject(new Error('Database not initialized'));
        return;
      }

      console.log('🔍 Searching for user in IndexedDB...');
      const transaction = this.db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const index = store.index('email');
      const request = index.get(email);

      request.onsuccess = () => {
        const result = request.result || null;
        console.log('📋 IndexedDB query result:', result ? 'User found' : 'User not found', result ? { id: result.id, email: result.email } : null);
        resolve(result);
      };
      request.onerror = () => {
        console.log('❌ IndexedDB query error:', request.error);
        reject(request.error);
      };
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async createUser(user: User): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.add(user);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateUser(user: User): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.put(user);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteUser(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Business operations
  async getAllBusinesses(): Promise<Business[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['businesses'], 'readonly');
      const store = transaction.objectStore('businesses');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getBusinessById(id: string): Promise<Business | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['businesses'], 'readonly');
      const store = transaction.objectStore('businesses');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getBusinessesByOwner(ownerId: string): Promise<Business[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['businesses'], 'readonly');
      const store = transaction.objectStore('businesses');
      const index = store.index('ownerId');
      const request = index.getAll(ownerId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async createBusiness(business: Business): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['businesses'], 'readwrite');
      const store = transaction.objectStore('businesses');
      const request = store.add(business);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateBusiness(business: Business): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['businesses'], 'readwrite');
      const store = transaction.objectStore('businesses');
      const request = store.put(business);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Review operations
  async getAllReviews(): Promise<Review[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['reviews'], 'readonly');
      const store = transaction.objectStore('reviews');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getReviewsByBusiness(businessId: string): Promise<Review[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['reviews'], 'readonly');
      const store = transaction.objectStore('reviews');
      const index = store.index('businessId');
      const request = index.getAll(businessId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['reviews'], 'readonly');
      const store = transaction.objectStore('reviews');
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async createReview(review: Review): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['reviews'], 'readwrite');
      const store = transaction.objectStore('reviews');
      const request = store.add(review);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateReview(review: Review): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['reviews'], 'readwrite');
      const store = transaction.objectStore('reviews');
      const request = store.put(review);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteReview(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['reviews'], 'readwrite');
      const store = transaction.objectStore('reviews');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateBusinessRating(businessId: string): Promise<void> {
    const reviews = await this.getReviewsByBusiness(businessId);
    const business = await this.getBusinessById(businessId);
    
    if (!business) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    business.averageRating = Math.round(averageRating * 10) / 10;
    business.reviewCount = reviews.length;
    business.updatedAt = new Date().toISOString();

    await this.updateBusiness(business);
  }
}

// Export singleton instance
export const databaseService = new WebDatabaseService();
export default databaseService;
