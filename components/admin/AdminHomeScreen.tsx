/**
 * Admin Home Screen
 * Dashboard and overview for admin users
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useFirebaseAuth';
import { usePendingBusinesses, useAdminStats } from '../../hooks/useAdmin';
import { useTheme } from '../../hooks/useTheme';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

// Navigation Prop Type
type AdminHomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AdminDashboard'
>;

// Prop Interfaces
interface AdminHomeScreenProps {
  navigation: AdminHomeScreenNavigationProp;
}

interface HeaderProps {
  userName: string | null | undefined;
  onSignOut: () => void;
}

interface Stat {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  color: string;
  onPress: () => void;
}

interface StatsGridProps {
  stats: Stat[];
}

interface Action {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}

interface QuickActionsProps {
  actions: Action[];
}

// Memoized Sub-components
const Header: React.FC<HeaderProps> = React.memo(({ userName, onSignOut }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greeting}>Good morning!</Text>
          <Text style={styles.adminName}>{userName || 'Administrator'}</Text>
          <Text style={styles.roleTag}>👑 System Administrator</Text>
        </View>
        <TouchableOpacity onPress={onSignOut} style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const StatsGrid: React.FC<StatsGridProps> = React.memo(({ stats }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>System Overview</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <TouchableOpacity
            key={index}
            style={styles.statCard}
            onPress={stat.onPress}
          >
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: stat.color },
              ]}
            >
              <Ionicons name={stat.icon} size={24} color="#fff" />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

const QuickActions: React.FC<QuickActionsProps> = React.memo(({ actions }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.actionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={styles.actionCard}
          onPress={action.onPress}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name={action.icon} size={24} color="#6366f1" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      ))}
    </View>
  );
});

const RecentActivity: React.FC = React.memo(() => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.activityContainer}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityCard}>
        <Text style={styles.activityText}>
          🏢 Rainbow Café submitted for approval
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
        <Text style={styles.activityText}>✅ Pride Fitness Studio approved</Text>
        <Text style={styles.activityTime}>1 day ago</Text>
      </View>
    </View>
  );
});

// Main Component
export const AdminHomeScreen: React.FC<AdminHomeScreenProps> = ({
  navigation,
}) => {
  const { user, logout } = useAuth();
  const {
    businesses: pendingBusinesses,
    loading: pendingLoading,
    refresh: refreshPending,
  } = usePendingBusinesses();
  const {
    stats: platformStats,
    loading: statsLoading,
    refresh: refreshStats,
  } = useAdminStats();
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);

  const onRefresh = () => {
    refreshPending();
    refreshStats();
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      Alert.alert('Sign Out Error', message);
    }
  };

  const adminStats: Stat[] = [
    {
      icon: 'business',
      title: 'Pending Approvals',
      value: pendingBusinesses.length.toString(),
      color: '#f59e0b',
      onPress: () => navigation.navigate('BusinessManagement'),
    },
    {
      icon: 'people',
      title: 'Total Users',
      value: platformStats?.totalUsers.toLocaleString() || '0',
      color: '#10b981',
      onPress: () => navigation.navigate('UserManagement'),
    },
    {
      icon: 'business-outline',
      title: 'Total Businesses',
      value: platformStats?.totalBusinesses.toLocaleString() || '0',
      color: '#3b82f6',
      onPress: () => navigation.navigate('BusinessManagement'),
    },
    {
      icon: 'star',
      title: 'Total Reviews',
      value: platformStats?.totalReviews.toLocaleString() || '0',
      color: '#8b5cf6',
      onPress: () => navigation.navigate('BusinessManagement'),
    },
  ];

  const quickActions: Action[] = [
    {
      icon: 'add-circle',
      title: 'Add Business',
      subtitle: 'Manually add a new business',
      onPress: () => navigation.navigate('AddBusiness'),
    },
    {
      icon: 'settings',
      title: 'Platform Settings',
      subtitle: 'Configure system preferences',
      onPress: () => navigation.navigate('UserManagement'),
    },
    {
      icon: 'analytics',
      title: 'View Analytics',
      subtitle: 'Platform usage and metrics',
      onPress: () =>
        Alert.alert(
          'Analytics Dashboard',
          'Coming in next update! Current stats available on this dashboard.'
        ),
    },
    {
      icon: 'notifications',
      title: 'Notifications',
      subtitle: 'Admin alerts and updates',
      onPress: () =>
        Alert.alert(
          'Notification Center',
          'No new notifications. All systems operating normally.'
        ),
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={pendingLoading || statsLoading}
          onRefresh={onRefresh}
        />
      }
    >
      <Header userName={user?.displayName} onSignOut={handleSignOut} />
      <StatsGrid stats={adminStats} />
      <QuickActions actions={quickActions} />
      <RecentActivity />
    </ScrollView>
  );
};

// Theme-aware Styles
const localStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.header,
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
      color: colors.headerText,
      fontSize: 16,
      opacity: 0.8,
    },
    adminName: {
      color: colors.headerText,
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 5,
    },
    roleTag: {
      color: colors.primary,
      fontSize: 14,
      marginTop: 5,
      fontWeight: '600',
    },
    signOutButton: {
      backgroundColor: colors.card,
      padding: 10,
      borderRadius: 50,
    },
    statsContainer: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 15,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statCard: {
      backgroundColor: colors.card,
      width: '48%',
      padding: 20,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 15,
      shadowColor: colors.shadow,
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
      color: colors.text,
      marginBottom: 5,
    },
    statTitle: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    actionsContainer: {
      padding: 20,
      paddingTop: 0,
    },
    actionCard: {
      backgroundColor: colors.card,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      borderRadius: 12,
      marginBottom: 10,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    actionIconContainer: {
      width: 40,
      height: 40,
      backgroundColor: colors.primary + '20', // 12.5% opacity
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
      color: colors.text,
    },
    actionSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    activityContainer: {
      padding: 20,
      paddingTop: 0,
    },
    activityCard: {
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    activityText: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 5,
    },
    activityTime: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });
