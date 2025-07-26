/**
 * User Home Screen
 * Main dashboard for regular users
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useAuthActions } from '../../hooks/useAuth';
import { useBusinesses } from '../../hooks/useBusiness';

interface UserHomeScreenProps {
  navigation: any;
}

export const UserHomeScreen: React.FC<UserHomeScreenProps> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const { signOut } = useAuthActions();
  const { businesses } = useBusinesses({}, 6); // Get first 6 businesses

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Sign Out Error', error.message);
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

  const quickActions = [
    {
      icon: 'search',
      title: 'Find Businesses',
      subtitle: 'Discover LGBTQ+ friendly places',
      color: '#6366f1',
      onPress: () => navigation.navigate('Businesses')
    },
    {
      icon: 'heart',
      title: 'Saved Places',
      subtitle: 'Your favorite businesses',
      color: '#ec4899',
      onPress: () => Alert.alert('Saved Places', 'Feature coming soon!')
    },
    {
      icon: 'star',
      title: 'Write Review',
      subtitle: 'Share your experience',
      color: '#fbbf24',
      onPress: () => Alert.alert('Reviews', 'Feature coming soon!')
    },
    {
      icon: 'calendar',
      title: 'Events',
      subtitle: 'Community events near you',
      color: '#10b981',
      onPress: () => Alert.alert('Events', 'Feature coming soon!')
    }
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
          <TouchableOpacity onPress={handleSignOut} style={styles.profileButton}>
            <Ionicons name="person-circle" size={40} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>What would you like to do?</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={action.onPress}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon as any} size={24} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
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

      {/* Community Section */}
      <View style={styles.communityContainer}>
        <Text style={styles.sectionTitle}>Community</Text>
        <View style={styles.communityCard}>
          <Ionicons name="people" size={32} color="#6366f1" />
          <Text style={styles.communityTitle}>Join the Conversation</Text>
          <Text style={styles.communityText}>
            Connect with other community members and share your experiences
          </Text>
          <TouchableOpacity 
            style={styles.communityButton}
            onPress={() => Alert.alert('Community', 'Feature coming soon!')}
          >
            <Text style={styles.communityButtonText}>Coming Soon</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories Section - Bottom */}
      <View style={styles.bottomCategoriesContainer}>
        <Text style={styles.sectionTitle}>Browse by Category</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={styles.bottomCategoryCard}
              onPress={() => navigation.navigate('Directory')}
            >
              <View style={[styles.bottomCategoryIcon, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon as any} size={20} color="#fff" />
              </View>
              <Text style={styles.bottomCategoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    color: '#e0e7ff',
    fontSize: 16,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  subtitle: {
    color: '#c7d2fe',
    fontSize: 14,
    marginTop: 5,
  },
  profileButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 5,
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 5,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
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
  communityContainer: {
    padding: 20,
    paddingTop: 0,
  },
  communityCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  communityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 10,
    marginBottom: 10,
  },
  communityText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 15,
  },
  communityButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  communityButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  bottomCategoriesContainer: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bottomCategoryCard: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
  },
  bottomCategoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  bottomCategoryName: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
});
