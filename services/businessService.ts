/**
 * Business Service for AccessLink LGBTQ+
 * Handles business listings, reviews, and admin functions
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
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from './authService';

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
      linkedin?: string;
    };
  };
  hours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
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

export interface BusinessReview {
  id?: string;
  businessId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5 stars
  title: string;
  content: string;
  lgbtqFriendliness: number; // 1-5 rating
  accessibility: number; // 1-5 rating
  anonymous: boolean;
  helpful: number; // count of helpful votes
  reported: boolean;
  status: 'active' | 'hidden' | 'removed';
  createdAt: any;
  updatedAt: any;
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

class BusinessService {
  private businessCollection = 'businesses';
  private reviewsCollection = 'reviews';

  // Create Business Listing
  public async createBusiness(
    businessData: Omit<BusinessListing, 'id' | 'createdAt' | 'updatedAt' | 'averageRating' | 'totalReviews'>,
    userProfile: UserProfile
  ): Promise<string> {
    try {
      // Check if user is business owner or admin
      if (userProfile.role !== 'business_owner' && userProfile.role !== 'admin') {
        throw new Error('Only business owners and admins can create listings');
      }

      const newBusiness: Omit<BusinessListing, 'id'> = {
        ...businessData,
        ownerId: userProfile.uid,
        status: userProfile.role === 'admin' ? 'approved' : 'pending',
        featured: false,
        averageRating: 0,
        totalReviews: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.businessCollection), newBusiness);
      return docRef.id;
    } catch (error) {
      console.error('Error creating business:', error);
      throw error;
    }
  }

  // Get Business by ID
  public async getBusiness(businessId: string): Promise<BusinessListing | null> {
    try {
      const docRef = doc(db, this.businessCollection, businessId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as BusinessListing;
      }
      return null;
    } catch (error) {
      console.error('Error getting business:', error);
      throw error;
    }
  }

  // Get Businesses with Filters and Pagination  
  public async getBusinesses(
    filters: BusinessFilters = {},
    pageLimit: number = 20,
    lastDoc?: DocumentSnapshot
  ): Promise<{ businesses: BusinessListing[]; lastDoc: DocumentSnapshot | null }> {
    try {
      const constraints: QueryConstraint[] = [];

      // Check if any filters are actually being used
      const hasFilters = Object.keys(filters).length > 0 && Object.values(filters).some(v => v !== undefined && v !== '');
      
      if (hasFilters) {
        // Only use complex queries when user applies filters
        // You'll need to create indexes for these combinations
        constraints.push(where('status', '==', 'approved'));
        
        if (filters.category) {
          constraints.push(where('category', '==', filters.category));
        }
        if (filters.city) {
          constraints.push(where('location.city', '==', filters.city));
        }
        if (filters.state) {
          constraints.push(where('location.state', '==', filters.state));
        }
        if (filters.lgbtqVerified) {
          constraints.push(where('lgbtqFriendly.verified', '==', true));
        }
        if (filters.wheelchairAccessible) {
          constraints.push(where('accessibility.wheelchairAccessible', '==', true));
        }
        if (filters.minRating) {
          constraints.push(where('averageRating', '>=', filters.minRating));
        }
        if (filters.featured) {
          constraints.push(where('featured', '==', true));
        }

        // Complex ordering only when filters are applied
        constraints.push(orderBy('featured', 'desc'));
        constraints.push(orderBy('averageRating', 'desc'));
        constraints.push(orderBy('createdAt', 'desc'));
      } else {
        // ULTRA SIMPLE - no where clauses, no ordering, just get documents
        // This should work without any custom indexes
      }

      // Add pagination
      constraints.push(limit(pageLimit));
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(collection(db, this.businessCollection), ...constraints);
      const querySnapshot = await getDocs(q);

      const businesses: BusinessListing[] = [];
      let newLastDoc: DocumentSnapshot | null = null;

      querySnapshot.forEach((doc) => {
        const businessData = { id: doc.id, ...doc.data() } as BusinessListing;
        // Always filter to approved businesses client-side
        if (businessData.status === 'approved') {
          businesses.push(businessData);
        }
        newLastDoc = doc;
      });

      // Sort client-side if no filters (since we can't do it in the query)
      if (!hasFilters) {
        businesses.sort((a, b) => {
          // Sort by createdAt descending (newest first)
          const aTime = a.createdAt?.toDate?.() || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });
      }

      // Apply text search filter
      let filteredBusinesses = businesses;
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        filteredBusinesses = businesses.filter(business =>
          business.name.toLowerCase().includes(searchTerm) ||
          business.description.toLowerCase().includes(searchTerm) ||
          business.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      return {
        businesses: filteredBusinesses,
        lastDoc: filteredBusinesses.length > 0 ? newLastDoc : null
      };
    } catch (error) {
      console.error('Error getting businesses:', error);
      throw error;
    }
  }

  // Update Business
  public async updateBusiness(
    businessId: string,
    updates: Partial<BusinessListing>,
    userProfile: UserProfile
  ): Promise<void> {
    try {
      const business = await this.getBusiness(businessId);
      if (!business) {
        throw new Error('Business not found');
      }

      // Check permissions
      if (userProfile.role !== 'admin' && business.ownerId !== userProfile.uid) {
        throw new Error('You can only update your own business listings');
      }

      const docRef = doc(db, this.businessCollection, businessId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating business:', error);
      throw error;
    }
  }

  // Delete Business (Admin only)
  public async deleteBusiness(businessId: string, userProfile: UserProfile): Promise<void> {
    try {
      if (userProfile.role !== 'admin') {
        throw new Error('Only admins can delete business listings');
      }

      const docRef = doc(db, this.businessCollection, businessId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting business:', error);
      throw error;
    }
  }

  // Approve Business (Admin only)
  public async approveBusiness(businessId: string, userProfile: UserProfile): Promise<void> {
    try {
      if (userProfile.role !== 'admin') {
        throw new Error('Only admins can approve business listings');
      }

      await this.updateBusiness(businessId, { status: 'approved' }, userProfile);
    } catch (error) {
      console.error('Error approving business:', error);
      throw error;
    }
  }

  // Reject Business (Admin only)
  public async rejectBusiness(businessId: string, userProfile: UserProfile): Promise<void> {
    try {
      if (userProfile.role !== 'admin') {
        throw new Error('Only admins can reject business listings');
      }

      await this.updateBusiness(businessId, { status: 'rejected' }, userProfile);
    } catch (error) {
      console.error('Error rejecting business:', error);
      throw error;
    }
  }

  // Feature Business (Admin only)
  public async featureBusiness(businessId: string, featured: boolean, userProfile: UserProfile): Promise<void> {
    try {
      if (userProfile.role !== 'admin') {
        throw new Error('Only admins can feature business listings');
      }

      await this.updateBusiness(businessId, { featured }, userProfile);
    } catch (error) {
      console.error('Error featuring business:', error);
      throw error;
    }
  }

  // Add Review
  public async addReview(
    reviewData: Omit<BusinessReview, 'id' | 'createdAt' | 'updatedAt' | 'helpful' | 'reported' | 'status'>,
    userProfile: UserProfile
  ): Promise<string> {
    try {
      const newReview: Omit<BusinessReview, 'id'> = {
        ...reviewData,
        userId: userProfile.uid,
        userName: reviewData.anonymous ? 'Anonymous' : userProfile.displayName,
        helpful: 0,
        reported: false,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.reviewsCollection), newReview);

      // Update business rating
      await this.updateBusinessRating(reviewData.businessId);

      return docRef.id;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  // Get Reviews for Business
  public async getBusinessReviews(businessId: string, pageLimit: number = 10): Promise<BusinessReview[]> {
    try {
      const q = query(
        collection(db, this.reviewsCollection),
        where('businessId', '==', businessId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(pageLimit)
      );

      const querySnapshot = await getDocs(q);
      const reviews: BusinessReview[] = [];

      querySnapshot.forEach((doc) => {
        reviews.push({ id: doc.id, ...doc.data() } as BusinessReview);
      });

      return reviews;
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw error;
    }
  }

  // Update Business Rating (internal method)
  private async updateBusinessRating(businessId: string): Promise<void> {
    try {
      const reviews = await this.getBusinessReviews(businessId, 1000); // Get all reviews
      
      if (reviews.length === 0) {
        return;
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      const docRef = doc(db, this.businessCollection, businessId);
      await updateDoc(docRef, {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews: reviews.length,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating business rating:', error);
      throw error;
    }
  }

  // Get Pending Businesses (Admin only)
  public async getPendingBusinesses(userProfile: UserProfile): Promise<BusinessListing[]> {
    try {
      if (userProfile.role !== 'admin') {
        throw new Error('Only admins can view pending businesses');
      }

      const q = query(
        collection(db, this.businessCollection),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const businesses: BusinessListing[] = [];

      querySnapshot.forEach((doc) => {
        businesses.push({ id: doc.id, ...doc.data() } as BusinessListing);
      });

      return businesses;
    } catch (error) {
      console.error('Error getting pending businesses:', error);
      throw error;
    }
  }

  // Get User's Businesses
  public async getUserBusinesses(userProfile: UserProfile): Promise<BusinessListing[]> {
    try {
      const q = query(
        collection(db, this.businessCollection),
        where('ownerId', '==', userProfile.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const businesses: BusinessListing[] = [];

      querySnapshot.forEach((doc) => {
        businesses.push({ id: doc.id, ...doc.data() } as BusinessListing);
      });

      return businesses;
    } catch (error) {
      console.error('Error getting user businesses:', error);
      throw error;
    }
  }

  // Search and filter functions
  public async searchBusinesses(searchQuery: string, filters: BusinessFilters = {}, pageLimit: number = 20): Promise<{ businesses: BusinessListing[], lastDoc: DocumentSnapshot | null }> {
    try {
      const businessesRef = collection(db, 'businesses');
      let q;
      
      // Create a simple query first - this should work regardless of indexes
      q = query(
        businessesRef,
        where('status', '==', 'approved'),
        limit(pageLimit * 5) // Get more to account for filtering
      );

      const snapshot = await getDocs(q);
      let businesses: BusinessListing[] = [];
      
      snapshot.forEach((doc) => {
        // Properly cast document data to the expected type
        const data = doc.data() as Partial<Omit<BusinessListing, 'id'>>;
        const business: BusinessListing = {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          category: data.category || 'other',
          location: data.location || {
            address: '',
            city: '',
            state: '',
            zipCode: ''
          },
          contact: data.contact || {
            phone: '',
            email: ''
          },
          hours: data.hours || {},
          lgbtqFriendly: data.lgbtqFriendly || {
            verified: false,
            certifications: [],
            inclusivityFeatures: []
          },
          accessibility: data.accessibility || {
            wheelchairAccessible: false,
            brailleMenus: false,
            signLanguageSupport: false,
            quietSpaces: false,
            accessibilityNotes: ''
          },
          ownerId: data.ownerId || '',
          status: data.status || 'pending',
          featured: data.featured || false,
          images: data.images || [],
          tags: data.tags || [],
          averageRating: data.averageRating || 0,
          totalReviews: data.totalReviews || 0,
          createdAt: data.createdAt || null,
          updatedAt: data.updatedAt || null
        };
        
        // Filter by search query (case-insensitive)
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          business.name.toLowerCase().includes(searchLower) ||
          business.description.toLowerCase().includes(searchLower) ||
          business.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
          business.location.city.toLowerCase().includes(searchLower);
        
        if (matchesSearch) {
          businesses.push(business);
        }
      });

      // Sort by creation date (most recent first)
      businesses.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      // Apply additional filters
      if (filters.category) {
        businesses = businesses.filter(b => b.category === filters.category);
      }
      if (filters.city) {
        businesses = businesses.filter(b => b.location.city.toLowerCase() === filters.city.toLowerCase());
      }
      if (filters.state) {
        businesses = businesses.filter(b => b.location.state.toLowerCase() === filters.state.toLowerCase());
      }
      if (filters.lgbtqVerified) {
        businesses = businesses.filter(b => b.lgbtqFriendly.verified);
      }
      if (filters.wheelchairAccessible) {
        businesses = businesses.filter(b => b.accessibility.wheelchairAccessible);
      }
      if (filters.minRating) {
        businesses = businesses.filter(b => b.averageRating >= filters.minRating);
      }

      // Finally, apply the page limit
      businesses = businesses.slice(0, pageLimit);

      return {
        businesses,
        lastDoc: null // Can't use lastDoc with client-side filtering
      };
    } catch (error) {
      console.error('Error searching businesses:', error);
      throw error;
    }
  }

  public async getBusinessesByCategory(category: BusinessCategory, pageLimit: number = 20): Promise<{ businesses: BusinessListing[], lastDoc: DocumentSnapshot | null }> {
    try {
      const businessesRef = collection(db, 'businesses');
      
      // First try with the most efficient query
      try {
        const q = query(
          businessesRef,
          where('status', '==', 'approved'),
          where('category', '==', category),
          orderBy('createdAt', 'desc'),
          limit(pageLimit)
        );
        
        const snapshot = await getDocs(q);
        const businesses: BusinessListing[] = [];
        
        snapshot.forEach((doc) => {
          businesses.push({ id: doc.id, ...doc.data() } as BusinessListing);
        });
        
        return {
          businesses,
          lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
        };
      } catch (indexError) {
        console.warn('Index error, falling back to client-side filtering:', indexError);
        
        // Fallback to a simpler query without complex indexes
        // This gets all businesses and filters them client-side
        const simpleQuery = query(
          businessesRef,
          where('status', '==', 'approved'),
          limit(100) // Get more documents since we'll filter client-side
        );
        
        const snapshot = await getDocs(simpleQuery);
        let businesses: BusinessListing[] = [];
        
        snapshot.forEach((doc) => {
          const business = { id: doc.id, ...doc.data() } as BusinessListing;
          if (business.category === category) {
            businesses.push(business);
          }
        });
        
        // Sort by createdAt desc (client-side)
        businesses = businesses.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        
        // Apply limit after sorting
        businesses = businesses.slice(0, pageLimit);
        
        return {
          businesses,
          lastDoc: null // Can't use lastDoc with client-side filtering
        };
      }
    } catch (error) {
      console.error('Error getting businesses by category:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const businessService = new BusinessService();
export default businessService;
