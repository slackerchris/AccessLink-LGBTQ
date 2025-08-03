/**
 * React Hooks for Business Management with SQLite
 * Custom hooks for managing business listings and reviews with SQLite data
 */

import { useState, useEffect, useCallback } from 'react';
import { useBusinessActions } from './useAuthSQLite';

// Hook for business listings
export const useBusinesses = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getBusinesses } = useBusinessActions();

  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getBusinesses();
      setBusinesses(result);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading businesses:', err);
    } finally {
      setLoading(false);
    }
  }, [getBusinesses]);

  const refresh = useCallback(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  return {
    businesses,
    loading,
    error,
    refresh,
    clearError: () => setError(null)
  };
};

// Hook for a single business
export const useBusiness = (businessId: string) => {
  const [business, setBusiness] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getBusinesses } = useBusinessActions();

  const loadBusiness = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const businesses = await getBusinesses();
      const foundBusiness = businesses.find(b => b.id === businessId);
      setBusiness(foundBusiness || null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading business:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId, getBusinesses]);

  useEffect(() => {
    if (businessId) {
      loadBusiness();
    }
  }, [businessId, loadBusiness]);

  return {
    business,
    loading,
    error,
    refresh: loadBusiness,
    clearError: () => setError(null)
  };
};
