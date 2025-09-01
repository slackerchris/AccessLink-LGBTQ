import { useBusiness } from './useFirebaseAuth';
import { useTheme } from './useTheme';

interface ManageBusinessListScreenProps {
  navigation?: any;
}

export const useManageBusinessList = (navigation: ManageBusinessListScreenProps['navigation']) => {
  const { businesses, loading: businessesLoading, refreshBusinesses } = useBusiness();
  const { colors } = useTheme();

  const handleBusinessPress = (business: any) => {
    if (navigation) {
      navigation.navigate('BusinessProfileEdit', { businessId: business.id });
    } else {
      console.warn('Navigation not available for business edit');
    }
  };

  const handleAddBusiness = () => {
    if (navigation) {
      navigation.navigate('AddBusiness');
    } else {
      console.warn('Navigation not available for adding business');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  return {
    businesses,
    businessesLoading,
    refreshBusinesses,
    colors,
    handleBusinessPress,
    handleAddBusiness,
    getStatusColor,
    getStatusIcon,
    navigation,
  };
};
