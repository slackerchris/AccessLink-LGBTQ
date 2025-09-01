import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth, useBusiness } from './useFirebaseAuth';
import { useTheme } from './useTheme';
import { enhancedBusinessService } from '../services/enhancedBusinessService';
import { BusinessListing } from '../types/business';
import { Review } from '../types/review';

export const useBusinessReviewsManagement = () => {
  const { user, userProfile } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const { businesses, loading: businessesLoading, error: businessesError } = useBusiness();

  const [selectedBusiness, setSelectedBusiness] = useState<BusinessListing | null>(null);
  const [showBusinessSelector, setShowBusinessSelector] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    if (businesses.length > 0 && !selectedBusiness) {
      setSelectedBusiness(businesses[0]);
    } else if (businesses.length === 0 && !businessesLoading) {
      setSelectedBusiness(null);
    }
  }, [businesses, selectedBusiness, businessesLoading]);

  const loadReviews = useCallback(async (businessId: string) => {
    setLoadingReviews(true);
    const result = await enhancedBusinessService.getBusinessReviews(businessId);
    if (result.success && result.data) {
      setReviews(result.data);
    } else {
      Alert.alert('Error', 'Failed to load reviews.');
      console.error('Error loading reviews:', result.error);
    }
    setLoadingReviews(false);
  }, []);

  useEffect(() => {
    if (selectedBusiness?.id) {
      loadReviews(selectedBusiness.id);
    } else {
      setReviews([]);
      setLoadingReviews(false);
    }
  }, [selectedBusiness, loadReviews]);

  const handleRefresh = useCallback(async () => {
    if (selectedBusiness?.id) {
      setRefreshing(true);
      await loadReviews(selectedBusiness.id);
      setRefreshing(false);
    }
  }, [selectedBusiness, loadReviews]);

  const handleResponseSubmitted = useCallback(async () => {
    if (selectedBusiness?.id) {
      await loadReviews(selectedBusiness.id);
    }
  }, [selectedBusiness, loadReviews]);

  const handleBusinessSelection = (business: BusinessListing) => {
    setSelectedBusiness(business);
    setShowBusinessSelector(false);
  };

  const handleRespondToReview = (review: Review) => {
    setSelectedReview(review);
    setResponseModalVisible(true);
  };

  const reviewStats = useMemo(() => {
    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingsBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const totalRating = reviews.reduce((acc, review) => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        breakdown[rating as keyof typeof breakdown]++;
      }
      return acc + review.rating;
    }, 0);
    return {
      totalReviews: reviews.length,
      averageRating: totalRating / reviews.length,
      ratingsBreakdown: breakdown,
    };
  }, [reviews]);

  const isBizUser = userProfile?.role === 'bizowner' || userProfile?.role === 'bizmanager';

  return {
    user,
    isBizUser,
    colors,
    isDarkMode,
    businesses,
    businessesLoading,
    businessesError,
    selectedBusiness,
    showBusinessSelector,
    setShowBusinessSelector,
    reviews,
    loadingReviews,
    refreshing,
    responseModalVisible,
    setResponseModalVisible,
    selectedReview,
    handleRefresh,
    handleResponseSubmitted,
    handleBusinessSelection,
    handleRespondToReview,
    reviewStats,
  };
};
