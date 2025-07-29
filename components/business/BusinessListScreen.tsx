/**
 * Business List Screen Component
 * Displays list of approved businesses with search and filtering
 */

import React, { useState, useCallback, useEffect, useMemo, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBusinesses, useBusinessActions } from '../../hooks/useBusiness';
import { useAuth, useAuthActions } from '../../hooks/useAuth';
import { BusinessListing, BusinessCategory } from '../../services/mockBusinessService';

interface BusinessListScreenProps {
  initialCategory?: BusinessCategory;
  onNavigateToAddBusiness: () => void;
  onNavigateToBusinessDetails: (business: BusinessListing) => void;
}

const renderRating = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  for (let i = 0; i < fullStars; i++) {
    stars.push('⭐');
  }
  if (hasHalfStar) {
    stars.push('⭐');
  }
  while (stars.length < 5) {
    stars.push('☆');
  }
  
  return stars.join('');
};

const BusinessListItem = memo(({
  item,
  isSaved,
  onToggleSaved,
  onNavigateToDetails,
}: {
  item: BusinessListing;
  isSaved: boolean;
  onToggleSaved: (id: string) => void;
  onNavigateToDetails: (item: BusinessListing) => void;
}) => {
  return (
    <TouchableOpacity
      style={styles.businessCard}
      onPress={() => onNavigateToDetails(item)}
    >
      <View style={styles.businessHeader}>
        <View style={styles.businessTitleSection}>
          <Text style={styles.businessName}>{item.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={() => onToggleSaved(item.id)}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isSaved ? '#6366f1' : '#9ca3af'}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.businessDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.businessInfo}>
        <Text style={styles.locationText}>
          📍 {item.location.city}, {item.location.state}
        </Text>
        
        {item.averageRating > 0 && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>
              {renderRating(item.averageRating)} ({item.reviewCount || 0})
            </Text>
          </View>
        )}
      </View>

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {item.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{item.tags.length - 3} more</Text>
          )}
        </View>
      )}

      {item.featured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>⭐ Featured</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

export const BusinessListScreen: React.FC<BusinessListScreenProps> = ({
  initialCategory,
  onNavigateToAddBusiness,
  onNavigateToBusinessDetails
}) => {
  const { userProfile } = useAuth();
  const { saveBusiness, unsaveBusiness } = useAuthActions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | 'all'>(initialCategory || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { 
    businesses, 
    loading, 
    hasMore, 
    loadMore, 
    refresh,
    search,
    filterByCategory 
  } = useBusinesses();

  const categories: Array<{ key: BusinessCategory | 'all'; label: string; icon: string }> = [
    { key: 'all', label: 'All Categories', icon: '🏢' },
    { key: 'restaurant', label: 'Restaurants', icon: '🍽️' },
    { key: 'healthcare', label: 'Healthcare', icon: '🏥' },
    { key: 'legal', label: 'Legal Services', icon: '⚖️' },
    { key: 'retail', label: 'Retail', icon: '🛍️' },
    { key: 'entertainment', label: 'Entertainment', icon: '🎭' },
    { key: 'fitness', label: 'Fitness', icon: '💪' },
    { key: 'beauty', label: 'Beauty & Wellness', icon: '💅' },
    { key: 'education', label: 'Education', icon: '📚' },
    { key: 'nonprofit', label: 'Non-Profit', icon: '❤️' },
    { key: 'other', label: 'Other', icon: '📋' }
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleToggleSaved = useCallback(async (businessId: string) => {
    if (!userProfile) {
      Alert.alert('Login Required', 'Please login to save businesses');
      return;
    }

    const savedBusinesses = userProfile.profile?.savedBusinesses || [];
    const isSaved = savedBusinesses.includes(businessId);

    try {
      if (isSaved) {
        await unsaveBusiness(businessId);
      } else {
        await saveBusiness(businessId);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update saved businesses');
    }
  }, [userProfile, saveBusiness, unsaveBusiness]);

  const isBusinessSaved = useCallback((businessId: string): boolean => {
    const savedBusinesses = userProfile?.profile?.savedBusinesses || [];
    return savedBusinesses.includes(businessId);
  }, [userProfile]);

  const handleSearch = useCallback(async (query: string) => {
    if (query.trim().length > 0) {
      await search(query);
    } else {
      await refresh();
    }
  }, [search, refresh]);

  const handleCategoryFilter = useCallback(async (category: BusinessCategory | 'all') => {
    setSelectedCategory(category);
    if (category === 'all') {
      await refresh();
    } else {
      await filterByCategory(category);
    }
    setShowFilters(false);
  }, [filterByCategory, refresh]);

  // Handle initial category filtering
  useEffect(() => {
    if (initialCategory) {
      handleCategoryFilter(initialCategory);
    }
  }, [initialCategory, handleCategoryFilter]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  const renderBusinessItem = ({ item }: { item: BusinessListing }) => {
    return (
      <BusinessListItem
        item={item}
        isSaved={isBusinessSaved(item.id)}
        onToggleSaved={handleToggleSaved}
        onNavigateToDetails={onNavigateToBusinessDetails}
      />
    );
  };

  const renderCategoryFilter = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.key && styles.categoryButtonActive
      ]}
      onPress={() => handleCategoryFilter(item.key)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={[
        styles.categoryLabel,
        selectedCategory === item.key && styles.categoryLabelActive
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No businesses found' : 'No businesses yet'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery 
          ? `Try adjusting your search or filters`
          : 'Be the first to add a business to our community'
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.addFirstButton}
          onPress={onNavigateToAddBusiness}
        >
          <Text style={styles.addFirstButtonText}>+ Add First Business</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏢 Businesses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onNavigateToAddBusiness}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            handleSearch(text);
          }}
          returnKeyType="search"
          onSubmitEditing={() => handleSearch(searchQuery)}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterIcon}>🔧</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Pills */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories.slice(0, 4)}
          renderItem={renderCategoryFilter}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Business List */}
      <FlatList
        data={businesses}
        renderItem={renderBusinessItem}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.filterModal}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filter by Category</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={categories}
            renderItem={renderCategoryFilter}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.filterList}
          />
        </View>
      </Modal>

      {loading && businesses.length === 0 && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading businesses...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#6c5ce7',
  },
  title: {
    fontSize: 30, // Increased for better mobile impact
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20, // Increased for better touch
    paddingVertical: 12, // Increased for better touch
    borderRadius: 22, // Slightly more rounded
    minHeight: 44, // Ensure minimum touch target
  },
  addButtonText: {
    color: 'white',
    fontSize: 17, // Increased for better readability
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 20, // Increased for better mobile spacing
    paddingBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20, // Increased padding
    paddingVertical: 16, // Increased for better touch target
    borderRadius: 25,
    fontSize: 17, // Increased for better mobile readability
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 56, // Ensure good touch target
  },
  filterButton: {
    backgroundColor: 'white',
    width: 56, // Increased for better touch target
    height: 56, // Increased for better touch target
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16, // Increased spacing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterIcon: {
    fontSize: 20,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryList: {
    paddingRight: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: '#6c5ce7',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
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
    fontSize: 19, // Increased for better mobile readability
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
    lineHeight: 24, // Better line height
  },
  categoryBadge: {
    backgroundColor: '#f0f0ff',
    paddingHorizontal: 10, // Increased padding
    paddingVertical: 6, // Increased padding
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 13, // Increased for better readability
    color: '#6c5ce7',
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  businessDescription: {
    fontSize: 15, // Increased for better mobile readability
    color: '#666',
    marginBottom: 12,
    lineHeight: 22, // Better line height
  },
  businessInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#888',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#4caf50',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ffd700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  addFirstButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  filterModal: {
    flex: 1,
    backgroundColor: 'white',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  filterList: {
    padding: 20,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  businessTitleSection: {
    flex: 1,
  },
  bookmarkButton: {
    padding: 8,
    marginLeft: 8,
  },
});
