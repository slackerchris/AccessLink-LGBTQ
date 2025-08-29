/**
 * Business Details Screen
 * Shows detailed information about a specific business
 */

import React, { useState, memo, useEffect, useCallback } from 'react';
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
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth as useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { useBusinessActions } from '../../hooks/useBusiness';
import { useTheme } from '../../hooks/useTheme';
import { BusinessListing } from '../../services/businessService';
import { useBusinessDetails } from '../../hooks/useProperBusiness';
import { parseFromNavigation } from '../../utils/navigationHelpers';
import { adaptBusinessForDisplay, formatBusinessHours } from '../../utils/businessAdapters';
import { savedPlacesService } from '../../services/savedPlacesService';
import { getBusinessReviews, UserReview } from '../../services/reviewService';
import { trackBusinessView } from '../../services/viewTrackingService';

// Define error color constant for use when colors.error is not available
const ERROR_COLOR = '#ef4444';

interface BusinessDetailsScreenProps {
  navigation: any;
  route: {
    params: {
      businessId?: string;
      business?: BusinessListing;
    };
  };
}

// Recent Review Item Component
const RecentReviewItem = memo(({ item, colors }: { item: UserReview; colors: any }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color={i <= rating ? '#fbbf24' : colors.border}
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <View style={[styles.recentReviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.recentReviewHeader}>
        <View style={styles.recentReviewRating}>
          {renderStars(item.rating)}
        </View>
        <Text style={[styles.recentReviewDate, { color: colors.textSecondary }]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
      <Text 
        style={[styles.recentReviewComment, { color: colors.text }]} 
        numberOfLines={3}
      >
        {item.comment}
      </Text>
    </View>
  );
});

// Minimal review type for display in this screen
type BusinessReview = {
  id?: string;
  userName?: string;
  rating: number;
  content: string;
  createdAt: any;
};

const ReviewItem = memo(({ item, colors }: { item: BusinessReview; colors: any }) => {
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
        <Text style={[styles.reviewerName, { color: colors.text }]}>{item.userName || 'Anonymous User'}</Text>
        <View style={styles.reviewRating}>
          {renderStars(item.rating)}
        </View>
      </View>
      <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>{item.content}</Text>
      <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>{
        typeof item.createdAt === 'string' 
          ? new Date(item.createdAt).toLocaleDateString() 
          : (item.createdAt?.toDate?.() || new Date()).toLocaleDateString()
      }</Text>
    </View>
  );
});

