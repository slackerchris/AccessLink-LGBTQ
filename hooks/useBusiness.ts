
/**
 * React Hooks for Business Management (Firebase Version)
 * Custom hooks for managing business listings and reviews with real Firebase data
 */


import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useFirebaseAuth';
import { getFirestore, collection, query, where, limit, getDocs, DocumentData, updateDoc, doc } from 'firebase/firestore';
import firebaseApp from '../services/firebase';

export interface BusinessListing {
  id: string;
  name: string;
  description: string;
  category: string;
  location: {
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact?: {
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
  hours?: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  lgbtqFriendly?: {
    verified: boolean;
    certifications: string[];
    inclusivityFeatures: string[];
  };
  accessibility?: {
    wheelchairAccessible: boolean;
    brailleMenus: boolean;
    signLanguageSupport: boolean;
    quietSpaces: boolean;
    accessibilityNotes: string;
  };
  ownerId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  featured?: boolean;
  images?: string[];
  tags?: string[];
  averageRating: number;
  totalReviews?: number;
  createdAt?: any;
  updatedAt?: any;
}

export type BusinessFilters = {
  category?: string;
  // Add other filters as needed
};

export type BusinessCategory = string;

// Hook for business listings with pagination and filtering

export const useBusinesses = (filters: BusinessFilters = {}, pageLimit: number = 20) => {
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const db = getFirestore(firebaseApp);

  const loadBusinesses = useCallback(async (reset: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      let q = query(collection(db, 'businesses'), limit(pageLimit));
      if (filters.category) {
        q = query(collection(db, 'businesses'), where('category', '==', filters.category), limit(pageLimit));
      }
      const snapshot = await getDocs(q);
      const result: BusinessListing[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...(typeof data === 'object' && data !== null ? data : {})
        } as BusinessListing;
      });
      setBusinesses(result);
      setHasMore(result.length === pageLimit);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading businesses:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pageLimit, db]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadBusinesses(false);
    }
  }, [loading, hasMore, loadBusinesses]);

  const refresh = useCallback(async () => {
    setHasMore(true);
    await loadBusinesses(true);
  }, [loadBusinesses]);

  useEffect(() => {
    refresh();
  }, [filters, pageLimit]);

  return {
    businesses,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    search: async (searchTerm: string) => {
      try {
        const q = query(
          collection(db, 'businesses'),
          where('name', '>=', searchTerm),
          where('name', '<=', searchTerm + '\uf8ff'),
          limit(pageLimit)
        );
        const snapshot = await getDocs(q);
        const result: BusinessListing[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data(); 
          return { 
            id: docSnap.id, 
            ...(typeof data === 'object' && data !== null ? data : {}) 
          } as BusinessListing; 
        });
        setBusinesses(result);
        setHasMore(result.length === pageLimit);
      } catch (err: any) {
        setError(err.message);
      }
    },
    filterByCategory: async (categoryValue: BusinessCategory) => {
      try {
        const q = query(
          collection(db, 'businesses'),
          where('category', '==', categoryValue),
          limit(pageLimit)
        );
        const snapshot = await getDocs(q);
        const result: BusinessListing[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...(typeof data === 'object' && data !== null ? data : {})
          } as BusinessListing;
        });
        setBusinesses(result);
        setHasMore(result.length === pageLimit);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };
};

// Hook for pending businesses (admin only)
export const usePendingBusinesses = () => {
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();
  const db = getFirestore(firebaseApp);

  const loadPendingBusinesses = useCallback(async () => {
    if (!userProfile || userProfile.role !== 'admin') return;
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'businesses'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      const result: BusinessListing[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...(typeof data === 'object' && data !== null ? data : {})
        } as BusinessListing;
      });
      setBusinesses(result);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading pending businesses:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile, db]);

  useEffect(() => {
    loadPendingBusinesses();
  }, [loadPendingBusinesses]);

  return {
    businesses,
    loading,
    error,
    refresh: loadPendingBusinesses
  };
};

// Hook for business actions (admin only)
export const useBusinessActions = () => {
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();
  const db = getFirestore(firebaseApp);

  const approveBusiness = useCallback(async (businessId: string) => {
    if (!userProfile || userProfile.role !== 'admin') {
      throw new Error('Admin privileges required');
    }
    setLoading(true);
    try {
      const businessRef = doc(db, 'businesses', businessId);
      await updateDoc(businessRef, { status: 'approved' });
    } catch (error: any) {
      console.error('Error approving business:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [userProfile, db]);

  const rejectBusiness = useCallback(async (businessId: string) => {
    if (!userProfile || userProfile.role !== 'admin') {
      throw new Error('Admin privileges required');
    }
    setLoading(true);
    try {
      const businessRef = doc(db, 'businesses', businessId);
      await updateDoc(businessRef, { status: 'rejected' });
    } catch (error: any) {
      console.error('Error rejecting business:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [userProfile, db]);

  return {
    approveBusiness,
    rejectBusiness,
    loading
  };
};
