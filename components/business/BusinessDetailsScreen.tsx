/**
 * Business Details Screen
 * Shows detailed information about a specific business
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useAuthActions } from '../../hooks/useAuth';
import { BusinessListing } from '../../services/businessService';

interface BusinessDetailsScreenProps {
  navigation: any;
  route: {
    params: {
      business: BusinessListing;
    };
  };
}

export default function BusinessDetailsScreen({ navigation, route }: BusinessDetailsScreenProps) {
  const { business } = route.params;
  const { userProfile } = useAuth();
  const { saveBusiness, unsaveBusiness } = useAuthActions();
  const [isSaved, setIsSaved] = useState(() => {
    const savedBusinesses = userProfile?.profile?.savedBusinesses || [];
    return savedBusinesses.includes(business.id);
  });

  const handleToggleSaved = async () => {
    if (!userProfile) {
      Alert.alert('Login Required', 'Please login to save businesses');
      return;
    }

    try {
      if (isSaved) {
        await unsaveBusiness(business.id);
        setIsSaved(false);
      } else {
        await saveBusiness(business.id);
        setIsSaved(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update saved businesses');
    }
  };

  const handleCall = () => {
    if (business.contact?.phone) {
      Linking.openURL(`tel:${business.contact.phone}`);
    }
  };

  const handleWebsite = () => {
    if (business.contact?.website) {
      Linking.openURL(business.contact.website);
    }
  };

  const handleDirections = () => {
    const address = `${business.location.address}, ${business.location.city}, ${business.location.state} ${business.location.zipCode}`;
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const handleWriteReview = () => {
    if (!userProfile) {
      Alert.alert('Login Required', 'Please login to write reviews');
      return;
    }
    navigation.navigate('CreateReview', { businessId: business.id, businessName: business.name });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? '#fbbf24' : '#d1d5db'}
        />
      );
    }
    return stars;
  };

  const getCategoryIcon = (category: string): any => {
    const icons: { [key: string]: any } = {
      restaurant: 'restaurant',
      healthcare: 'medical',
      legal: 'briefcase',
      retail: 'storefront',
      entertainment: 'game-controller',
      fitness: 'fitness',
      beauty: 'cut',
      education: 'school',
      nonprofit: 'heart',
      other: 'business'
    };
    return icons[category] || 'business';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleToggleSaved}
        >
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={24}
            color={isSaved ? '#ef4444' : '#374151'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Business Info */}
        <View style={styles.businessInfo}>
          <View style={styles.categoryBadge}>
            <Ionicons
              name={getCategoryIcon(business.category)}
              size={16}
              color="#6366f1"
            />
            <Text style={styles.categoryText}>
              {business.category.charAt(0).toUpperCase() + business.category.slice(1)}
            </Text>
          </View>
          
          <Text style={styles.businessName}>{business.name}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {renderStars((business as any).averageRating || 0)}
            </View>
            <Text style={styles.ratingText}>
              {((business as any).averageRating || 0).toFixed(1)} ({(business as any).reviewCount || 0} reviews)
            </Text>
          </View>

          <Text style={styles.businessDescription}>{business.description}</Text>
        </View>

        {/* Contact Actions */}
        <View style={styles.actionButtons}>
          {business.contact?.phone && (
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <Ionicons name="call" size={20} color="#6366f1" />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
          )}
          
          {business.contact?.website && (
            <TouchableOpacity style={styles.actionButton} onPress={handleWebsite}>
              <Ionicons name="globe" size={20} color="#6366f1" />
              <Text style={styles.actionButtonText}>Website</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
            <Ionicons name="navigate" size={20} color="#6366f1" />
            <Text style={styles.actionButtonText}>Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color="#6b7280" />
            <Text style={styles.infoText}>
              {business.location.address}, {business.location.city}, {business.location.state} {business.location.zipCode}
            </Text>
          </View>

          {business.contact?.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={16} color="#6b7280" />
              <Text style={styles.infoText}>{business.contact.phone}</Text>
            </View>
          )}

          {business.contact?.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={16} color="#6b7280" />
              <Text style={styles.infoText}>{business.contact.email}</Text>
            </View>
          )}

          {business.contact?.website && (
            <View style={styles.infoRow}>
              <Ionicons name="globe" size={16} color="#6b7280" />
              <Text style={styles.infoText}>{business.contact.website}</Text>
            </View>
          )}
        </View>

        {/* Hours */}
        {(business as any).hours && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Hours</Text>
            {Object.entries((business as any).hours).map(([day, hours]: [string, any]) => (
              <View key={day} style={styles.hoursRow}>
                <Text style={styles.dayText}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                <Text style={styles.hoursText}>
                  {hours.open && hours.close ? `${hours.open} - ${hours.close}` : 'Closed'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Accessibility Features */}
        {business.accessibilityFeatures && Object.values(business.accessibilityFeatures).some(Boolean) && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Accessibility Features</Text>
            <View style={styles.accessibilityGrid}>
              {Object.entries(business.accessibilityFeatures)
                .filter(([_, value]) => value)
                .map(([feature, _]) => (
                  <View key={feature} style={styles.accessibilityTag}>
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <Text style={styles.accessibilityText}>
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </Text>
                  </View>
                ))
              }
            </View>
          </View>
        )}

        {/* Write Review Button */}
        <TouchableOpacity style={styles.writeReviewButton} onPress={handleWriteReview}>
          <Ionicons name="create" size={20} color="#ffffff" />
          <Text style={styles.writeReviewText}>Write a Review</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: 5,
  },
  saveButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  businessInfo: {
    padding: 20,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6366f1',
    marginLeft: 4,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  businessDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366f1',
    marginLeft: 4,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#4b5563',
    marginLeft: 8,
    flex: 1,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dayText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  hoursText: {
    fontSize: 16,
    color: '#6b7280',
  },
  accessibilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accessibilityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accessibilityText: {
    fontSize: 12,
    color: '#065f46',
    marginLeft: 4,
    fontWeight: '500',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 15,
    borderRadius: 12,
  },
  writeReviewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
});
