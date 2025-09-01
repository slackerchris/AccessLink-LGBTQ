import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth, usePermissions } from './useFirebaseAuth';
import { usePendingBusinesses, useBusinessActions, useAdminStats } from './useAdmin';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type AdminDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'AdminDashboard'>;

export const useAdminDashboard = (navigation: AdminDashboardNavigationProp) => {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const { businesses: pendingBusinesses, loading: pendingLoading, refresh: refreshPending } = usePendingBusinesses();
  const { approveBusiness, rejectBusiness, loading: actionLoading } = useBusinessActions();
  const { stats, loading: statsLoading, refresh: refreshStats } = useAdminStats();

  const onRefresh = useCallback(() => {
    refreshPending();
    refreshStats();
  }, [refreshPending, refreshStats]);

  const handleApproveBusiness = async (businessId: string, businessName: string) => {
    Alert.alert(
      'Approve Business',
      `Are you sure you want to approve "${businessName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await approveBusiness(businessId);
              Alert.alert('Success', 'Business has been approved');
              onRefresh();
            } catch (error) {
              Alert.alert('Error', 'Failed to approve business');
            }
          }
        }
      ]
    );
  };

  const handleRejectBusiness = async (businessId: string, businessName: string) => {
    Alert.alert(
      'Reject Business',
      `Are you sure you want to reject "${businessName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectBusiness(businessId);
              Alert.alert('Success', 'Business has been rejected');
              onRefresh();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject business');
            }
          }
        }
      ]
    );
  };

  const handleNavigateToUserManagement = () => {
    navigation.navigate('UserManagement');
  };

  const handleNavigateToDebugDashboard = () => {
    navigation.navigate('DebugDashboard');
  };
  
  const handleShowBusinessManagementAlert = () => {
    Alert.alert(
      'Business Management',
      'Business management features are coming soon!\\n\\nFor now, you can manage pending business approvals in the section below.',
      [{ text: 'OK' }]
    );
  };

  return {
    user,
    isAdmin,
    pendingBusinesses,
    pendingLoading,
    actionLoading,
    stats,
    statsLoading,
    onRefresh,
    handleApproveBusiness,
    handleRejectBusiness,
    handleNavigateToUserManagement,
    handleNavigateToDebugDashboard,
    handleShowBusinessManagementAlert,
  };
};
