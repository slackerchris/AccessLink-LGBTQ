import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useBusinessHome } from '../../hooks/useBusinessHome';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

type BusinessHomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface BusinessHomeScreenProps {
  navigation: BusinessHomeScreenNavigationProp;
}

// --- Memoized Sub-components ---

const LoadingState: React.FC = React.memo(() => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
});

const AccessDeniedState: React.FC = React.memo(() => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.container}>
      <View style={styles.accessDeniedCard}>
        <Ionicons name="business-outline" size={64} color={colors.notification} />
        <Text style={styles.accessDeniedTitle}>Business Access Required</Text>
        <Text style={styles.accessDeniedText}>This section is only for business owners and managers.</Text>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => Alert.alert('Business Registration', 'Contact support to register your business:\n\nbusiness-support@accesslinklgbtq.app')}
        >
          <Text style={styles.contactButtonText}>Register Your Business</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const Header: React.FC<{ firstName: string }> = React.memo(({ firstName }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.greeting}>Welcome back, {firstName}!</Text>
        <Text style={styles.subtitle}>Business Dashboard</Text>
      </View>
    </View>
  );
});

const BusinessInfoCard: React.FC<{ role: string }> = React.memo(({ role }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.businessCard}>
      <View style={styles.businessHeader}>
        <View style={styles.businessIcon}>
          <Ionicons name="storefront" size={24} color={colors.primary} />
        </View>
        <View style={styles.businessInfo}>
          <Text style={styles.businessTitle}>Business Portal</Text>
          <Text style={styles.businessCategory}>Role: {role === 'bizowner' ? 'Business Owner' : 'Business Manager'}</Text>
          <Text style={styles.businessStatus}>✅ Access Granted</Text>
        </View>
      </View>
    </View>
  );
});

const StatsGrid: React.FC<{ stats: any[]; loading: boolean; error: string | null }> = React.memo(({ stats, loading, error }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);

  if (loading) {
    return (
      <View style={styles.statsGrid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statIcon}>
              <ActivityIndicator size="small" color={colors.textSecondary} />
            </View>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statTitle}>Loading...</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </>
  );
});

const QuickActionsList: React.FC<{ actions: any[] }> = React.memo(({ actions }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <>
      {actions.map((action, index) => (
        <TouchableOpacity key={index} style={styles.actionCard} onPress={action.onPress}>
          <View style={styles.actionIconContainer}>
            <Ionicons name={action.icon as any} size={20} color={colors.primary} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      ))}
    </>
  );
});

// --- Main Component ---

export const BusinessHomeScreen: React.FC<BusinessHomeScreenProps> = ({ navigation }) => {
  const { userProfile, firstName, isBizUser, businessLoading, businessError, businessStats: realBusinessStats } = useBusinessHome();
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);

  if (!userProfile) return <LoadingState />;
  if (!isBizUser) return <AccessDeniedState />;

  const businessStats = [
    { icon: 'business', title: 'Businesses', value: realBusinessStats.totalBusinesses.toString(), color: '#3b82f6' },
    { icon: 'star', title: 'Rating', value: realBusinessStats.averageRating.toFixed(1), color: '#f59e0b' },
    { icon: 'chatbubble-ellipses', title: 'Reviews', value: realBusinessStats.totalReviews.toString(), color: '#10b981' },
    { icon: 'eye', title: 'Views', value: realBusinessStats.totalViews.toString(), color: '#8b5cf6' },
  ];

  const quickActions = [
    { icon: 'business', title: 'My Businesses', subtitle: 'View all your businesses', onPress: () => navigation.navigate('BusinessProfilesList') },
    { icon: 'camera', title: 'Media Gallery', subtitle: 'Manage photos and videos', onPress: () => navigation.navigate('MediaGallery') },
    { icon: 'calendar', title: 'Manage Events', subtitle: 'Create and update events', onPress: () => navigation.navigate('EventsManagement') },
    { icon: 'pricetag', title: 'Manage Services', subtitle: 'Update your offerings', onPress: () => navigation.navigate('ServicesManagement') },
  ];

  return (
    <ScrollView style={styles.container}>
      <Header firstName={firstName} />
      <BusinessInfoCard role={userProfile.role} />

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Business Performance</Text>
        <StatsGrid stats={businessStats} loading={businessLoading} error={businessError} />
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <QuickActionsList actions={quickActions} />
      </View>
    </ScrollView>
  );
};

const localStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { fontSize: 18, fontWeight: '600', marginTop: 16, color: colors.text },
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24, backgroundColor: colors.primary },
  headerContent: { alignItems: 'center' },
  greeting: { fontSize: 22, fontWeight: 'bold', color: colors.headerText, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.headerText + 'b3' },
  businessCard: {
    marginHorizontal: 20,
    marginTop: -15,
    borderRadius: 12,
    padding: 20,
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessHeader: { flexDirection: 'row', alignItems: 'center' },
  businessIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: colors.primary + '20',
  },
  businessInfo: { flex: 1 },
  businessTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: colors.text },
  businessCategory: { fontSize: 14, marginBottom: 4, color: colors.textSecondary },
  businessStatus: { fontSize: 12, color: colors.success, fontWeight: '600' },
  statsContainer: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: colors.text },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  statValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 4, color: colors.text },
  statTitle: { fontSize: 12, textAlign: 'center', color: colors.textSecondary },
  actionsContainer: { padding: 20, paddingTop: 0 },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: colors.primary + '20',
  },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2, color: colors.text },
  actionSubtitle: { fontSize: 14, color: colors.textSecondary },
  accessDeniedCard: {
    marginHorizontal: 20,
    marginTop: 60,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.notification,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  accessDeniedText: { fontSize: 16, marginBottom: 24, textAlign: 'center', lineHeight: 22, color: colors.textSecondary },
  contactButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, backgroundColor: colors.primary },
  contactButtonText: { color: colors.headerText, fontWeight: '600', fontSize: 16 },
  errorText: { color: colors.notification, textAlign: 'center', marginTop: 10 },
});

export default BusinessHomeScreen;
