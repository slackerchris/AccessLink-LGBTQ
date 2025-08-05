/**
 * Proper Business Hook
 * Uses optimized collections for fast performance
 */

import { useState, useEffect, useCallback } from 'react';
import { DocumentSnapshot } from 'firebase/firestore';
import { 
  properBusinessService, 
  ApprovedBusiness, 
  BusinessByLocation, 
  FeaturedBusiness, 
  BusinessListing,
  BusinessCategory,
  PaginatedResult 
} from '../services/properBusinessService';

export interface UseBusinessDirectoryResult {
  businesses: ApprovedBusiness[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface UseBusinessSearchResult {
  searchResults: ApprovedBusiness[];
  searching: boolean;
  searchError: string | null;
  search: (term: string) => Promise<void>;
  clearSearch: () => void;
}

/**
 * Hook for fast business directory listing
 */
export function useBusinessDirectory(pageSize: number = 20): UseBusinessDirectoryResult {
  const [businesses, setBusinesses] = useState<ApprovedBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);

  const loadBusinesses = useCallback(async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const result: PaginatedResult<ApprovedBusiness> = await properBusinessService.getApprovedBusinesses(
        pageSize,
        reset ? undefined : lastDoc
      );

      if (reset) {
        setBusinesses(result.items);
      } else {
        setBusinesses(prev => [...prev, ...result.items]);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err: any) {
      setError(err.message || 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  }, [pageSize, lastDoc]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadBusinesses(false);
  }, [hasMore, loading, loadBusinesses]);

  const refresh = useCallback(async () => {
    setLastDoc(null);
    await loadBusinesses(true);
  }, [loadBusinesses]);

  useEffect(() => {
    loadBusinesses(true);
  }, []);

  return {
    businesses,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
}

/**
 * Hook for category-filtered businesses
 */
export function useBusinessesByCategory(category: BusinessCategory, pageSize: number = 20) {
  const [businesses, setBusinesses] = useState<ApprovedBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);

  const loadBusinesses = useCallback(async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const result = await properBusinessService.getBusinessesByCategory(
        category,
        pageSize,
        reset ? undefined : lastDoc
      );

      if (reset) {
        setBusinesses(result.items);
      } else {
        setBusinesses(prev => [...prev, ...result.items]);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err: any) {
      setError(err.message || 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  }, [category, pageSize, lastDoc]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadBusinesses(false);
  }, [hasMore, loading, loadBusinesses]);

  const refresh = useCallback(async () => {
    setLastDoc(null);
    await loadBusinesses(true);
  }, [loadBusinesses]);

  useEffect(() => {
    setLastDoc(null);
    loadBusinesses(true);
  }, [category]);

  return {
    businesses,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
}

/**
 * Hook for location-based business search
 */
export function useBusinessesByLocation(city: string, state?: string) {
  const [businesses, setBusinesses] = useState<BusinessByLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBusinesses = useCallback(async () => {
    if (!city) return;

    try {
      setLoading(true);
      setError(null);

      const result = await properBusinessService.getBusinessesByLocation(city, state);
      setBusinesses(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  }, [city, state]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  return {
    businesses,
    loading,
    error,
    refresh: loadBusinesses
  };
}

/**
 * Hook for featured businesses (homepage)
 */
export function useFeaturedBusinesses(maxResults: number = 10) {
  const [businesses, setBusinesses] = useState<FeaturedBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeatured = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await properBusinessService.getFeaturedBusinesses(maxResults);
      setBusinesses(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load featured businesses');
    } finally {
      setLoading(false);
    }
  }, [maxResults]);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  return {
    businesses,
    loading,
    error,
    refresh: loadFeatured
  };
}

/**
 * Hook for business search
 */
export function useBusinessSearch(): UseBusinessSearchResult {
  const [searchResults, setSearchResults] = useState<ApprovedBusiness[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const search = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      setSearchError(null);

      const results = await properBusinessService.searchBusinesses(term);
      setSearchResults(results);
    } catch (err: any) {
      setSearchError(err.message || 'Search failed');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
  }, []);

  return {
    searchResults,
    searching,
    searchError,
    search,
    clearSearch
  };
}

/**
 * Hook for business details
 */
export function useBusinessDetails(businessId: string | null) {
  const [business, setBusiness] = useState<BusinessListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBusiness = useCallback(async () => {
    if (!businessId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await properBusinessService.getBusinessDetails(businessId);
      setBusiness(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load business details');
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
}
