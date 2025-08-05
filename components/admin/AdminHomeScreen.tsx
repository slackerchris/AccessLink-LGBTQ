/**
 * Admin Home Screen
 * Dashboard and overview for admin users
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useFirebaseAuth';
import { usePendingBusinesses } from '../../hooks/useBusiness';
import { adminService, PlatformStats } from '../../services/adminService';
import { useTheme } from '../../hooks/useTheme';

interface AdminHomeScreenProps {
  navigation: any;
}

export const AdminHomeScreen: React.FC<AdminHomeScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { businesses: pendingBusinesses } = usePendingBusinesses();
  const { colors, theme, toggleTheme } = useTheme();
  
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPlatformStats();
  }, []);

  const loadPlatformStats = async () => {
    try {
      const stats = await adminService.getPlatformStats();
      setPlatformStats(stats);
    } catch (error) {
      console.error('Error loading platform stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPlatformStats();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error: any) {
      Alert.alert('Sign Out Error', error.message);
    }
  };

  const adminStats = [
    {
      icon: 'business',
      title: 'Pending Approvals',
      value: pendingBusinesses.length.toString(),
      color: '#f59e0b',
      onPress: () => navigation.navigate('BusinessManagement')
    },
    {
      icon: 'people',
      title: 'Total Users',
      value: platformStats?.totalUsers.toLocaleString() || '0',
      color: '#10b981',
      onPress: () => navigation.navigate('UserManagement')
    },
    {
      icon: 'business-outline',
      title: 'Total Businesses', 
      value: platformStats?.totalBusinesses.toLocaleString() || '0',
      color: '#3b82f6',
      onPress: () => navigation.navigate('BusinessManagement')
    },
    {
      icon: 'star',
      title: 'Total Reviews',
      value: platformStats?.totalReviews.toLocaleString() || '0',
      color: '#8b5cf6',
      onPress: () => navigation.navigate('BusinessManagement') // Navigate to business management for review oversight
    }
  ];

  const quickActions = [
    {
      icon: 'add-circle',
      title: 'Add Business',
      subtitle: 'Manually add a new business',
      onPress: () => {
        // Navigate to AddBusiness screen within AdminStack
        navigation.navigate('AddBusiness');
      }
    },
    {
      icon: 'settings',
      title: 'Platform Settings',
      subtitle: 'Configure system preferences',
      onPress: () => navigation.navigate('UserManagement') // Navigate to user management as closest settings feature
    },
    {
      icon: 'analytics',
      title: 'View Analytics',
      subtitle: 'Platform usage and metrics',
      onPress: () => Alert.alert('Analytics Dashboard', 'Coming in next update! Current stats available on this dashboard.')
    },
    {
      icon: 'notifications',
      title: 'Notifications',
      subtitle: 'Admin alerts and updates',
      onPress: () => Alert.alert('Notification Center', 'No new notifications. All systems operating normally.')
    }
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.greeting, { color: colors.headerText }]}>Good morning!</Text>
            <Text style={[styles.adminName, { color: colors.headerText }]}>
              {user?.displayName || 'Administrator'}
            </Text>
            <Text style={[styles.roleTag, { color: colors.headerText }]}>👑 System Administrator</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>System Overview</Text>
        <View style={styles.statsGrid}>
          {adminStats.map((stat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.statCard}
              onPress={stat.onPress}
            >
              <View style={[styles.statIconContainer, { backgroundColor: stat.color }]}>
                <Ionicons name={stat.icon as any} size={24} color="#fff" />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionCard}
            onPress={action.onPress}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name={action.icon as any} size={24} color="#6366f1" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>
            🏢 New business submitted for approval
          </Text>
          <Text style={styles.activityTime}>2 hours ago</Text>
        </View>
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>
            👤 New user registration: alex@example.com
          </Text>
          <Text style={styles.activityTime}>4 hours ago</Text>
        </View>
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>
            ✅ Pride Fitness Studio approved
          </Text>
          <Text style={styles.activityTime}>1 day ago</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    color: '#e0e7ff',
    fontSize: 16,
  },
  adminName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  roleTag: {
    color: '#fbbf24',
    fontSize: 14,
    marginTop: 5,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 50,
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  actionCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#e0e7ff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  activityContainer: {
    padding: 20,
    paddingTop: 0,
  },
  activityCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  activityText: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 5,
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  adminBanner: {
    backgroundColor: '#dc2626',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#991b1b',
  },
  adminBannerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  adminBannerSubtext: {
    fontSize: 16,
    color: '#fecaca',
    textAlign: 'center',
    marginTop: 5,
  },
});