export default function BusinessDetailsScreen({ navigation, route }: BusinessDetailsScreenProps) {
  const { businessId, business: navigationBusiness } = route.params;
  const { userProfile, user } = useFirebaseAuth();
  const { } = useBusinessActions();  // Will fix these functions separately
  const { colors } = useTheme();
  const [isSaved, setIsSaved] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [recentReviews, setRecentReviews] = useState<UserReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [businessData, setBusinessData] = useState<BusinessListing & {
    reviewCount: number;
    photos: string[];
    accessibilityFeatures: string[];
    reviews?: BusinessReview[];
  } | null>(null);
  
  // If a full business object was passed via navigation, parse Date objects
  useEffect(() => {
    if (navigationBusiness) {
      // First parse any date strings back to Date objects
      const parsedBusiness = parseFromNavigation(navigationBusiness);
      // Then adapt the business for display with our adapter
      const adaptedBusiness = adaptBusinessForDisplay(parsedBusiness);
      setBusinessData(adaptedBusiness);
    }
  }, [navigationBusiness]);
  
  // Determine an ID to fetch details for (supports both navigation object and explicit id)
  const idForFetch = navigationBusiness?.id || businessId || null;

  // Fetch business details using the resolved ID
  const { business: fetchedBusiness, loading, error, refresh } = useBusinessDetails(idForFetch);
  
  // Use either the navigation-provided business or the fetched one
  useEffect(() => {
    if (fetchedBusiness) {
      // Convert the fetchedBusiness to the format expected by our adapter
      // This handles the difference between businessService.BusinessListing and properBusinessService.BusinessListing
      const businessForAdapter: BusinessListing = {
        ...fetchedBusiness as any,
        // Add any missing required fields with defaults
        hours: (fetchedBusiness as any).hours || {},
        images: (fetchedBusiness as any).images || [],
        tags: (fetchedBusiness as any).tags || [],
        createdAt: (fetchedBusiness as any).createdAt || new Date(),
      };

      const adaptedBusiness = adaptBusinessForDisplay(businessForAdapter);
      setBusinessData(adaptedBusiness);
    }
  }, [fetchedBusiness]);

  // Refresh details whenever this screen comes into focus (e.g., after submitting a review)
  useFocusEffect(
    useCallback(() => {
      if (idForFetch) {
        refresh();
      }
    }, [idForFetch, refresh])
  );

  // Check if business is saved when business data loads
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (businessData?.id && user?.uid) {
        try {
          const saved = await savedPlacesService.isBusinessSaved(user.uid, businessData.id);
          setIsSaved(saved);
        } catch (error) {
          console.error('Error checking saved status:', error);
        }
      }
    };
    
    checkSavedStatus();
  }, [businessData?.id, user?.uid]);

  // Load recent reviews for this business
  useEffect(() => {
    const loadRecentReviews = async () => {
      if (businessData?.id) {
        try {
          setLoadingReviews(true);
          console.log('🔍 BusinessDetailsScreen: Loading reviews for business:', businessData.id);
          const reviews = await getBusinessReviews(businessData.id, 3); // Get last 3 reviews
          console.log('✅ BusinessDetailsScreen: Loaded', reviews.length, 'reviews');
          setRecentReviews(reviews);
        } catch (error) {
          console.error('❌ BusinessDetailsScreen: Error loading reviews:', error);
          setRecentReviews([]); // Set empty array on error
        } finally {
          setLoadingReviews(false);
        }
      }
    };
    
    loadRecentReviews();
  }, [businessData?.id]);

  // Track business view when business data is available
  useEffect(() => {
    const trackView = async () => {
      if (businessData?.id) {
        try {
          console.log('📊 BusinessDetailsScreen: Tracking view for business:', businessData.id);
          await trackBusinessView(businessData.id);
        } catch (error) {
          console.log('⚠️ BusinessDetailsScreen: View tracking failed (non-critical):', error);
          // Don't show this error to users as it's not critical for the user experience
        }
      }
    };

    trackView();
  }, [businessData?.id]);
  
  // Add console logs for debugging
  console.log('BusinessDetailsScreen - businessId:', businessId);
  console.log('BusinessDetailsScreen - loading:', loading);
  console.log('BusinessDetailsScreen - error:', error);
  console.log('BusinessDetailsScreen - business:', businessData);

  if (loading && !businessData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading business details...
        </Text>
      </View>
    );
  }

  if (error && !businessData) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle" size={48} color={ERROR_COLOR} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>Error Loading Business</Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {error ? error.toString() : 'Business not found'}
        </Text>
        <TouchableOpacity
          style={[styles.errorButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Return early if no business data is available
  if (!businessData) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="business" size={48} color={ERROR_COLOR} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>Business Not Found</Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          We couldn't find the business you're looking for.
        </Text>
        <TouchableOpacity
          style={[styles.errorButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleSaved = async () => {
    if (!user?.uid || !businessData?.id) {
      Alert.alert('Login Required', 'Please login to save businesses');
      return;
    }

    if (loadingSaved) return; // Prevent double-taps

    setLoadingSaved(true);
    
    try {
      if (isSaved) {
        // Unsave business
        await savedPlacesService.unsaveBusiness(user.uid, businessData.id);
        setIsSaved(false);
        Alert.alert('Removed', `${businessData.name} has been removed from your saved places.`);
      } else {
        // Save business
        await savedPlacesService.saveBusiness(user.uid, businessData.id);
        setIsSaved(true);
        Alert.alert('Saved', `${businessData.name} has been added to your saved places.`);
      }
    } catch (error) {
      console.error('Failed to toggle saved business:', error);
      Alert.alert('Error', 'Failed to update saved businesses. Please try again.');
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleCall = () => {
    if (businessData.contact?.phone) {
      Linking.openURL(`tel:${businessData.contact.phone}`);
    }
  };

  const handleWebsite = () => {
    if (businessData.contact?.website) {
      Linking.openURL(businessData.contact.website);
    }
  };

  const handleDirections = () => {
    const address = `${businessData.location.address}, ${businessData.location.city}, ${businessData.location.state} ${businessData.location.zipCode}`;
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const handleWriteReview = () => {
    console.log('🔍 DEBUG: Write Review button pressed');
    console.log('🔍 DEBUG: user exists =', !!userProfile);
    console.log('🔍 DEBUG: business.id =', businessData.id);
    console.log('🔍 DEBUG: business.name =', businessData.name);
    
    if (!userProfile) {
      console.log('⚠️ DEBUG: User not logged in, showing login alert');
      Alert.alert('Login Required', 'Please login to write reviews');
      return;
    }
    
    console.log('🔍 DEBUG: Navigating to CreateReview screen with params:', {
      businessId: businessData.id,
      businessName: businessData.name
    });
    
    navigation.navigate('CreateReview', { businessId: businessData.id, businessName: businessData.name });
  };

  const handleFeedback = () => {
    console.log('📧 DEBUG: Feedback button pressed');
    console.log('📧 DEBUG: user exists =', !!userProfile);
    console.log('📧 DEBUG: business.id =', businessData.id);
    console.log('📧 DEBUG: business.name =', businessData.name);
    
    if (!userProfile) {
      Alert.alert('Login Required', 'Please login to send feedback');
      return;
    }
    
    if (!businessData.contact?.email) {
      Alert.alert('Contact Info Missing', 'This business doesn\'t have a contact email listed.');
      return;
    }
    
    const subject = `Feedback about your AccessLink listing: ${businessData.name}`;
    const body = `Hello,\n\nI found your business on AccessLink LGBTQ+ and wanted to reach out about...`;
    
    Linking.openURL(`mailto:${businessData.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.header }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.businessName, { color: '#fff' }]} numberOfLines={1}>
              {businessData.name}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text style={styles.ratingText}>
                {businessData.averageRating.toFixed(1)} ({businessData.reviewCount || 0} reviews)
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            onPress={toggleSaved}
            disabled={loadingSaved}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={loadingSaved ? '#ccc' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        {/* Business Image/Banner */}
        <View style={styles.bannerContainer}>
          {businessData.photos && businessData.photos.length > 0 ? (
            <Image
              source={{ uri: businessData.photos[0] }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.placeholderBanner, { backgroundColor: colors.surface }]}>
              <Ionicons name="business" size={48} color={colors.textSecondary} />
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>No image available</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={[styles.quickActions, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.quickActionButton} onPress={handleCall}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="call" size={22} color={colors.primary} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton} onPress={handleDirections}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="navigate" size={22} color={colors.primary} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Directions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton} onPress={handleWebsite}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="globe" size={22} color={colors.primary} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Website</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton} onPress={handleFeedback}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="mail" size={22} color={colors.primary} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Email</Text>
          </TouchableOpacity>
        </View>

        {/* Business Details */}
        <View style={styles.detailsContainer}>
          <View style={[styles.section, { borderBottomColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={22} color={colors.primary} style={styles.sectionIcon} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
            </View>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {businessData.description}
            </Text>
          </View>

          <View style={[styles.section, { borderBottomColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={22} color={colors.primary} style={styles.sectionIcon} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
            </View>
            <Text style={[styles.address, { color: colors.textSecondary }]}>
              {businessData.location.address}{'\n'}
              {businessData.location.city}, {businessData.location.state} {businessData.location.zipCode}
            </Text>
          </View>

          {businessData.hours && (
            <View style={[styles.section, { borderBottomColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time" size={22} color={colors.primary} style={styles.sectionIcon} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Hours</Text>
              </View>
              <View style={styles.hoursContainer}>
                {Object.entries(businessData.hours).map(([day, hoursInfo]) => {
                  // Convert hours object to string
                  let hoursText = "Closed";
                  if (typeof hoursInfo === 'object' && !hoursInfo.closed) {
                    if (hoursInfo.open && hoursInfo.close) {
                      hoursText = `${hoursInfo.open} - ${hoursInfo.close}`;
                    } else {
                      hoursText = "Hours not specified";
                    }
                  }
                  
                  return (
                    <View key={day} style={styles.hourRow}>
                      <Text style={[styles.hourDay, { color: colors.text }]}>{day}</Text>
                      <Text style={[styles.hourTime, { color: colors.textSecondary }]}>{hoursText}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={[styles.section, { borderBottomColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="accessibility" size={22} color={colors.primary} style={styles.sectionIcon} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Accessibility Features</Text>
            </View>
            <View style={styles.tagsContainer}>
              {businessData.accessibilityFeatures?.map((feature, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>{feature}</Text>
                </View>
              ))}
              {(!businessData.accessibilityFeatures || businessData.accessibilityFeatures.length === 0) && (
                <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
                  No accessibility features listed
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsContainer}>
          <View style={styles.reviewsHeader}>
            <View>
              <Text style={[styles.reviewsTitle, { color: colors.text }]}>Recent Reviews</Text>
              {recentReviews.length > 0 && (
                <Text style={[styles.reviewsSubtitle, { color: colors.textSecondary }]}>
                  Latest {recentReviews.length} review{recentReviews.length !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.writeReviewButton, { backgroundColor: colors.primary }]}
              onPress={handleWriteReview}
            >
              <Ionicons name="add" size={16} color="white" style={{ marginRight: 4 }} />
              <Text style={styles.writeReviewText}>Write Review</Text>
            </TouchableOpacity>
          </View>
          
          {loadingReviews ? (
            <View style={[styles.loadingReviewsContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.loadingReviewsText, { color: colors.textSecondary }]}>
                Loading reviews...
              </Text>
            </View>
          ) : recentReviews.length > 0 ? (
            <View style={styles.reviewsList}>
              {recentReviews.map((review, index) => (
                <RecentReviewItem key={review.id || index} item={review} colors={colors} />
              ))}
              
              {/* View All Reviews Button */}
              <TouchableOpacity
                style={[styles.viewAllReviewsButton, { borderColor: colors.border }]}
                onPress={() => {
                  // TODO: Navigate to all reviews screen
                  Alert.alert('Coming Soon', 'View all reviews feature will be available soon!');
                }}
              >
                <Text style={[styles.viewAllReviewsText, { color: colors.primary }]}>
                  View All Reviews
                </Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.noReviewsContainer, { backgroundColor: colors.surface }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.textSecondary} />
              <Text style={[styles.noReviewsText, { color: colors.text }]}>No Reviews Yet</Text>
              <Text style={[styles.noReviewsSubtext, { color: colors.textSecondary }]}>
                Be the first to review this business!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 5,
  },
  bannerContainer: {
    width: '100%',
    height: 200,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBanner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    marginTop: 8,
    color: '#888',
    fontSize: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 8,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailsContainer: {
    padding: 16,
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  address: {
    fontSize: 16,
    lineHeight: 24,
  },
  hoursContainer: {
    marginTop: 8,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  hourDay: {
    fontSize: 16,
    fontWeight: '500',
    width: 100,
  },
  hourTime: {
    fontSize: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  reviewsContainer: {
    padding: 16,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  writeReviewText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 15,
    lineHeight: 22,
    marginVertical: 8,
  },
  reviewDate: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  noReviewsContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  noReviewsText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  noReviewsSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  // Recent review styles
  recentReviewCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  recentReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentReviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  recentReviewDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  recentReviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Additional review styles
  reviewsSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  loadingReviewsContainer: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadingReviewsText: {
    fontSize: 14,
  },
  reviewsList: {
    marginTop: 16,
  },
  viewAllReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    gap: 6,
  },
  viewAllReviewsText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
