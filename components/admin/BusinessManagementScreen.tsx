/**
 * Business Management Screen
 * Admin interface for managing all businesses in the platform
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  RefreshControl,
  SafeAreaView,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBusinesses, useBusinessActions } from '../../hooks/useBusiness';
import { useTheme } from '../../hooks/useTheme';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { BusinessListing } from '../../types/business';

// Navigation Prop Type
type BusinessManagementScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'BusinessManagement'
>;

// Prop Interfaces
interface BusinessManagementScreenProps {
  navigation: BusinessManagementScreenNavigationProp;
}

type FilterStatus = 'all' | 'approved' | 'pending' | 'featured';

// Memoized Sub-components
const Header: React.FC<{
  onBack: () => void;
  onAdd: () => void;
}> = React.memo(({ onBack, onAdd }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Business Management</Text>
      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
});

const SearchBar: React.FC<{
  query: string;
  onQueryChange: (text: string) => void;
}> = React.memo(({ query, onQueryChange }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses..."
          value={query}
          onChangeText={onQueryChange}
        />
      </View>
    </View>
  );
});

const FilterTabs: React.FC<{
  activeFilter: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
  counts: Record<FilterStatus, number>;
}> = React.memo(({ activeFilter, onFilterChange, counts }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const renderFilterButton = (
    status: FilterStatus,
    label: string,
    count: number
  ) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === status && styles.filterButtonActive,
      ]}
      onPress={() => onFilterChange(status)}
    >
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === status && styles.filterButtonTextActive,
        ]}
      >
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {renderFilterButton('all', 'All', counts.all)}
        {renderFilterButton('pending', 'Pending', counts.pending)}
        {renderFilterButton('approved', 'Approved', counts.approved)}
        {renderFilterButton('featured', 'Featured', counts.featured)}
      </ScrollView>
    </View>
  );
});

const BusinessListItem: React.FC<{
  business: BusinessListing;
  onPress: () => void;
}> = React.memo(({ business, onPress }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const getStatusColor = (approved: boolean, featured: boolean) => {
    if (featured) return colors.warning;
    if (approved) return colors.success;
    return colors.notification;
  };

  const getStatusText = (approved: boolean, featured: boolean) => {
    if (featured) return 'Featured';
    if (approved) return 'Approved';
    return 'Pending';
  };

  return (
    <TouchableOpacity style={styles.businessCard} onPress={onPress}>
      <View style={styles.businessHeader}>
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>{business.name}</Text>
          <Text style={styles.businessLocation}>
            {business.location.city}, {business.location.state}
          </Text>
          <Text style={styles.businessCategory}>
            {business.category.charAt(0).toUpperCase() +
              business.category.slice(1)}
          </Text>
        </View>
        <View style={styles.businessStatus}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusColor(
                  business.status === 'approved',
                  business.featured
                ),
              },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(
                business.status === 'approved',
                business.featured
              )}
            </Text>
          </View>
          <Text style={styles.businessRating}>
            ⭐ {business.averageRating.toFixed(1)} ({business.totalReviews})
          </Text>
        </View>
      </View>
      <Text style={styles.businessDescription} numberOfLines={2}>
        {business.description}
      </Text>
      <View style={styles.businessFooter}>
        <Text style={styles.businessDate}>
          Created:{' '}
          {business.createdAt instanceof Date
            ? business.createdAt.toLocaleDateString()
            : 'N/A'}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );
});

// Main Component
export default function BusinessManagementScreen({
  navigation,
}: BusinessManagementScreenProps) {
  const {
    businesses,
    loading,
    refresh: refreshBusinesses,
  } = useBusinesses({}, 1000);
  const { approveBusiness, rejectBusiness, loading: actionLoading } =
    useBusinessActions();
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);

  const [filteredBusinesses, setFilteredBusinesses] = useState<
    BusinessListing[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedBusiness, setSelectedBusiness] =
    useState<BusinessListing | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  useEffect(() => {
    filterBusinesses();
  }, [businesses, searchQuery, filterStatus]);

  const handleRefresh = async () => {
    await refreshBusinesses();
  };

  const filterBusinesses = useCallback(() => {
    let filtered = [...businesses];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((business) => {
        switch (filterStatus) {
          case 'approved':
            return business.status === 'approved';
          case 'pending':
            return business.status === 'pending';
          case 'featured':
            return business.featured;
          default:
            return true;
        }
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (business) =>
          business.name.toLowerCase().includes(query) ||
          business.description.toLowerCase().includes(query) ||
          business.location.city.toLowerCase().includes(query)
      );
    }

    setFilteredBusinesses(filtered);
  }, [businesses, searchQuery, filterStatus]);

  const handleBusinessAction = (business: BusinessListing) => {
    setSelectedBusiness(business);
    setActionModalVisible(true);
  };

  const handleApproveBusiness = async (businessId: string) => {
    try {
      await approveBusiness(businessId);
      await refreshBusinesses();
      setActionModalVisible(false);
      Alert.alert('Success', 'Business approved successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      Alert.alert('Error', message);
    }
  };

  const handleRejectBusiness = async (businessId: string) => {
    Alert.alert(
      'Reject Business',
      'Are you sure you want to reject this business? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectBusiness(businessId);
              await refreshBusinesses();
              setActionModalVisible(false);
              Alert.alert('Success', 'Business rejected');
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : 'An unknown error occurred.';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  const filterCounts = {
    all: businesses.length,
    approved: businesses.filter((b) => b.status === 'approved').length,
    pending: businesses.filter((b) => b.status === 'pending').length,
    featured: businesses.filter((b) => b.featured).length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        onBack={() => navigation.goBack()}
        onAdd={() => navigation.navigate('AddBusiness')}
      />
      <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />
      <FilterTabs
        activeFilter={filterStatus}
        onFilterChange={setFilterStatus}
        counts={filterCounts}
      />
      <ScrollView
        style={styles.businessList}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading && filteredBusinesses.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading businesses...</Text>
          </View>
        ) : filteredBusinesses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No businesses found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? 'Try adjusting your search'
                : 'Businesses will appear here'}
            </Text>
          </View>
        ) : (
          filteredBusinesses.map((business) => (
            <BusinessListItem
              key={business.id}
              business={business}
              onPress={() => handleBusinessAction(business)}
            />
          ))
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
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
    backButton: {
      padding: 5,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.headerText,
    },
    addButton: {
      padding: 5,
    },
    searchContainer: {
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 16,
      color: colors.text,
    },
    filtersContainer: {
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginRight: 8,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterButtonText: {
      fontSize: 14,
      color: colors.text,
    },
    filterButtonTextActive: {
      color: colors.headerText,
    },
    businessList: {
      flex: 1,
    },
    businessCard: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    businessHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    businessInfo: {
      flex: 1,
    },
    businessName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    businessLocation: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    businessCategory: {
      fontSize: 12,
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
    businessStatus: {
      alignItems: 'flex-end',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 4,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#ffffff',
    },
    businessRating: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    businessDescription: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      marginBottom: 8,
    },
    businessFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    businessDate: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    bottomSpacer: {
      height: 32,
    },
  });
