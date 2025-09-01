/**
 * React Hooks for Admin-Specific Functionality
 * Centralized hooks for admin dashboard, user management, and business approvals.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useFirebaseAuth';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import firebaseApp from '../services/firebase';
import { adminService, PlatformStats } from '../services/adminService';
import { BusinessListing } from '../types/business';

const db = getFirestore(firebaseApp);

/**
 * Hook to fetch platform-wide statistics for the admin dashboard.
 */
export const useAdminStats = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const platformStats = await adminService.getPlatformStats();
      setStats(platformStats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      console.error('Error loading platform stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
};

/**
 * Hook for fetching businesses with a 'pending' status (for admin review).
 */
export const usePendingBusinesses = () => {
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  const loadPendingBusinesses = useCallback(async () => {
    if (!userProfile || userProfile.role !== 'admin') {
        setLoading(false);
        return;
    };
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

/**
 * Hook for admin actions like approving or rejecting businesses.
 */
export const useBusinessActions = () => {
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();

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
  }, [userProfile]);

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
  }, [userProfile]);

  return {
    approveBusiness,
    rejectBusiness,
    loading
  };
};
