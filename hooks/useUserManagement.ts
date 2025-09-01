/**
 * React Hooks for User Management (Admin)
 * Centralized hooks for fetching, filtering, and managing users.
 */

import { useState, useEffect, useCallback } from 'react';
import { adminService, UserDetails, UserFilters } from '../services/adminService';

/**
 * Hook to fetch and manage a paginated list of users.
 */
export const useUserManagement = (initialFilters: UserFilters = {}) => {
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<UserFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUsers = useCallback(async (page: number, search: string, currentFilters: UserFilters) => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.getUsers(page, 50, search, currentFilters);
      setUsers(page === 1 ? result.users : prev => [...prev, ...result.users]);
      setTotalCount(result.totalCount);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(currentPage, searchQuery, filters);
  }, [currentPage, searchQuery, filters, loadUsers]);

  const refresh = () => {
    if (currentPage === 1) {
      loadUsers(1, searchQuery, filters);
    } else {
      setCurrentPage(1);
    }
  };

  const loadMore = () => {
    if (!loading && users.length < totalCount) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return {
    users,
    loading,
    error,
    totalCount,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    refresh,
    loadMore,
  };
};

/**
 * Hook to manage details for a single user.
 */
export const useUserDetails = (userId: string | null) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const userDetails = await adminService.getUserDetails(userId);
      setUser(userDetails);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  return { user, loading, error, refresh: fetchUserDetails };
};

/**
 * Hook for performing actions on a user (e.g., updating status, adding notes).
 */
export const useUserActions = () => {
  const [loading, setLoading] = useState(false);

  const updateUserStatus = async (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    setLoading(true);
    try {
      await adminService.updateUserStatus(userId, newStatus);
    } finally {
      setLoading(false);
    }
  };

  const addUserNote = async (userId: string, note: string, severity: 'info' | 'warning' | 'critical' = 'info') => {
    setLoading(true);
    try {
      // Assuming adminId and adminName are handled or not required by the service for this hook
      await adminService.addUserNote(userId, note, severity);
    } finally {
      setLoading(false);
    }
  };

  return { updateUserStatus, addUserNote, loading };
};
