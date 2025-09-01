import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBusinessProfilesList } from '../../hooks/useBusinessProfilesList';
import { useNavigation } from '@react-navigation/native';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import { BusinessListing } from '../../types/business';

// --- Helper Functions ---

const getStatusStyle = (colors: ThemeColors, status?: 'pending' | 'approved' | 'rejected' | 'suspended') => {
  switch (status) {
    case 'approved': return { backgroundColor: colors.success, text: colors.headerText };
    case 'pending': return { backgroundColor: colors.warning, text: colors.headerText };
    case 'rejected': return { backgroundColor: colors.notification, text: colors.headerText };
    case 'suspended': return { backgroundColor: colors.textSecondary, text: colors.headerText };
    default: return { backgroundColor: colors.surface, text: colors.textSecondary };
  }
};

const getStatusText = (status?: 'pending' | 'approved' | 'rejected' | 'suspended') => {
  switch (status) {
    case 'approved': return 'Active';
    case 'pending': return 'Pending Review';
    case 'rejected': return 'Rejected';
    case 'suspended': return 'Suspended';
    default: return 'Unknown';
  }
};

// --- Memoized Sub-components ---

const Header: React.FC<{ onAdd: () => void }> = React.memo(({ onAdd }) => {
  const navigation = useNavigation();
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.headerText} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Business Profiles</Text>
      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Ionicons name="add" size={24} color={colors.headerText} />
      </TouchableOpacity>
    </View>
  );
});

const LoadingState: React.FC = React.memo(() => {
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.centeredContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading your businesses...</Text>
    </View>
  );
});

const EmptyState: React.FC<{ onAdd: () => void }> = React.memo(({ onAdd }) => {
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.centeredContainer}>
      <Ionicons name="business-outline" size={64} color={styles.emptyTitle.color} />
      <Text style={styles.emptyTitle}>No Businesses Found</Text>
      <Text style={styles.emptySubtitle}>Get started by adding your first business!</Text>
      <TouchableOpacity style={styles.addBusinessButton} onPress={onAdd}>
        <Ionicons name="add-circle" size={20} color={colors.headerText} />
        <Text style={styles.addBusinessButtonText}>Add Your First Business</Text>
      </TouchableOpacity>
    </View>
  );
});

const BusinessCard: React.FC<{ business: BusinessListing; onEdit: (business: BusinessListing) => void }> = React.memo(({ business, onEdit }) => {
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);
  const statusStyle = getStatusStyle(colors, business.status);

  return (
    <TouchableOpacity style={styles.businessCard} onPress={() => onEdit(business)}>
      <View style={styles.businessInfo}>
        <View style={styles.businessHeader}>
          <Text style={styles.businessName}>{business.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{getStatusText(business.status)}</Text>
          </View>
        </View>
        <Text style={styles.businessCategory}>{business.category}</Text>
        <Text style={styles.businessAddress}>{`${business.location.address}, ${business.location.city}`}</Text>
        <Text style={styles.businessDescription} numberOfLines={2}>{business.description}</Text>
        <View style={styles.businessMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <Text style={styles.metaText}>{`${business.averageRating?.toFixed(1) || '0.0'} (${business.totalReviews || 0} reviews)`}</Text>
          </View>
          {business.lgbtqFriendly?.verified && (
            <View style={styles.metaItem}>
              <Ionicons name="heart" size={16} color={colors.primary} />
              <Text style={styles.metaText}>LGBTQ+ Verified</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );
});

const AddAnotherButton: React.FC<{ onAdd: () => void }> = React.memo(({ onAdd }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <TouchableOpacity style={styles.addAnotherButton} onPress={onAdd}>
      <Ionicons name="add-circle-outline" size={24} color={styles.addAnotherButtonText.color} />
      <Text style={styles.addAnotherButtonText}>Add Another Business</Text>
    </TouchableOpacity>
  );
});

// --- Main Component ---

export default function BusinessProfilesListScreen() {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const { businesses, loading, handleRefresh, handleEditBusiness, handleAddBusiness } = useBusinessProfilesList();

  const renderContent = () => {
    if (loading && businesses.length === 0) return <LoadingState />;
    if (businesses.length === 0) return <EmptyState onAdd={handleAddBusiness} />;

    return (
      <>
        <Text style={styles.sectionTitle}>Your Businesses ({businesses.length})</Text>
        {businesses.map((business) => (
          <BusinessCard key={business.id} business={business} onEdit={handleEditBusiness} />
        ))}
        <AddAnotherButton onAdd={handleAddBusiness} />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onAdd={handleAddBusiness} />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = (colors: any, shadows: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 45,
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.headerText },
  addButton: { padding: 5 },
  content: { flex: 1, padding: 20 },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  loadingText: { marginTop: 16, fontSize: 16, color: colors.textSecondary },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 12, textAlign: 'center' },
  emptySubtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  addBusinessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    ...shadows.medium,
  },
  addBusinessButtonText: { color: colors.headerText, fontSize: 16, fontWeight: '600', marginLeft: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 20 },
  businessCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
  businessInfo: { flex: 1, marginRight: 12 },
  businessHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  businessName: { fontSize: 18, fontWeight: '600', color: colors.text, flex: 1, marginRight: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  businessCategory: { fontSize: 14, color: colors.primary, fontWeight: '500', marginBottom: 4 },
  businessAddress: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
  businessDescription: { fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: 12 },
  businessMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 14, color: colors.textSecondary, marginLeft: 4 },
  addAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addAnotherButtonText: { color: colors.primary, fontSize: 16, fontWeight: '600', marginLeft: 8 },
});
