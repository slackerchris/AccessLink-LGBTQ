/**
 * Business Details Screen (Fixed)
 * Shows detailed information about a specific business
 */

import React, { useState, memo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Linking,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useFirebaseAuth';
import { useTheme } from '../../hooks/useTheme';
import { useBusinessDetails } from '../../hooks/useProperBusiness';
import { BusinessListing as BaseListing } from '../../services/properBusinessService';

// Define a more complete business type for this component
interface BusinessDetails {
  id: string;
  name: string;
  description: string;
  category: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
  accessibility?: {
    wheelchairAccessible: boolean;
    brailleMenus: boolean;
    signLanguageSupport: boolean;
    quietSpaces: boolean;
    accessibilityNotes: string;
    [key: string]: any;
  };
  featured?: boolean;
  ownerId: string;
  status: string;
  averageRating: number;
  totalReviews: number;
  createdAt: any;
  updatedAt: any;
  
  // Additional properties that might be in the response
  reviews?: Array<{
    id?: string;
    userName?: string;
    rating: number;
    content: string;
    createdAt: any;
  }>;
  hours?: {
    [day: string]: {
      open?: string;
      close?: string;
    };
  };
  images?: string[];
  tags?: string[];
}

interface BusinessDetailsScreenProps {
  navigation: any;
  route: {
    params: {
      businessId: string;
    };
  };
}

const ReviewItem = memo(({ item, colors }: { item: any; colors: any }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? '#fbbf24' : colors.border}
        />
      );
    }
    return stars;
  };

  return (
    <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.reviewHeader}>
        <Text style={[styles.reviewAuthor, { color: colors.text }]}>{item.userName || 'Anonymous'}</Text>
        <View style={styles.reviewRating}>
          {renderStars(item.rating)}
        </View>
      </View>
      <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>{item.content}</Text>
      <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
        {new Date(item.createdAt?.toDate?.() || item.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );
});

