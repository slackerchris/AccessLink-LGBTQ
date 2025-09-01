import { useState, useEffect, useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from './useFirebaseAuth';
import { useBusinessDetails } from './useProperBusiness';
import { savedPlacesService } from '../services/savedPlacesService';
import { getBusinessReviews, UserReview } from '../services/reviewService';
import { trackBusinessView } from '../services/viewTrackingService';
import { adaptBusinessForDisplay } from '../utils/businessAdapters';
import { RootStackParamList } from '../types/navigation';
import { BusinessListing } from '../services/businessService';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const useBusinessDetailsScreen = (businessId: string, initialBusiness?: BusinessListing) => {
  const { user, userProfile } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const { business: fetchedBusiness, loading, error, refresh } = useBusinessDetails(businessId);

  const [businessData, setBusinessData] = useState(() => {
    if (initialBusiness) {
      return adaptBusinessForDisplay(initialBusiness);
    }
    return null;
  });
  const [isSaved, setIsSaved] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (fetchedBusiness) {
      const adapted = adaptBusinessForDisplay(fetchedBusiness as any);
      setBusinessData(adapted);
    }
  }, [fetchedBusiness]);

  useFocusEffect(
    useCallback(() => {
      if (businessId) {
        refresh();
      }
    }, [businessId, refresh])
  );

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (businessId && user?.uid) {
        try {
          const saved = await savedPlacesService.isBusinessSaved(user.uid, businessId);
          setIsSaved(saved);
        } catch (err) {
          console.error('Error checking saved status:', err);
        }
      }
    };
    checkSavedStatus();
  }, [businessId, user?.uid]);

  useEffect(() => {
    const loadReviews = async () => {
      if (businessId) {
        setLoadingReviews(true);
        try {
          const fetchedReviews = await getBusinessReviews(businessId, 5); // Fetch up to 5 reviews
          setReviews(fetchedReviews);
        } catch (err) {
          console.error('Error loading reviews:', err);
          setReviews([]);
        } finally {
          setLoadingReviews(false);
        }
      }
    };
    loadReviews();
  }, [businessId]);

  useEffect(() => {
    const trackView = async () => {
      if (businessId) {
        try {
          await trackBusinessView(businessId);
        } catch (err) {
          console.warn('View tracking failed (non-critical):', err);
        }
      }
    };
    trackView();
  }, [businessId]);

  const toggleSaved = async () => {
    if (!user?.uid || !businessId) {
      Alert.alert('Login Required', 'Please login to save businesses.');
      return;
    }
    if (loadingSaved) return;

    setLoadingSaved(true);
    try {
      if (isSaved) {
        await savedPlacesService.unsaveBusiness(user.uid, businessId);
        setIsSaved(false);
        Alert.alert('Removed', `${businessData?.name || 'Business'} has been removed from your saved places.`);
      } else {
        await savedPlacesService.saveBusiness(user.uid, businessId);
        setIsSaved(true);
        Alert.alert('Saved', `${businessData?.name || 'Business'} has been added to your saved places.`);
      }
    } catch (err) {
      console.error('Failed to toggle saved business:', err);
      Alert.alert('Error', 'Failed to update saved places. Please try again.');
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleCall = () => {
    if (businessData?.contact?.phone) {
      Linking.openURL(`tel:${businessData.contact.phone}`);
    }
  };

  const handleWebsite = () => {
    if (businessData?.contact?.website) {
      Linking.openURL(businessData.contact.website);
    }
  };

  const handleDirections = () => {
    if (businessData?.location) {
      const { address, city, state, zipCode } = businessData.location;
      const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${address}, ${city}, ${state} ${zipCode}`)}`;
      Linking.openURL(mapsUrl);
    }
  };

  const handleWriteReview = () => {
    if (!userProfile) {
      Alert.alert('Login Required', 'Please login to write a review.');
      return;
    }
    if (businessId && businessData?.name) {
      navigation.navigate('CreateReview', { businessId, businessName: businessData.name });
    }
  };

  const handleFeedback = () => {
    if (!userProfile) {
      Alert.alert('Login Required', 'Please login to send feedback.');
      return;
    }
    if (businessData?.contact?.email) {
      const subject = `Feedback about your AccessLink listing: ${businessData.name}`;
      const body = `Hello,\n\nI found your business on AccessLink LGBTQ+ and wanted to reach out about...`;
      Linking.openURL(`mailto:${businessData.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    } else {
      Alert.alert('Contact Info Missing', "This business doesn't have a contact email listed.");
    }
  };

  return {
    business: businessData,
    loading: loading && !businessData,
    error,
    reviews,
    loadingReviews,
    isSaved,
    loadingSaved,
    actions: {
      toggleSaved,
      handleCall,
      handleWebsite,
      handleDirections,
      handleWriteReview,
      handleFeedback,
      refresh,
    },
  };
};
