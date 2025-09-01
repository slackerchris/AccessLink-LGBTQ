/**
 * React Hooks for Business Management (Firebase Version)
 * Custom hooks for managing business listings and reviews with real Firebase data
 */


import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useFirebaseAuth';
import { getFirestore, collection, query, where, limit, getDocs, DocumentData, updateDoc, doc, FieldValue } from 'firebase/firestore';
import firebaseApp from '../services/firebase';
import { BusinessCategory as ServiceBusinessCategory } from '../services/businessService';
import { BusinessListing } from '../types/business';

export type TimestampField = Date | FieldValue;

export type BusinessFilters = {
  category?: string;
  // Add other filters as needed
};

export type BusinessCategory = ServiceBusinessCategory;

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error loading businesses:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.category, pageLimit, db]);

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
  }, [filters.category, pageLimit]);

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
    } catch (error) {
      console.error('Error approving business:', error);
      if (error instanceof Error) throw error;
      throw new Error('An unknown error occurred while approving the business');
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
    } catch (error) {
      console.error('Error rejecting business:', error);
      if (error instanceof Error) throw error;
      throw new Error('An unknown error occurred while rejecting the business');
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
