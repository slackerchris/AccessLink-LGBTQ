import { useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useBusiness } from './useFirebaseAuth';
import { BusinessListing } from '../types/business';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = StackNavigationProp<RootStackParamList, 'BusinessProfilesList'>;

export const useBusinessProfilesList = () => {
  const { businesses, loading, error, refreshBusinesses } = useBusiness();
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    // Initial load
    refreshBusinesses();
  }, []);

  const handleRefresh = useCallback(() => {
    refreshBusinesses();
  }, [refreshBusinesses]);

  const handleEditBusiness = (business: BusinessListing) => {
    // The BusinessProfileEditScreen is designed to fetch the business profile,
    // so we don't need to pass any params.
    navigation.navigate('BusinessProfileEdit');
  };

  const handleAddBusiness = () => {
    navigation.navigate('AddBusiness');
  };

  return {
    businesses,
    loading,
    error,
    handleRefresh,
    handleEditBusiness,
    handleAddBusiness,
  };
};
