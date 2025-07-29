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
import { BusinessListing } from '../../services/mockBusinessService';

interface UserHomeScreenProps {
  navigation: any;
}

export const UserHomeScreen: React.FC<UserHomeScreenProps> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const { businesses } = useBusinesses({}, 6); // Get first 6 businesses
  const [searchQuery, setSearchQuery] = useState('');

  // Debug business data
  console.log('Businesses data:', businesses.map((b, i) => ({ index: i, name: b.name, id: b.id })));

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Directory', { searchQuery: searchQuery.trim() });
    } else {
      navigation.navigate('Directory');
    }
  };

  const firstName = userProfile?.profile?.firstName || userProfile?.displayName?.split(' ')[0] || 'Friend';

  return (
    <ScrollView 
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
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
          <Text style={styles.sectionTitle}>Featured Businesses</Text>
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('Directory');
            }}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {businesses.slice(0, 3).map((business, index) => (
          <TouchableOpacity
            key={`business-${business.id || index}`}
            style={styles.businessCard}
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation();
              console.log('Business clicked:', business.name, 'Index:', index);
              navigation.navigate('Directory', { 
                screen: 'BusinessDetails', 
                params: { business } 
              });
            }}
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
    color: '#e0e7ff',
    fontSize: 18, // Increased for better mobile readability
  },
  userName: {
    color: '#fff',
    fontSize: 28, // Increased for better mobile impact
    fontWeight: 'bold',
    marginTop: 4,
    lineHeight: 34,
  },
  subtitle: {
    color: '#c7d2fe',
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
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18, // Increased for better touch target
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    minHeight: 60, // Increased minimum height for better touch
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
    color: '#1f2937',
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
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  businessCard: {
    backgroundColor: '#fff',
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
    borderColor: '#e5e7eb',
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18, // Increased for better readability
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4, // Increased spacing
  },
  businessCategory: {
    fontSize: 14, // Increased for better readability
    color: '#6366f1',
    fontWeight: '600',
    marginBottom: 6, // Increased spacing
  },
  businessDescription: {
    fontSize: 15, // Increased for better readability
    color: '#6b7280',
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
