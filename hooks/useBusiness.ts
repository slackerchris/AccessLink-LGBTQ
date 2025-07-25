/**
 * React Hooks for Business Management
 * Custom hooks for managing business listings and reviews
 */

import { useState, useEffect, useCallback } from 'react';
import { DocumentSnapshot } from 'firebase/firestore';
import { 
  businessService, 
  BusinessListing, 
  BusinessReview, 
  BusinessFilters,
  BusinessCategory 
} from '../services/businessService';
import { useAuth } from './useAuth';

// Hook for business listings with pagination and filtering
export const useBusinesses = (filters: BusinessFilters = {}, pageLimit: number = 20) => {
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadBusinesses = useCallback(async (reset: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await businessService.getBusinesses(
        filters,
        pageLimit,
        reset ? undefined : lastDoc
      );
      
      if (reset) {
        setBusinesses(result.businesses);
      } else {
        setBusinesses(prev => [...prev, ...result.businesses]);
      }
      
      setLastDoc(result.lastDoc);
      setHasMore(result.businesses.length === pageLimit);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading businesses:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pageLimit, lastDoc]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadBusinesses(false);
    }
  }, [loading, hasMore, loadBusinesses]);

  const refresh = useCallback(() => {
    setLastDoc(null);
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
    refresh
  };
};

// Hook for a single business
export const useBusiness = (businessId: string | null) => {
  const [business, setBusiness] = useState<BusinessListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBusiness = useCallback(async () => {
    if (!businessId) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await businessService.getBusiness(businessId);
      setBusiness(result);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading business:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    loadBusiness();
  }, [loadBusiness]);

  return {
    business,
    loading,
    error,
    refresh: loadBusiness
  };
};

// Hook for business management actions
export const useBusinessActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  const createBusiness = useCallback(async (
    businessData: Omit<BusinessListing, 'id' | 'createdAt' | 'updatedAt' | 'averageRating' | 'totalReviews'>
  ) => {
    if (!userProfile) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    try {
      const businessId = await businessService.createBusiness(businessData, userProfile);
      return businessId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  const updateBusiness = useCallback(async (
    businessId: string,
    updates: Partial<BusinessListing>
  ) => {
    if (!userProfile) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    try {
      await businessService.updateBusiness(businessId, updates, userProfile);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  const deleteBusiness = useCallback(async (businessId: string) => {
    if (!userProfile) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    try {
      await businessService.deleteBusiness(businessId, userProfile);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  const approveBusiness = useCallback(async (businessId: string) => {
    if (!userProfile) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    try {
      await businessService.approveBusiness(businessId, userProfile);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  const rejectBusiness = useCallback(async (businessId: string) => {
    if (!userProfile) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    try {
      await businessService.rejectBusiness(businessId, userProfile);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  const featureBusiness = useCallback(async (businessId: string, featured: boolean) => {
    if (!userProfile) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    try {
      await businessService.featureBusiness(businessId, featured, userProfile);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createBusiness,
    updateBusiness,
    deleteBusiness,
    approveBusiness,
    rejectBusiness,
    featureBusiness,
    clearError,
    loading,
    error
  };
};

// Hook for business reviews
export const useBusinessReviews = (businessId: string | null) => {
  const [reviews, setReviews] = useState<BusinessReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    if (!businessId) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await businessService.getBusinessReviews(businessId);
      setReviews(result);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return {
    reviews,
    loading,
    error,
    refresh: loadReviews
  };
};

// Hook for review actions
export const useReviewActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  const addReview = useCallback(async (
    reviewData: Omit<BusinessReview, 'id' | 'createdAt' | 'updatedAt' | 'helpful' | 'reported' | 'status'>
  ) => {
    if (!userProfile) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    try {
      const reviewId = await businessService.addReview(reviewData, userProfile);
      return reviewId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    addReview,
    clearError,
    loading,
    error
  };
};

// Hook for user's own businesses
export const useUserBusinesses = () => {
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  const loadUserBusinesses = useCallback(async () => {
    if (!userProfile) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await businessService.getUserBusinesses(userProfile);
      setBusinesses(result);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading user businesses:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    loadUserBusinesses();
  }, [loadUserBusinesses]);

  return {
    businesses,
    loading,
    error,
    refresh: loadUserBusinesses
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
      const result = await businessService.getPendingBusinesses(userProfile);
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

// Helper hook for business categories
export const useBusinessCategories = () => {
  const categories: { value: BusinessCategory; label: string }[] = [
    { value: 'restaurant', label: 'Restaurant & Food' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'beauty', label: 'Beauty & Wellness' },
    { value: 'fitness', label: 'Fitness & Recreation' },
    { value: 'retail', label: 'Retail & Shopping' },
    { value: 'professional_services', label: 'Professional Services' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'education', label: 'Education' },
    { value: 'nonprofit', label: 'Non-profit' },
    { value: 'other', label: 'Other' }
  ];

  const getCategoryLabel = useCallback((category: BusinessCategory) => {
    const found = categories.find(cat => cat.value === category);
    return found ? found.label : category;
  }, []);

  return {
    categories,
    getCategoryLabel
  };
};
