/**
 * React Hooks for Business Management (Mock Version)
 * Custom hooks for managing business listings and reviews with mock data
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  businessService, 
  BusinessListing, 
  BusinessFilters,
  BusinessCategory 
} from '../services/mockBusinessService';
import { useAuth } from './useAuth';

// Hook for business listings with pagination and filtering
export const useBusinesses = (filters: BusinessFilters = {}, pageLimit: number = 20) => {
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadBusinesses = useCallback(async (reset: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await businessService.getBusinesses(filters, pageLimit);
      
      if (reset) {
        setBusinesses(result.businesses);
      } else {
        setBusinesses(prev => [...prev, ...result.businesses]);
      }
      
      setHasMore(result.businesses.length === pageLimit);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading businesses:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters), pageLimit]); // Use JSON.stringify to avoid infinite rerenders

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadBusinesses(false);
    }
  }, [loading, hasMore, loadBusinesses]);

  const refresh = useCallback(() => {
    setHasMore(true);
    loadBusinesses(true);
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
    search: async (query: string) => {
      try {
        const result = await businessService.searchBusinesses(query, filters, pageLimit);
        setBusinesses(result.businesses);
        setHasMore(result.businesses.length === pageLimit);
      } catch (err: any) {
        setError(err.message);
      }
    },
    filterByCategory: async (category: BusinessCategory) => {
      try {
        const result = await businessService.getBusinessesByCategory(category, pageLimit);
        setBusinesses(result.businesses);
        setHasMore(result.businesses.length === pageLimit);
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

  const loadPendingBusinesses = useCallback(async () => {
    if (!userProfile || userProfile.role !== 'admin') return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await businessService.getPendingBusinesses();
      setBusinesses(result);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading pending businesses:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

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

  const approveBusiness = useCallback(async (businessId: string) => {
    if (!userProfile || userProfile.role !== 'admin') {
      throw new Error('Admin privileges required');
    }
    
    setLoading(true);
    try {
      await businessService.approveBusiness(businessId);
    } catch (error: any) {
      console.error('Error approving business:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  const rejectBusiness = useCallback(async (businessId: string) => {
    if (!userProfile || userProfile.role !== 'admin') {
      throw new Error('Admin privileges required');
    }
    
    setLoading(true);
    try {
      await businessService.rejectBusiness(businessId);
    } catch (error: any) {
      console.error('Error rejecting business:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  return {
    approveBusiness,
    rejectBusiness,
    loading
  };
};
