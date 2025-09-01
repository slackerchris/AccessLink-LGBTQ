import React, { useMemo, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useManageBusinessList } from '../../hooks/useManageBusinessList';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import { BusinessListing } from '../../types/business';

interface ManageBusinessListScreenProps {
  navigation?: any;
}

const Header = memo(({ navigation, businessCount, isLoading, onAdd }: { navigation: any, businessCount: number, isLoading: boolean, onAdd: () => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>My Businesses</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.headerSubtitle}>{businessCount} business{businessCount !== 1 ? 'es' : ''}</Text>
            {isLoading && (
              <View style={styles.refreshIndicator}>
                <Text style={styles.refreshText}>•</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Ionicons name="add" size={24} color={colors.headerText} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const BusinessListItem = memo(({ business, onPress, getStatusColor, getStatusIcon }: { business: BusinessListing, onPress: (business: BusinessListing) => void, getStatusColor: (status: string) => string, getStatusIcon: (status: string) => string }) => {
  const { colors, shadows, createStyles } = useTheme();
  const styles = createStyles(localStyles);

  return (
    <TouchableOpacity
      style={[styles.businessCard, { ...shadows.card }]}
      onPress={() => onPress(business)}
    >
      <View style={styles.businessHeader}>
        <View style={styles.businessIconContainer}>
          <Ionicons name="storefront" size={24} color={colors.primary} />
        </View>
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>
            {business.name || 'Unnamed Business'}
          </Text>
          <Text style={styles.businessCategory}>
            {business.category || 'Category not set'}
          </Text>
          <Text style={styles.businessAddress}>
            {business.location ? [business.location.address, business.location.city, business.location.state].filter(Boolean).join(', ') || 'Address not set' : 'Address not set'}
          </Text>
        </View>
        <View style={styles.businessStatus}>
          <Ionicons name={getStatusIcon(business.status) as any} size={20} color={getStatusColor(business.status)} />
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={{ marginLeft: 8 }} />
        </View>
      </View>
      
      <View style={styles.businessFooter}>
        <View style={styles.businessStats}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.statText}>
              {business.averageRating?.toFixed(1) || '0.0'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-ellipses" size={14} color="#10b981" />
            <Text style={styles.statText}>
              {business.totalReviews || 0} reviews
            </Text>
          </View>
        </View>
        <View style={styles.rightFooter}>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(business.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(business.status) }]}>
              {business.status || 'unknown'}
            </Text>
          </View>
          <Text style={styles.tapHint}>Tap to edit</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const EmptyState = memo(({ onAdd }: { onAdd: () => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);

  return (
    <View style={styles.emptyState}>
      <Ionicons name="business-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Businesses Found</Text>
      <Text style={styles.emptyText}>
        You don't have any businesses registered yet.
      </Text>
      <TouchableOpacity style={styles.addBusinessButton} onPress={onAdd}>
        <Ionicons name="add" size={20} color={colors.card} style={styles.addButtonIcon} />
        <Text style={styles.addBusinessText}>Add Your First Business</Text>
      </TouchableOpacity>
    </View>
  );
});

export const ManageBusinessListScreen: React.FC<ManageBusinessListScreenProps> = ({ navigation }) => {
  const {
    businesses,
    businessesLoading,
    refreshBusinesses,
    handleBusinessPress,
    handleAddBusiness,
    getStatusColor,
    getStatusIcon,
  } = useManageBusinessList(navigation);
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);

  if (businessesLoading && businesses.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your businesses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        navigation={navigation} 
        businessCount={businesses.length}
        isLoading={businessesLoading}
        onAdd={handleAddBusiness}
      />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={businessesLoading} onRefresh={refreshBusinesses} />
        }
      >
        {businesses.length === 0 ? (
          <EmptyState onAdd={handleAddBusiness} />
        ) : (
          <View style={styles.businessList}>
            {businesses.map((business) => (
              <BusinessListItem
                key={business.id}
                business={business}
                onPress={handleBusinessPress}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const localStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    color: colors.text,
  },
  header: {
    backgroundColor: colors.header,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.headerText,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.primary,
    opacity: 0.8,
    marginTop: 2,
  },
  addButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: colors.text,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    color: colors.textSecondary,
  },
  addBusinessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonIcon: {
    marginRight: 8,
  },
  addBusinessText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  businessList: {
    padding: 20,
  },
  businessCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  businessIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.text,
  },
  businessCategory: {
    fontSize: 14,
    marginBottom: 2,
    color: colors.textSecondary,
  },
  businessAddress: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  businessStatus: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  businessStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshIndicator: {
    marginLeft: 8,
    opacity: 0.7,
  },
  refreshText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  rightFooter: {
    alignItems: 'flex-end',
  },
  tapHint: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
    opacity: 0.7,
    color: colors.textSecondary,
  },
});

export default ManageBusinessListScreen;
