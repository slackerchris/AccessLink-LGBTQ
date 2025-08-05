/**
 * Enhanced Business Service with optimized database access
 * Implements denormalized collections with improved resilience and validation
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  DocumentSnapshot,
  QueryConstraint,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from './authService';
import { 
  BusinessListing, 
  BusinessCategory, 
  ApprovedBusiness, 
  BusinessByLocation,
  FeaturedBusiness
} from './properBusinessService';

// Import our new services
import { dataValidation } from './dataValidationService';
import { businessCache, locationCache } from './cacheService';
import { databaseResilience } from './databaseResilienceService';
import { FirestoreTimestamp, PaginatedResult, DbResult, createTimestamps, updateTimestamp } from '../types/firestore';

class EnhancedBusinessService {
  // Collection names
  private businessCollection = 'businesses';
  private approvedBusinessesCollection = 'approved_businesses';
  private businessesByLocationCollection = 'businesses_by_location';
  private featuredBusinessesCollection = 'featured_businesses';
  
  // Cache TTL values
  private CACHE_TTL = {
    business: 5 * 60 * 1000, // 5 minutes
    listing: 10 * 60 * 1000, // 10 minutes
    category: 15 * 60 * 1000, // 15 minutes
    location: 30 * 60 * 1000  // 30 minutes
  };

  /**
   * Get business by ID with caching
   */
  public async getBusiness(businessId: string): Promise<DbResult<BusinessListing | null>> {
    const cacheKey = `business_${businessId}`;
    
    try {
      // Try to get from cache first
      const cached = businessCache.get<BusinessListing>(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }
      
      // Get from database with retry
      const result = await databaseResilience.executeWithRetry(async () => {
        const docRef = doc(db, this.businessCollection, businessId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const business = { 
            id: docSnap.id, 
            ...docSnap.data() 
          } as BusinessListing;
          
          // Store in cache
          businessCache.set(cacheKey, business);
          return business;
        }
        
        return null;
      });
      
      return result;
    } catch (error) {
      return databaseResilience.handleError(error);
    }
  }

  /**
   * Create business with validation
   */
  public async createBusiness(
    businessData: Omit<BusinessListing, 'id' | 'createdAt' | 'updatedAt' | 'averageRating' | 'totalReviews'>,
    userProfile: UserProfile
  ): Promise<DbResult<string>> {
    try {
      // Check if user is business owner or admin
      if (userProfile.role !== 'business_owner' && userProfile.role !== 'admin') {
        return { 
          success: false, 
          error: new Error('Only business owners and admins can create listings'),
          code: 'permission-denied'
        };
      }
      
      // Validate business data
      const validation = dataValidation.validateBusiness(businessData);
      if (!validation.valid) {
        return {
          success: false,
          error: new Error(`Validation failed: ${validation.errors.join(', ')}`),
          code: 'validation-failed'
        };
      }

      // Create business with retry logic
      const result = await databaseResilience.executeWithRetry(async () => {
        // Prepare business data with timestamps
        const newBusiness: Omit<BusinessListing, 'id'> = {
          ...businessData,
          ownerId: userProfile.uid,
          status: userProfile.role === 'admin' ? 'approved' : 'pending',
          featured: false,
          averageRating: 0,
          totalReviews: 0,
          ...createTimestamps() // Add timestamps
        };

        const docRef = await addDoc(collection(db, this.businessCollection), newBusiness);
        
        // If admin created or auto-approved, add to optimized collections
        if (newBusiness.status === 'approved') {
          const businessWithId = { id: docRef.id, ...newBusiness };
          await this.addToOptimizedCollections(docRef.id, businessWithId);
        }
        
        return docRef.id;
      });
      
      // Clear category caches if successful
      if (result.success && result.data) {
        this.clearCategoryCache(businessData.category);
      }
      
      return result;
    } catch (error) {
      return databaseResilience.handleError(error);
    }
  }

  /**
   * Update business with validation and optimistic updates
   */
  public async updateBusiness(
    businessId: string,
    updates: Partial<BusinessListing>,
    userProfile: UserProfile
  ): Promise<DbResult<void>> {
    try {
      // Get current business data
      const businessResult = await this.getBusiness(businessId);
      if (!businessResult.success || !businessResult.data) {
        return { 
          success: false, 
          error: new Error('Business not found'),
          code: 'not-found' 
        };
      }
      
      const business = businessResult.data;
      
      // Check permissions
      if (userProfile.role !== 'admin' && business.ownerId !== userProfile.uid) {
        return { 
          success: false, 
          error: new Error('You can only update your own business listings'),
          code: 'permission-denied'
        };
      }
      
      // Don't allow changing certain fields
      const safeUpdates = { ...updates };
      delete safeUpdates.id;
      delete safeUpdates.ownerId;
      delete safeUpdates.createdAt;
      delete safeUpdates.status; // Status changes should use specific methods
      delete safeUpdates.featured; // Featured changes should use specific methods
      
      // If category changed, clear both old and new category caches
      const categoryChanged = safeUpdates.category && safeUpdates.category !== business.category;
      if (categoryChanged) {
        this.clearCategoryCache(business.category);
        if (safeUpdates.category) {
          this.clearCategoryCache(safeUpdates.category);
        }
      }
      
      // Update with retry logic
      const result = await databaseResilience.executeWithRetry(async () => {
        // Update main record
        const docRef = doc(db, this.businessCollection, businessId);
        await updateDoc(docRef, {
          ...safeUpdates,
          ...updateTimestamp() // Update timestamp
        });
        
        // If business is approved, update optimized collections
        if (business.status === 'approved') {
          const updatedBusiness = { 
            ...business, 
            ...safeUpdates 
          };
          
          await this.updateOptimizedCollections(businessId, updatedBusiness);
        }
      });
      
      // Clear cache on success
      if (result.success) {
        businessCache.delete(`business_${businessId}`);
      }
      
      return result;
    } catch (error) {
      return databaseResilience.handleError(error);
    }
  }

  /**
   * Fast directory listing - optimized for initial load with caching
   */
  public async getApprovedBusinesses(
    pageLimit: number = 20,
    lastDoc?: DocumentSnapshot
  ): Promise<DbResult<PaginatedResult<ApprovedBusiness>>> {
    // Use cache if requesting first page with no lastDoc
    const cacheKey = `approved_businesses_${pageLimit}`;
    if (!lastDoc) {
      const cached = businessCache.get<PaginatedResult<ApprovedBusiness>>(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }
    }
    
    try {
      // Get from database with retry
      const result = await databaseResilience.executeWithRetry(async () => {
        const constraints: QueryConstraint[] = [
          orderBy('lastActive', 'desc'),
          limit(pageLimit)
        ];

        if (lastDoc) {
          constraints.push(startAfter(lastDoc));
        }

        const q = query(collection(db, this.approvedBusinessesCollection), ...constraints);
        const querySnapshot = await getDocs(q);

        const businesses: ApprovedBusiness[] = [];
        let newLastDoc: DocumentSnapshot | null = null;

        querySnapshot.forEach((doc) => {
          businesses.push({ id: doc.id, ...doc.data() } as ApprovedBusiness);
          newLastDoc = doc;
        });

        const paginatedResult = {
          items: businesses,
          lastDoc: newLastDoc,
          hasMore: businesses.length === pageLimit
        };
        
        // Cache only first page results
        if (!lastDoc) {
          businessCache.set(cacheKey, paginatedResult);
        }
        
        return paginatedResult;
      });
      
      return result;
    } catch (error) {
      return databaseResilience.handleError(error);
    }
  }
  
  /**
   * Clear category cache when data changes
   */
  private clearCategoryCache(category: BusinessCategory): void {
    const cacheKeys = businessCache.keys()
      .filter(key => key.startsWith(`category_${category}`));
      
    cacheKeys.forEach(key => businessCache.delete(key));
  }
  
  /**
   * Update optimized collections in a transaction
   */
  private async updateOptimizedCollections(businessId: string, business: BusinessListing): Promise<void> {
    try {
      // Find the IDs in optimized collections
      const [approvedId, locationId, featuredId] = await Promise.all([
        this.findOptimizedDocId(this.approvedBusinessesCollection, businessId),
        this.findOptimizedDocId(this.businessesByLocationCollection, businessId),
        this.findOptimizedDocId(this.featuredBusinessesCollection, businessId)
      ]);
      
      const batch = writeBatch(db);
      
      // Update approved_businesses collection
      if (approvedId) {
        const approvedBusiness: Partial<ApprovedBusiness> = {
          name: business.name,
          description: business.description,
          category: business.category,
          location: {
            city: business.location.city,
            state: business.location.state
          },
          tags: business.tags,
          searchTerms: dataValidation.generateSearchTerms(business),
          lastActive: serverTimestamp()
        };
        
        const approvedRef = doc(db, this.approvedBusinessesCollection, approvedId);
        batch.update(approvedRef, approvedBusiness);
      }
      
      // Update businesses_by_location collection
      if (locationId) {
        const locationBusiness: Partial<BusinessByLocation> = {
          name: business.name,
          city: business.location.city,
          state: business.location.state,
          coordinates: business.location.coordinates,
          category: business.category
        };
        
        const locationRef = doc(db, this.businessesByLocationCollection, locationId);
        batch.update(locationRef, locationBusiness);
      }
      
      // Update or remove from featured collection based on featured status
      if (business.featured && !featuredId) {
        // Add to featured collection if not there
        const featuredBusiness = {
          businessId: businessId,
          name: business.name,
          description: business.description.substring(0, 100) + (business.description.length > 100 ? '...' : ''),
          category: business.category,
          city: business.location.city,
          state: business.location.state,
          averageRating: business.averageRating,
          createdAt: business.createdAt,
          lastUpdated: serverTimestamp()
        };
        
        const featuredRef = doc(collection(db, this.featuredBusinessesCollection));
        batch.set(featuredRef, featuredBusiness);
      } else if (business.featured && featuredId) {
        // Update existing featured document
        const featuredRef = doc(db, this.featuredBusinessesCollection, featuredId);
        batch.update(featuredRef, {
          name: business.name,
          description: business.description.substring(0, 100) + (business.description.length > 100 ? '...' : ''),
          category: business.category,
          city: business.location.city,
          state: business.location.state,
          averageRating: business.averageRating,
          lastUpdated: serverTimestamp()
        });
      } else if (!business.featured && featuredId) {
        // Remove from featured collection
        const featuredRef = doc(db, this.featuredBusinessesCollection, featuredId);
        batch.delete(featuredRef);
      }
      
      // Commit all changes
      await batch.commit();
      
      // Clear relevant caches
      businessCache.delete(`business_${businessId}`);
      this.clearCategoryCache(business.category);
      locationCache.delete(`location_${business.location.city}_${business.location.state}`);
    } catch (error) {
      console.error('Error updating optimized collections:', error);
      throw error;
    }
  }
  
  /**
   * Find document ID in optimized collection by businessId
   */
  private async findOptimizedDocId(collectionName: string, businessId: string): Promise<string | null> {
    const q = query(
      collection(db, collectionName),
      where('businessId', '==', businessId),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    
    return snapshot.docs[0].id;
  }
  
  /**
   * Helper to add business to optimized collections
   */
  private async addToOptimizedCollections(businessId: string, business: BusinessListing): Promise<void> {
    const batch = writeBatch(db);

    // Add to approved_businesses collection
    const approvedBusiness: Omit<ApprovedBusiness, 'id'> = {
      businessId: businessId,
      name: business.name,
      description: business.description,
      category: business.category,
      location: {
        city: business.location.city,
        state: business.location.state
      },
      featured: business.featured,
      averageRating: business.averageRating,
      totalReviews: business.totalReviews,
      tags: business.tags,
      searchTerms: dataValidation.generateSearchTerms(business),
      lastActive: serverTimestamp(),
      createdAt: business.createdAt
    };

    const approvedRef = doc(collection(db, this.approvedBusinessesCollection));
    batch.set(approvedRef, approvedBusiness);

    // Add to businesses_by_location collection
    const locationBusiness: Omit<BusinessByLocation, 'id'> = {
      businessId: businessId,
      name: business.name,
      city: business.location.city,
      state: business.location.state,
      coordinates: business.location.coordinates,
      category: business.category,
      featured: business.featured,
      averageRating: business.averageRating
    };

    const locationRef = doc(collection(db, this.businessesByLocationCollection));
    batch.set(locationRef, locationBusiness);

    // If featured, add to featured collection
    if (business.featured) {
      const featuredBusiness = {
        businessId: businessId,
        name: business.name,
        description: business.description.substring(0, 100) + (business.description.length > 100 ? '...' : ''),
        category: business.category,
        city: business.location.city,
        state: business.location.state,
        averageRating: business.averageRating,
        createdAt: business.createdAt,
        lastUpdated: serverTimestamp()
      };
      
      const featuredRef = doc(collection(db, this.featuredBusinessesCollection));
      batch.set(featuredRef, featuredBusiness);
    }

    // Commit all changes
    await batch.commit();
  }
}

// Export singleton instance
export const enhancedBusinessService = new EnhancedBusinessService();
export default enhancedBusinessService;