export default function BusinessDetailsScreen({ navigation, route }: BusinessDetailsScreenProps) {
  // Get businessId from route params
  const { businessId } = route.params;
  const { user } = useAuth();
  const { colors } = useTheme();
  const [isSaved, setIsSaved] = useState(false);  // Will implement saved businesses later
  
  // Use the business details hook to fetch business data
  const { business: businessData, loading, error } = useBusinessDetails(businessId);
  // Cast the business to our more detailed interface to handle additional properties
  const business = businessData as unknown as BusinessDetails;
  
  // Log for debugging
  useEffect(() => {
    console.log('Business Details Screen - businessId:', businessId);
    console.log('Business loading:', loading);
    console.log('Business error:', error);
  }, [businessId, loading, error]);

  useEffect(() => {
    if (business) {
      console.log('Business loaded:', business.name);
    }
  }, [business]);

  const handleToggleSaved = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to save businesses');
      return;
    }

    try {
      if (isSaved) {
        // await unsaveBusiness(business.id);  // TODO: Implement unsave functionality
        setIsSaved(false);
      } else {
        // await saveBusiness(business.id);  // TODO: Implement save functionality
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Failed to toggle saved business:', error);
      Alert.alert('Error', 'Failed to update saved businesses');
    }
  };

  const handleCall = () => {
    if (business?.contact?.phone) {
      Linking.openURL(`tel:${business.contact.phone}`);
    }
  };

  const handleWebsite = () => {
    if (business?.contact?.website) {
      Linking.openURL(business.contact.website);
    }
  };

  const handleDirections = () => {
    if (!business?.location) return;
    
    const address = `${business.location.address}, ${business.location.city}, ${business.location.state} ${business.location.zipCode}`;
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const handleWriteReview = () => {
    if (!business) return;
    
    console.log('🔍 DEBUG: Write Review button pressed');
    console.log('🔍 DEBUG: user exists =', !!user);
    console.log('🔍 DEBUG: business.id =', business.id);
    console.log('🔍 DEBUG: business.name =', business.name);
    
    if (!user) {
      console.log('⚠️ DEBUG: User not logged in, showing login alert');
      Alert.alert('Login Required', 'Please login to write reviews');
      return;
    }
    
    console.log('🔍 DEBUG: Navigating to CreateReview screen with params:', {
      businessId: business.id,
      businessName: business.name
    });
    
    navigation.navigate('CreateReview', { businessId: business.id, businessName: business.name });
  };

  const handleFeedback = () => {
    if (!business) return;
    
    console.log('📧 DEBUG: Feedback button pressed');
    console.log('📧 DEBUG: user exists =', !!user);
    console.log('📧 DEBUG: business.id =', business.id);
    console.log('📧 DEBUG: business.name =', business.name);
    
    if (!user) {
      Alert.alert('Login Required', 'Please login to send feedback');
      return;
    }
    
    navigation.navigate('Feedback', { 
      businessId: business.id, 
      businessName: business.name,
      feedbackType: 'business'
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? '#fbbf24' : colors.border}
        />
      );
    }
    return stars;
  };

  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
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

  // Show loading state while fetching business data
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.headerText} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B46C1" />
          <Text style={styles.loadingText}>Loading business details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if there was an error fetching the business
  if (error || !business) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.headerText} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Could not load business</Text>
          <Text style={styles.errorMessage}>{error || 'Business not found'}</Text>
          <TouchableOpacity 
            style={styles.backToDirectoryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToDirectoryText}>Back to Directory</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleToggleSaved}
        >
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={24}
            color={isSaved ? '#ef4444' : colors.headerText}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Business Info */}
        <View style={[styles.businessInfo, { backgroundColor: colors.background }]}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons
              name={getCategoryIcon(business.category)}
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.categoryText, { color: colors.primary }]}>
              {business.category.charAt(0).toUpperCase() + business.category.slice(1)}
            </Text>
          </View>
          
          <Text style={[styles.businessName, { color: colors.text }]}>{business.name}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {renderStars(business.averageRating || 0)}
            </View>
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {(business.averageRating || 0).toFixed(1)} ({business.totalReviews || 0} reviews)
            </Text>
          </View>

          <Text style={[styles.businessDescription, { color: colors.textSecondary }]}>{business.description}</Text>
        </View>

        {/* Contact Actions */}
        <View style={[styles.actionButtons, { borderTopColor: colors.border, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
          {business.contact?.phone && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={handleCall}>
              <Ionicons name="call" size={20} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Call</Text>
            </TouchableOpacity>
          )}
          
          {business.contact?.website && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={handleWebsite}>
              <Ionicons name="globe" size={20} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Website</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={handleDirections}>
            <Ionicons name="navigate" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View style={[styles.infoSection, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {business.location.address}, {business.location.city}, {business.location.state} {business.location.zipCode}
            </Text>
          </View>

          {business.contact?.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>{business.contact.phone}</Text>
            </View>
          )}

          {business.contact?.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>{business.contact.email}</Text>
            </View>
          )}

          {business.contact?.website && (
            <View style={styles.infoRow}>
              <Ionicons name="globe" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>{business.contact.website}</Text>
            </View>
          )}
        </View>

        {/* Hours */}
        {business.hours && (
          <View style={[styles.infoSection, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Hours</Text>
            {Object.entries(business.hours).map(([day, hours]: [string, any]) => (
              <View key={day} style={styles.hoursRow}>
                <Text style={[styles.dayText, { color: colors.text }]}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                <Text style={[styles.hoursText, { color: colors.textSecondary }]}>
                  {hours.open && hours.close ? `${hours.open} - ${hours.close}` : 'Closed'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Accessibility Features */}
        {business.accessibility && Object.values(business.accessibility).some((value) => value !== false && value !== '') && (
          <View style={[styles.infoSection, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Accessibility Features</Text>
            <View style={styles.accessibilityGrid}>
              {Object.entries(business.accessibility)
                .filter(([key, value]) => value === true && key !== 'accessibilityNotes')
                .map(([feature, _]) => (
                  <View key={feature} style={styles.accessibilityTag}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                    <Text style={[styles.accessibilityText, { color: colors.text }]}>
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </Text>
                  </View>
                ))
              }
              {business.accessibility.accessibilityNotes && (
                <Text style={[styles.accessibilityNotes, { color: colors.textSecondary }]}>
                  {business.accessibility.accessibilityNotes}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Reviews Section */}
        <View style={[styles.infoSection, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Reviews</Text>
          
          {business.reviews && business.reviews.length > 0 ? (
            <FlatList
              data={business.reviews}
              renderItem={({ item }) => <ReviewItem item={item} colors={colors} />}
              keyExtractor={(item) => item.id || item.createdAt?.toString() || Math.random().toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.reviewsList}
            />
          ) : (
            <Text style={[styles.noReviewsText, { color: colors.textSecondary }]}>
              No reviews yet. Be the first to leave a review!
            </Text>
          )}
        </View>

        {/* Write Review Button */}
        <TouchableOpacity style={[styles.writeReviewButton, { backgroundColor: colors.primary }]} onPress={handleWriteReview}>
          <Ionicons name="create" size={20} color="#ffffff" />
          <Text style={styles.writeReviewText}>Write a Review</Text>
        </TouchableOpacity>

        {/* Feedback Button */}
        <TouchableOpacity style={[styles.feedbackButton, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={handleFeedback}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
          <Text style={[styles.feedbackButtonText, { color: colors.primary }]}>Send Feedback</Text>
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
  accessibilityNotes: {
    fontSize: 14,
    color: '#374151',
    marginTop: 8,
    fontStyle: 'italic',
  },
  reviewsList: {
    paddingRight: 20,
  },
  reviewCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    width: 280,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  noReviewsText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 8,
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
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backToDirectoryButton: {
    backgroundColor: '#6B46C1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToDirectoryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
