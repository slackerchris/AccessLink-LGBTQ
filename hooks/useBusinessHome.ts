import { useMemo } from 'react';
import { useAuth, useBusiness } from './useFirebaseAuth';

export const useBusinessHome = () => {
  const { user, userProfile } = useAuth();
  const { businesses, loading: businessLoading, error: businessError } = useBusiness();

  const firstName = user?.displayName?.split(' ')[0] || 'Business Owner';
  const isBizUser = userProfile?.role === 'bizowner' || userProfile?.role === 'bizmanager';

  const businessStats = useMemo(() => {
    if (!businesses || businesses.length === 0) {
      return {
        totalBusinesses: 0,
        totalViews: 0,
        averageRating: 0,
        totalReviews: 0,
      };
    }

    let totalViews = 0;
    let totalRating = 0;
    let totalReviews = 0;

    businesses.forEach((business) => {
      totalViews += (business as any).views || 0;
      totalReviews += business.totalReviews || 0;
      if (business.averageRating && business.totalReviews) {
        totalRating += business.averageRating * business.totalReviews;
      }
    });

    const overallRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    return {
      totalBusinesses: businesses.length,
      totalViews,
      averageRating: overallRating,
      totalReviews,
    };
  }, [businesses]);

  return {
    user,
    userProfile,
    firstName,
    isBizUser,
    businesses,
    businessLoading,
    businessError,
    businessStats,
  };
};
