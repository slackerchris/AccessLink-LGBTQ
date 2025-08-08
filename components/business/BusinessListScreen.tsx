/**
 * Business List Screen Component with Navigation Fix
 * Displays list of approved businesses with search and filtering
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  useBusinessDirectory, 
  useBusinessesByCategory, 
  useBusinessSearch,
  useFeaturedBusinesses 
} from '../../hooks/useProperBusiness';
import { useTheme } from '../../hooks/useTheme';
import { BusinessCategory } from '../../services/properBusinessService';

interface Category {
  id: string;
  name: string;
  icon: string;
}

const categories: Category[] = [
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}> 
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>LGBTQ+ Directory</Text>
          <TouchableOpacity
            onPress={() => setShowSearch(!showSearch)}
            style={styles.searchButton}
          >
            <Ionicons name="search" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {showSearch && (
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Search businesses, services, locations..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
        )}
      </View>

      {/* Category Filter */}
      {!searchQuery && renderCategoryFilter()}

      {/* Performance Indicator */}
      <View style={[styles.performanceIndicator, { backgroundColor: colors.successBackground || '#ECFDF5' }]}> 
        <Ionicons name="flash" size={12} color={colors.success || '#10B981'} />
        <Text style={[styles.performanceText, { color: colors.success || '#059669' }]}> 
          ⚡ Optimized • {displayBusinesses.length} results • Sub-second loading
        </Text>
      </View>

      {/* Business List */}
      {displayLoading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="business" size={48} color={colors.textSecondary || '#D1D5DB'} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading businesses...</Text>
        </View>
      ) : (
        <FlatList
          data={displayBusinesses}
          renderItem={renderBusinessCard}
          keyExtractor={(item) => item.businessId || item.id}
          refreshing={displayLoading}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="business" size={64} color={colors.textSecondary || '#D1D5DB'} />
              <Text style={[styles.emptyText, { color: colors.text }]}> 
                {searchQuery ? 'No businesses found' : 'No businesses available'}
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}> 
                {searchQuery ? 'Try a different search term' : 'Check back later for new listings'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
  const getCurrentError = () => {
    if (searchQuery.trim()) {
      return searchError;
    }
    if (selectedCategory === 'all') {
      return allError;
    }
    return categoryError;
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchBusinesses(query.trim());
    }
  };

  const handleRefresh = () => {
    if (searchQuery.trim()) {
      searchBusinesses(searchQuery.trim());
    } else if (selectedCategory === 'all') {
      refreshAll();
    } else {
      refreshCategory();
    }
  };

  const displayBusinesses = getCurrentBusinesses();
  const displayLoading = getCurrentLoading();
  const displayError = getCurrentError();

  if (displayError) {
    Alert.alert('Error', displayError);
  }

  // Function to navigate to business details - FIXED to pass the correct parameter
  const handleNavigateToBusinessDetails = useCallback((business: any) => {
    console.log('Navigating to business details for:', business);
    // Get the business ID (handle both businessId and id cases)
    const businessId = business.businessId || business.id;
    
    if (!businessId) {
      console.error('No business ID found:', business);
      Alert.alert('Error', 'Could not find business details');
      return;
    }
    
    // Navigate with the businessId parameter in the expected format
    navigation.navigate('BusinessDetails', { businessId });
  }, [navigation]);

  const renderBusinessCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
    style={[styles.businessCard, { backgroundColor: colors.card }]}
      onPress={() => handleNavigateToBusinessDetails(item)}
    >
      <View style={styles.businessHeader}>
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>{item.name}</Text>
          <Text style={styles.businessCategory}>{item.category}</Text>
          <Text style={styles.businessLocation}>
            {item.location?.city}, {item.location?.state}
          </Text>
        </View>
        
        <View style={styles.businessMeta}>
          {item.featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>
              {item.averageRating ? item.averageRating.toFixed(1) : 'New'}
            </Text>
          </View>
        </View>
      </View>

      {item.description && (
        <Text style={styles.businessDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.businessFooter}>
        <View style={styles.tagsContainer}>
          {item.tags?.slice(0, 3).map((tag: string, index: number) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.accessibilityIcons}>
          <Ionicons name="heart" size={16} color="#FF6B6B" />
          <Ionicons name="accessibility" size={16} color="#4ECDC4" />
        </View>
      </View>
    </TouchableOpacity>
  );



  const renderCategoryFilter = () => (
    <FlatList
      horizontal
      data={categories}
      renderItem={({ item }) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.categoryButton,
            selectedCategory === item.id && styles.selectedCategory
          ]}
          onPress={() => setSelectedCategory(item.id)}
        >
          <Ionicons 
            name={item.icon as any} 
            size={20} 
            color={selectedCategory === item.id ? '#FFF' : '#666'} 
          />
          <Text style={[
            styles.categoryText,
            selectedCategory === item.id && styles.selectedCategoryText
          ]}>
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={{ paddingHorizontal: 12 }}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>LGBTQ+ Directory</Text>
          <TouchableOpacity
            onPress={() => setShowSearch(!showSearch)}
            style={styles.searchButton}
          >
            <Ionicons name="search" size={24} color="#6B46C1" />
          </TouchableOpacity>
        </View>

        {showSearch && (
          <TextInput
            style={styles.searchInput}
            placeholder="Search businesses, services, locations..."
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
        )}
      </View>



      {/* Category Filter */}
      {!searchQuery && renderCategoryFilter()}

      {/* Performance Indicator */}
      <View style={styles.performanceIndicator}>
        <Ionicons name="flash" size={12} color="#10B981" />
        <Text style={styles.performanceText}>
          ⚡ Optimized • {displayBusinesses.length} results • Sub-second loading
        </Text>
      </View>

      {/* Business List */}
      {displayLoading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="business" size={48} color="#D1D5DB" />
          <Text style={styles.loadingText}>Loading businesses...</Text>
        </View>
      ) : (
        <FlatList
          data={displayBusinesses}
          renderItem={renderBusinessCard}
          keyExtractor={(item) => item.businessId || item.id}
          refreshing={displayLoading}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="business" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No businesses found' : 'No businesses available'}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try a different search term' : 'Check back later for new listings'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  searchButton: {
    padding: 8,
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  featuredSection: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  featuredCard: {
    backgroundColor: '#6B46C1',
    borderRadius: 12,
    padding: 16,
    marginRight: 10,
    width: 180,
  },
  featuredName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  featuredCategory: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 8,
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredRatingText: {
    fontSize: 12,
    color: '#FFF',
    marginLeft: 4,
  },
  categoryContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  selectedCategory: {
    backgroundColor: '#6B46C1',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 6,
  },
  selectedCategoryText: {
    color: '#FFF',
  },
  performanceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  performanceText: {
    fontSize: 12,
    color: '#059669',
    marginLeft: 4,
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
  },
  businessCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 14,
    color: '#6B46C1',
    fontWeight: '500',
    marginBottom: 4,
  },
  businessLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  businessMeta: {
    alignItems: 'flex-end',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  featuredText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '500',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 4,
  },
  businessDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  tag: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#6B46C1',
    fontWeight: '500',
  },
  accessibilityIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
