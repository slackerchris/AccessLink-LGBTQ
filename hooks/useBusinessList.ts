import { useState, useEffect, useCallback } from 'react';
import { enhancedBusinessService } from '../services/enhancedBusinessService';
import { ApprovedBusiness } from '../services/properBusinessService';
import { DocumentSnapshot } from 'firebase/firestore';

export const useBusinessList = () => {
  const [businesses, setBusinesses] = useState<ApprovedBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchBusinesses = useCallback(async (loadMore = false) => {
    if (loading || (loadMore && !hasMore)) return;

    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Note: Searching/filtering will require a different backend approach
      // For now, we fetch all and filter on the client, which is not scalable.
      // A real implementation would use a search service like Algolia or a more complex Firestore query.
      const result = await enhancedBusinessService.getApprovedBusinesses(20, loadMore ? lastDoc : undefined);

      if (result.success && result.data) {
        const { items, lastDoc: newLastDoc, hasMore: newHasMore } = result.data;
        
        setBusinesses(prev => loadMore ? [...prev, ...items] : items);
        setLastDoc(newLastDoc || undefined);
        setHasMore(newHasMore);
      } else {
        setError(result.error?.message || 'Failed to fetch businesses');
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [hasMore, lastDoc, loading]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const refresh = useCallback(() => {
    setLastDoc(undefined);
    setHasMore(true);
    fetchBusinesses();
  }, [fetchBusinesses]);

  const filteredBusinesses = businesses.filter(biz => {
    const categoryMatch = selectedCategory === 'all' || biz.category === selectedCategory;
    const searchMatch = searchQuery === '' || 
                        biz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (biz.searchTerms && biz.searchTerms.some(term => term.includes(searchQuery.toLowerCase())));
    return categoryMatch && searchMatch;
  });

  return {
    businesses: filteredBusinesses,
    loading,
    loadingMore,
    error,
    hasMore,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    loadMore: () => fetchBusinesses(true),
    refresh,
  };
};
