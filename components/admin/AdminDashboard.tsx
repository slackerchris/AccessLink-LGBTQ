/**
 * Admin Dashboard Component
 * Administrative interface for managing users and businesses
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, usePermissions } from '../../hooks/useFirebaseAuth';
import { usePendingBusinesses, useBusinessActions } from '../../hooks/useBusiness';
import { BusinessListing } from '../../services/mockBusinessService';
import { adminService, PlatformStats } from '../../services/adminService';

interface AdminDashboardProps {
  navigation: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  navigation
}) => {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const { businesses: pendingBusinesses, loading, refresh } = usePendingBusinesses();
  const { approveBusiness, rejectBusiness, loading: actionLoading } = useBusinessActions();

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    loadPlatformStats();
  }, []);

  const loadPlatformStats = async () => {
    try {
      const platformStats = await adminService.getPlatformStats();
      setStats(platformStats);
    } catch (error) {
      console.error('Error loading platform stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

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
              refresh();
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
              refresh();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject business');
            }
          }
        }
      ]
    );
  };

  const renderPendingBusiness = ({ item }: { item: BusinessListing }) => (
    <View style={styles.businessCard}>
      <View style={styles.businessHeader}>
        <Text style={styles.businessName}>{item.name}</Text>
        <Text style={styles.businessCategory}>{item.category}</Text>
      </View>
      
      <Text style={styles.businessDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.businessLocation}>
        <Text style={styles.locationText}>
          📍 {item.location.city}, {item.location.state}
        </Text>
      </View>
      
      <View style={styles.businessActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApproveBusiness(item.id!, item.name)}
          disabled={actionLoading}
        >
          <Text style={styles.approveButtonText}>✓ Approve</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectBusiness(item.id!, item.name)}
          disabled={actionLoading}
        >
          <Text style={styles.rejectButtonText}>✗ Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedTitle}>🚫 Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            You don't have admin privileges to access this section.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#6366f1" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>🔧 Admin Dashboard</Text>
          <Text style={styles.subtitle}>Welcome back, {user?.displayName}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pendingBusinesses.length}</Text>
          <Text style={styles.statLabel}>Pending Reviews</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>👥</Text>
          <Text style={styles.statLabel}>User Management</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => {
            Alert.alert(
              'Business Management',
              'Business management features are coming soon!\n\nFor now, you can manage pending business approvals in the section below.',
              [{ text: 'OK' }]
            );
          }}
        >
          <Text style={styles.actionIcon}>🏢</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Businesses</Text>
            <Text style={styles.actionDescription}>View, edit, and feature business listings</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('UserManagement')}
        >
          <Text style={styles.actionIcon}>👥</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>User Management</Text>
            <Text style={styles.actionDescription}>Manage user accounts and permissions</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('DebugDashboard')}
        >
          <Text style={styles.actionIcon}>🔧</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Debug Dashboard</Text>
            <Text style={styles.actionDescription}>System monitoring, logs, and debugging tools</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.pendingSection}>
        <Text style={styles.sectionTitle}>Pending Business Reviews</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading pending businesses...</Text>
          </View>
        ) : pendingBusinesses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyText}>No businesses pending review</Text>
          </View>
        ) : (
          <FlatList
            data={pendingBusinesses}
            renderItem={renderPendingBusiness}
            keyExtractor={(item) => item.id!}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#6c5ce7',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6c5ce7',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  quickActions: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
  pendingSection: {
    padding: 20,
    paddingTop: 10,
  },
  businessCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  businessCategory: {
    fontSize: 12,
    color: '#6c5ce7',
    backgroundColor: '#f0f0ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: 'capitalize',
  },
  businessDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  businessLocation: {
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: '#888',
  },
  businessActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  approveButton: {
    backgroundColor: '#4caf50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  approveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 16,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
