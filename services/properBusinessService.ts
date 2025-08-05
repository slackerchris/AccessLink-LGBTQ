/**
 * Proper Business Service Architecture
 * Implements denormalized collections for optimal performance
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

// Core business data (master record)
export interface BusinessListing {
  id?: string;
  name: string;
  description: string;
  category: BusinessCategory;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
  lgbtqFriendly: {
    verified: boolean;
    certifications: string[];
    inclusivityFeatures: string[];
  };
  accessibility: {
    wheelchairAccessible: boolean;
    brailleMenus: boolean;
    signLanguageSupport: boolean;
    quietSpaces: boolean;
    accessibilityNotes: string;
  };
  ownerId: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  featured: boolean;
  images: string[];
  tags: string[];
  averageRating: number;
  totalReviews: number;
  createdAt: any;
  updatedAt: any;
}

// Optimized for fast directory reads
export interface ApprovedBusiness {
  id: string;
  businessId: string; // Reference to main business record
  name: string;
  description: string;
  category: BusinessCategory;
  location: {
    city: string;
    state: string;
  };
  featured: boolean;
  averageRating: number;
  totalReviews: number;
  tags: string[];
  searchTerms: string[]; // Pre-computed for search
  lastActive: any;
  createdAt: any;
}

// Optimized for location-based queries
export interface BusinessByLocation {
  id?: string;
  businessId: string;
  name: string;
  city: string;
  state: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  category: BusinessCategory;
  featured: boolean;
  averageRating: number;
}

// Featured businesses for homepage
export interface FeaturedBusiness {
  id?: string;
  businessId: string;
  name: string;
  description: string;
  category: BusinessCategory;
  location: {
    city: string;
    state: string;
  };
  averageRating: number;
  featuredUntil: any;
  priority: number;
}

export type BusinessCategory = 
  | 'restaurant'
  | 'healthcare'
  | 'beauty'
  | 'fitness'
  | 'retail'
  | 'professional_services'
  | 'entertainment'
  | 'education'
  | 'nonprofit'
  | 'other';

export interface BusinessFilters {
  category?: BusinessCategory;
  city?: string;
  state?: string;
  lgbtqVerified?: boolean;
  wheelchairAccessible?: boolean;
  minRating?: number;
  featured?: boolean;
  searchTerm?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

class ProperBusinessService {
  // Collection names
  private businessCollection = 'businesses';
  private approvedBusinessesCollection = 'approved_businesses';
  private businessesByLocationCollection = 'businesses_by_location';
  private featuredBusinessesCollection = 'featured_businesses';

  /**
   * Fast directory listing - optimized for initial load
   */
  public async getApprovedBusinesses(
    pageLimit: number = 20,
    lastDoc?: DocumentSnapshot
  ): Promise<PaginatedResult<ApprovedBusiness>> {
    try {
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

      return {
        items: businesses,
        lastDoc: newLastDoc,
        hasMore: businesses.length === pageLimit
      };
    } catch (error) {
      console.error('Error getting approved businesses:', error);
      throw error;
    }
  }

  /**
   * Category-filtered businesses
   */
  public async getBusinessesByCategory(
    category: BusinessCategory,
    pageLimit: number = 20,
    lastDoc?: DocumentSnapshot
  ): Promise<PaginatedResult<ApprovedBusiness>> {
    try {
      // Use a simpler query that doesn't require composite indexes
      // and handle sorting in memory instead
      const simpleConstraints: QueryConstraint[] = [
        where('category', '==', category),
        limit(100) // Get more items to sort client-side
      ];

      if (lastDoc) {
        simpleConstraints.push(startAfter(lastDoc));
      }

      const q = query(collection(db, this.approvedBusinessesCollection), ...simpleConstraints);
      const querySnapshot = await getDocs(q);

      let businesses: ApprovedBusiness[] = [];
      let newLastDoc: DocumentSnapshot | null = null;

      querySnapshot.forEach((doc) => {
        businesses.push({ id: doc.id, ...doc.data() } as ApprovedBusiness);
      });

      // Sort in memory (featured first, then by rating)
      businesses = businesses
        .sort((a, b) => {
          // First by featured (true comes before false)
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          
          // Then by rating (higher first)
          return b.averageRating - a.averageRating;
        })
        .slice(0, pageLimit); // Limit to requested page size
      
      // Set the last document for pagination if we have results
      if (businesses.length > 0) {
        const lastBusinessId = businesses[businesses.length - 1].id;
        for (const doc of querySnapshot.docs) {
          if (doc.id === lastBusinessId) {
            newLastDoc = doc;
            break;
          }
        }
      }

      return {
        items: businesses,
        lastDoc: newLastDoc,
        hasMore: querySnapshot.size > pageLimit // If we got more than we're returning, there are more
      };
    } catch (error) {
      console.error('Error getting businesses by category:', error);
      throw error;
    }
  }

  /**
   * Location-filtered businesses
   */
  public async getBusinessesByLocation(
    city: string,
    state?: string,
    pageLimit: number = 20
  ): Promise<BusinessByLocation[]> {
    try {
      const constraints: QueryConstraint[] = [
        where('city', '==', city),
        orderBy('averageRating', 'desc'),
        limit(pageLimit)
      ];

      if (state) {
        constraints.unshift(where('state', '==', state));
      }

      const q = query(collection(db, this.businessesByLocationCollection), ...constraints);
      const querySnapshot = await getDocs(q);

      const businesses: BusinessByLocation[] = [];
      querySnapshot.forEach((doc) => {
        businesses.push({ id: doc.id, ...doc.data() } as BusinessByLocation);
      });

      return businesses;
    } catch (error) {
      console.error('Error getting businesses by location:', error);
      throw error;
    }
  }

  /**
   * Featured businesses for homepage
   */
  public async getFeaturedBusinesses(maxResults: number = 10): Promise<FeaturedBusiness[]> {
    try {
      // Simplify query to avoid needing a composite index
      const currentDate = new Date();
      
      // Just filter by featuredUntil without complex ordering
      const q = query(
        collection(db, this.featuredBusinessesCollection),
        where('featuredUntil', '>', currentDate),
        limit(50) // Get more items to sort client-side
      );

      const querySnapshot = await getDocs(q);
      const businesses: FeaturedBusiness[] = [];

      querySnapshot.forEach((doc) => {
        businesses.push({ id: doc.id, ...doc.data() } as FeaturedBusiness);
      });
      
      // Sort in memory instead of using orderBy in the query
      const sortedBusinesses = businesses
        .sort((a, b) => {
          // First by featuredUntil (asc)
          const dateA = a.featuredUntil instanceof Timestamp 
            ? a.featuredUntil.toDate()
            : new Date(a.featuredUntil);
          const dateB = b.featuredUntil instanceof Timestamp 
            ? b.featuredUntil.toDate()
            : new Date(b.featuredUntil);
          
          if (dateA < dateB) return -1;
          if (dateA > dateB) return 1;
          
          // Then by priority (desc)
          return (b.priority || 0) - (a.priority || 0);
        })
        .slice(0, maxResults);

      return sortedBusinesses;
    } catch (error) {
      console.error('Error getting featured businesses:', error);
      throw error;
    }
  }

  /**
   * Search businesses by search terms
   */
  public async searchBusinesses(
    searchTerm: string,
    pageLimit: number = 20
  ): Promise<ApprovedBusiness[]> {
    try {
      // Convert search term to lowercase keywords
      const keywords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 2);
      
      if (keywords.length === 0) {
        return [];
      }

      const q = query(
        collection(db, this.approvedBusinessesCollection),
        where('searchTerms', 'array-contains-any', keywords),
        orderBy('averageRating', 'desc'),
        limit(pageLimit)
      );

      const querySnapshot = await getDocs(q);
      const businesses: ApprovedBusiness[] = [];

      querySnapshot.forEach((doc) => {
        businesses.push({ id: doc.id, ...doc.data() } as ApprovedBusiness);
      });

      return businesses;
    } catch (error) {
      console.error('Error searching businesses:', error);
      throw error;
    }
  }

  /**
   * Get full business details
   */
  public async getBusinessDetails(businessId: string): Promise<BusinessListing | null> {
    try {
      const docRef = doc(db, this.businessCollection, businessId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as BusinessListing;
      }
      return null;
    } catch (error) {
      console.error('Error getting business details:', error);
      throw error;
    }
  }

  /**
   * Create new business (admin/owner only)
   */
  public async createBusiness(
    businessData: Omit<BusinessListing, 'id' | 'createdAt' | 'updatedAt' | 'averageRating' | 'totalReviews'>,
    userProfile: UserProfile
  ): Promise<string> {
    try {
      if (userProfile.role !== 'business_owner' && userProfile.role !== 'admin') {
        throw new Error('Only business owners and admins can create listings');
      }

      const newBusiness: Omit<BusinessListing, 'id'> = {
        ...businessData,
        ownerId: userProfile.uid,
        status: userProfile.role === 'admin' ? 'approved' : 'pending',
        averageRating: 0,
        totalReviews: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.businessCollection), newBusiness);

      // If approved, also add to optimized collections
      if (newBusiness.status === 'approved') {
        await this.addToOptimizedCollections(docRef.id, newBusiness as BusinessListing);
      }

      return docRef.id;
    } catch (error) {
      console.error('Error creating business:', error);
      throw error;
    }
  }

  /**
   * Approve business (admin only) - adds to optimized collections
   */
  public async approveBusiness(businessId: string, userProfile: UserProfile): Promise<void> {
    try {
      if (userProfile.role !== 'admin') {
        throw new Error('Only admins can approve business listings');
      }

      // Update main business record
      const businessRef = doc(db, this.businessCollection, businessId);
      await updateDoc(businessRef, {
        status: 'approved',
        updatedAt: serverTimestamp()
      });

      // Get updated business data
      const businessDoc = await getDoc(businessRef);
      if (businessDoc.exists()) {
        const businessData = { id: businessDoc.id, ...businessDoc.data() } as BusinessListing;
        await this.addToOptimizedCollections(businessId, businessData);
      }
    } catch (error) {
      console.error('Error approving business:', error);
      throw error;
    }
  }

  /**
   * Add business to optimized collections
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
      searchTerms: this.generateSearchTerms(business),
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
      const featuredBusiness: Omit<FeaturedBusiness, 'id'> = {
        businessId: businessId,
        name: business.name,
        description: business.description,
        category: business.category,
        location: {
          city: business.location.city,
          state: business.location.state
        },
        averageRating: business.averageRating,
        featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        priority: 1
      };

      const featuredRef = doc(collection(db, this.featuredBusinessesCollection));
      batch.set(featuredRef, featuredBusiness);
    }

    await batch.commit();
  }

  /**
   * Generate search terms for full-text search
   */
  private generateSearchTerms(business: BusinessListing): string[] {
    const terms = new Set<string>();
    
    // Add name words
    business.name.toLowerCase().split(/\s+/).forEach(word => terms.add(word));
    
    // Add description words (first 100 chars)
    business.description.toLowerCase().substring(0, 100).split(/\s+/).forEach(word => terms.add(word));
    
    // Add location
    terms.add(business.location.city.toLowerCase());
    terms.add(business.location.state.toLowerCase());
    
    // Add category
    terms.add(business.category);
    
    // Add tags
    business.tags.forEach(tag => terms.add(tag.toLowerCase()));
    
    // Filter out short words and return array
    return Array.from(terms).filter(term => term.length > 2);
  }
}

// Export singleton instance
export const properBusinessService = new ProperBusinessService();
export default properBusinessService;
