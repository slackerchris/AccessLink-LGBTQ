/**
 * User Home Screen
 * Main dashboard for regular users
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useFirebaseAuth';
import { useBusinesses } from '../../hooks/useBusiness';
import { useTheme } from '../../hooks/useTheme';
import { BusinessListing } from '../../services/mockBusinessService';

interface UserHomeScreenProps {
  navigation: any;
}

export const UserHomeScreen: React.FC<UserHomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { colors, shadows } = useTheme();

  // Memoize the filters to prevent infinite re-renders
  const businessFilters = useMemo(() => ({}), []);
  const { businesses } = useBusinesses(businessFilters, 6); // Get first 6 businesses

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Directory', { searchQuery: searchQuery.trim() });
    } else {
      navigation.navigate('Directory');
    }
  };

  const firstName = user?.displayName?.split(' ')[0] || 'Friend';

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.greeting, { color: colors.headerText + 'CC' }]}>Welcome back,</Text>
            <Text style={[styles.userName, { color: colors.headerText }]}>{firstName}! 🏳️‍🌈</Text>
            <Text style={[styles.subtitle, { color: colors.headerText + 'CC' }]}>Find your community</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Find LGBTQ+ Friendly Businesses</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search for restaurants, cafes, services..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={[styles.searchButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation();
              handleSearch();
            }}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Featured Businesses */}
      <View style={styles.featuredContainer}>
        <View style={styles.featuredHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Businesses</Text>
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('Directory');
            }}
          >
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {businesses.slice(0, 3).map((business, index) => (
          <TouchableOpacity
            key={`business-${business.id || index}`}
            style={[styles.businessCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation();
              console.log('Business clicked:', business.name, 'Index:', index);
              navigation.navigate('Directory', { 
                screen: 'BusinessDetails', 
                params: { business } 
              });
            }}
            accessibilityRole="button"
            accessibilityLabel={`${business.name} business`}
            accessibilityHint={`View details for ${business.name}, a ${business.category} business with ${business.averageRating.toFixed(1)} star rating`}
          >
            <View style={styles.businessInfo}>
              <Text style={[styles.businessName, { color: colors.text }]}>{business.name}</Text>
              <Text style={[styles.businessCategory, { color: colors.primary }]}>{business.category}</Text>
              <Text style={[styles.businessDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                {business.description}
              </Text>
              <View style={styles.businessMeta}>
                <View style={styles.rating}>
                  <Ionicons name="star" size={16} color="#fbbf24" />
                  <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{business.averageRating.toFixed(1)}</Text>
                </View>
                <Text style={[styles.location, { color: colors.textSecondary }]}>{business.location.address}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60, // Safe area padding
    paddingBottom: 30, 
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 18, // Increased for better mobile readability
  },
  userName: {
    fontSize: 28, // Increased for better mobile impact
    fontWeight: 'bold',
    marginTop: 4,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16, // Increased for better mobile readability
    marginTop: 4,
  },
  profileButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24, // Larger for better touch target
    padding: 8, // Increased padding
    minWidth: 48, // Ensure good touch target
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    padding: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18, // Increased for better touch target
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    minHeight: 60, // Increased minimum height for better touch
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 12, // Increased spacing
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  searchButton: {
    paddingHorizontal: 22, // Increased for better touch
    paddingVertical: 10, // Increased for better touch
    borderRadius: 10, // Slightly more rounded
    marginLeft: 12, // Increased spacing
    minHeight: 44, // Ensure minimum touch target
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16, // Increased for better readability
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  featuredContainer: {
    padding: 20,
    paddingTop: 0,
    overflow: 'hidden',
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18, // Increased padding for better touch
    borderRadius: 16, // More rounded for modern feel
    marginBottom: 12, // Increased spacing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, // Slightly stronger shadow
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
    minHeight: 90, // Increased minimum height
    borderWidth: 1,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18, // Increased for better readability
    fontWeight: 'bold',
    marginBottom: 4, // Increased spacing
  },
  businessCategory: {
    fontSize: 14, // Increased for better readability
    fontWeight: '600',
    marginBottom: 6, // Increased spacing
  },
  businessDescription: {
    fontSize: 15, // Increased for better readability
    marginBottom: 10, // Increased spacing
    lineHeight: 22, // Better line height
  },
  businessMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  location: {
    fontSize: 12,
  },
  userBanner: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#7c3aed',
  },
  userBannerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  userBannerSubtext: {
    fontSize: 16,
    color: '#ddd6fe',
    textAlign: 'center',
    marginTop: 5,
  },
});
