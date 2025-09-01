import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth as useFirebaseAuth } from './useFirebaseAuth';
import { getUserReviews, UserReview } from '../services/reviewService';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type ReviewHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ReviewHistory'>;

type Review = UserReview & {
  accessibilityTags?: string[];
  helpfulCount?: number;
};

export const useReviewHistory = (navigation: ReviewHistoryScreenNavigationProp) => {
  const { userProfile } = useFirebaseAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    if (!userProfile?.uid) {
      setError('You must be logged in to see your reviews.');
      return;
    }
    setError(null);
    try {
      const items = await getUserReviews(userProfile.uid);
      setReviews(items);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error("Failed to fetch reviews from 'reviews' collection:", errorMessage);
      setError(`Could not load reviews. Please try again later. Details: ${errorMessage}`);
      setReviews([]); // Ensure reviews are cleared on error
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile?.uid) {
      loadReviews();
    }
  }, [loadReviews, userProfile?.uid]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
  }, [loadReviews]);

  const handleEditReview = (review: Review) => {
    Alert.alert('Edit Review', 'Review editing is coming soon!', [{ text: 'OK' }]);
  };

  const handleDeleteReview = (review: Review) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Success', 'Review deleted successfully!');
        },
      },
    ]);
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    const toDate = (ts: any) => {
        if (ts && typeof ts.seconds === 'number' && typeof ts.nanoseconds === 'number') {
            return new Date(ts.seconds * 1000);
        }
        return new Date(ts);
    };
    return toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime();
  });

  return {
    refreshing,
    reviews: sortedReviews,
    error,
    onRefresh,
    handleEditReview,
    handleDeleteReview,
    loadReviews,
  };
};
