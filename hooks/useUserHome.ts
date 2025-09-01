import { useState, useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './useFirebaseAuth';
import { useBusinesses } from './useBusiness';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { BusinessListing } from '../types/business';

type UserHomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export const useUserHome = () => {
  const { userProfile } = useAuth();
  const navigation = useNavigation<UserHomeScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch a small number of businesses for the home screen
  const { businesses, loading, error } = useBusinesses({}, 6);

  const featuredBusinesses = useMemo(() => businesses.slice(0, 3), [businesses]);

  const handleBusinessPress = useCallback((business: BusinessListing) => {
    navigation.navigate('BusinessDetails', { businessId: business.id });
  }, [navigation]);

  const handleSearch = useCallback(() => {
    navigation.navigate('Directory', { searchQuery: searchQuery.trim() });
  }, [searchQuery, navigation]);

  const handleSeeAll = useCallback(() => {
    navigation.navigate('Directory', { searchQuery: '' });
  }, [navigation]);

  const firstName = userProfile?.displayName?.split(' ')[0] || 'Friend';

  return {
    firstName,
    searchQuery,
    setSearchQuery,
    featuredBusinesses,
    loading,
    error,
    handleBusinessPress,
    handleSearch,
    handleSeeAll,
  };
};
