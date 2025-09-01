/**
 * Admin Dashboard Component
 * Administrative interface for managing users and businesses
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { useTheme } from '../../hooks/useTheme';
import { BusinessListing } from '../../types/business';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

// Navigation Prop Type
type AdminDashboardNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AdminDashboard'
>;

// Prop Interfaces
interface AdminDashboardProps {
  navigation: AdminDashboardNavigationProp;
}

interface DashboardHeaderProps {
  userName: string | null | undefined;
  onBack: () => void;
}

interface StatCardProps {
  label: string;
  value: string | number;
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
}

interface PendingBusinessCardProps {
  item: BusinessListing;
  onApprove: (id: string, name: string) => void;
  onReject: (id: string, name: string) => void;
  actionLoading: boolean;
}

// Memoized Sub-components
const DashboardHeader: React.FC<DashboardHeaderProps> = React.memo(
  ({ userName, onBack }) => {
    const { colors, createStyles } = useTheme();
    const styles = createStyles(localStyles);
    return (
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>🔧 Admin Dashboard</Text>
          <Text style={styles.subtitle}>Welcome back, {userName}</Text>
        </View>
      </View>
    );
  }
);

const StatCard: React.FC<StatCardProps> = React.memo(({ label, value }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
});

const ActionCard: React.FC<ActionCardProps> = React.memo(
  ({ title, description, icon, onPress }) => {
    const { createStyles } = useTheme();
    const styles = createStyles(localStyles);
    return (
      <TouchableOpacity style={styles.actionCard} onPress={onPress}>
        <Text style={styles.actionIcon}>{icon}</Text>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionDescription}>{description}</Text>
        </View>
      </TouchableOpacity>
    );
  }
);

const PendingBusinessCard: React.FC<PendingBusinessCardProps> = React.memo(
  ({ item, onApprove, onReject, actionLoading }) => {
    const { createStyles } = useTheme();
    const styles = createStyles(localStyles);
    return (
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
            onPress={() => onApprove(item.id!, item.name)}
            disabled={actionLoading}
          >
            <Text style={styles.approveButtonText}>✓ Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => onReject(item.id!, item.name)}
            disabled={actionLoading}
          >
            <Text style={styles.rejectButtonText}>✗ Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

const AccessDenied: React.FC = React.memo(() => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
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
});

const EmptyState: React.FC<{
  icon: string;
  title: string;
  message: string;
}> = React.memo(({ icon, title, message }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
});

// Main Component
export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  navigation,
}) => {
  const {
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
  } = useAdminDashboard(navigation);

  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);

  const renderPendingBusiness = ({ item }: { item: BusinessListing }) => (
    <PendingBusinessCard
      item={item}
      onApprove={handleApproveBusiness}
      onReject={handleRejectBusiness}
      actionLoading={actionLoading}
    />
  );

  if (!isAdmin) {
    return <AccessDenied />;
  }

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
      <DashboardHeader
        userName={user?.displayName}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.statsContainer}>
        <StatCard
          label="Pending Reviews"
          value={pendingBusinesses.length ?? '...'}
        />
        <StatCard label="Total Users" value={stats?.totalUsers ?? '...'} />
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ActionCard
          title="Manage Businesses"
          description="View, edit, and feature business listings"
          icon="🏢"
          onPress={handleShowBusinessManagementAlert}
        />
        <ActionCard
          title="User Management"
          description="Manage user accounts and permissions"
          icon="👥"
          onPress={handleNavigateToUserManagement}
        />
        <ActionCard
          title="Debug Dashboard"
          description="System monitoring, logs, and debugging tools"
          icon="🔧"
          onPress={handleNavigateToDebugDashboard}
        />
      </View>

      <View style={styles.pendingSection}>
        <Text style={styles.sectionTitle}>Pending Business Reviews</Text>
        {pendingLoading ? (
          <EmptyState
            icon="⏳"
            title="Loading..."
            message="Loading pending businesses..."
          />
        ) : pendingBusinesses.length === 0 ? (
          <EmptyState
            icon="✅"
            title="All caught up!"
            message="No businesses pending review"
          />
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

// Theme-aware Styles
const localStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      paddingTop: 40,
      backgroundColor: colors.header,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + '33', // 20% opacity
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
      color: colors.headerText,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: colors.headerText + 'b3', // 70% opacity
    },
    statsContainer: {
      flexDirection: 'row',
      padding: 20,
      paddingBottom: 10,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      marginHorizontal: 5,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    statNumber: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    quickActions: {
      padding: 20,
      paddingTop: 10,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    actionCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.shadow,
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
      color: colors.text,
      marginBottom: 4,
    },
    actionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    pendingSection: {
      padding: 20,
      paddingTop: 10,
    },
    businessCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: colors.shadow,
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
      color: colors.text,
      flex: 1,
    },
    businessCategory: {
      fontSize: 12,
      color: colors.primary,
      backgroundColor: colors.primary + '1a', // 10% opacity
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      textTransform: 'capitalize',
    },
    businessDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    businessLocation: {
      marginBottom: 16,
    },
    locationText: {
      fontSize: 14,
      color: colors.textSecondary,
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
      backgroundColor: colors.success,
    },
    rejectButton: {
      backgroundColor: colors.notification,
    },
    approveButtonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '600',
    },
    rejectButtonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '600',
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      margin: 20,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
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
      color: colors.notification,
      marginBottom: 16,
    },
    accessDeniedText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
