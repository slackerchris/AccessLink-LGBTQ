/**
 * User Home Screen
 * Main dashboard for regular users
 */

import React, { useState } from 'react';
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
import { useAuth } from '../../hooks/useAuth';
import { useBusinesses } from '../../hooks/useBusiness';

interface UserHomeScreenProps {
  navigation: any;
}

export const UserHomeScreen: React.FC<UserHomeScreenProps> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const { businesses } = useBusinesses({}, 6); // Get first 6 businesses
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Directory', { searchQuery: searchQuery.trim() });
    } else {
      navigation.navigate('Directory');
    }
  };

  const categories = [
    { icon: 'restaurant', name: 'Dining', color: '#f59e0b' },
    { icon: 'fitness', name: 'Fitness', color: '#10b981' },
    { icon: 'medical', name: 'Healthcare', color: '#ef4444' },
    { icon: 'cut', name: 'Beauty & Spa', color: '#8b5cf6' },
    { icon: 'storefront', name: 'Shopping', color: '#06b6d4' },
    { icon: 'library', name: 'Education', color: '#f97316' },
    { icon: 'cafe', name: 'Cafes', color: '#84cc16' },
    { icon: 'car-sport', name: 'Services', color: '#64748b' },
  ];

  const firstName = userProfile?.profile?.firstName || userProfile?.displayName?.split(' ')[0] || 'Friend';

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{firstName}! 🏳️‍🌈</Text>
            <Text style={styles.subtitle}>Find your community</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.sectionTitle}>Find LGBTQ+ Friendly Businesses</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for restaurants, cafes, services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories Section - Horizontal Scroll */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Browse by Category</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalCategoriesContainer}
        >
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={styles.horizontalCategoryCard}
              onPress={() => navigation.navigate('Directory')}
            >
              <View style={[styles.horizontalCategoryIcon, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon as any} size={24} color="#fff" />
              </View>
              <Text style={styles.horizontalCategoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Businesses */}
      <View style={styles.featuredContainer}>
        <View style={styles.featuredHeader}>
          <Text style={styles.sectionTitle}>Featured Businesses</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Businesses')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {businesses.slice(0, 3).map((business, index) => (
          <TouchableOpacity
            key={business.id}
            style={styles.businessCard}
            onPress={() => Alert.alert(business.name, business.description)}
          >
            <View style={styles.businessInfo}>
              <Text style={styles.businessName}>{business.name}</Text>
              <Text style={styles.businessCategory}>{business.category}</Text>
              <Text style={styles.businessDescription} numberOfLines={2}>
                {business.description}
              </Text>
              <View style={styles.businessMeta}>
                <View style={styles.rating}>
                  <Ionicons name="star" size={16} color="#fbbf24" />
                  <Text style={styles.ratingText}>{business.averageRating.toFixed(1)}</Text>
                </View>
                <Text style={styles.location}>{business.location.address}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
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
    paddingTop: 60, // Increased for safe area
    paddingBottom: 30, // Increased spacing
    paddingHorizontal: 24, // Better mobile margins
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: '#e0e7ff',
    fontSize: 16, // Larger for mobile
  },
  userName: {
    color: '#fff',
    fontSize: 26, // Larger for mobile
    fontWeight: 'bold',
    marginTop: 4, // Increased spacing
    lineHeight: 32,
  },
  subtitle: {
    color: '#c7d2fe',
    fontSize: 14, // Larger for mobile
    marginTop: 4, // Increased spacing
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
    padding: 24, // Better mobile margins
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16, // More rounded for modern feel
    paddingHorizontal: 20, // Increased padding
    paddingVertical: 16, // Larger touch target
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, // Stronger shadow
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    minHeight: 56, // Ensure good touch target
  },
  searchIcon: {
    marginRight: 12, // Increased spacing
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 0,
  },
  searchButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    padding: 20,
    paddingTop: 0,
  },
  horizontalCategoriesContainer: {
    paddingHorizontal: 20,
  },
  horizontalCategoryCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  horizontalCategoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  horizontalCategoryName: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  featuredContainer: {
    padding: 20,
    paddingTop: 0,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  businessCard: {
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
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  businessCategory: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
    marginBottom: 5,
  },
  businessDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
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
    color: '#1f2937',
    marginLeft: 4,
  },
  location: {
    fontSize: 12,
    color: '#6b7280',
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
