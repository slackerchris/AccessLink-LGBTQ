/**
 * Business Reviews Management Screen
 * Allows business owners to view and manage reviews for their businesses
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth as useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { useTheme } from '../../hooks/useTheme';
import { useBusinessActions } from '../../hooks/useFirebaseAuth';
import { getBusinessReviews, UserReview } from '../../services/reviewService';

interface Review {
  id: string;
  businessId: string;
  userId?: string;
  userName?: string;
  rating: number;
  comment: string; // Changed from 'content' to match UserReview
  createdAt: any;
  updatedAt: any;
}

interface Business {
  id: string;
  name: string;
  category: string;
  averageRating: number;
  totalReviews: number;
  status: string;
}

interface BusinessReviewsManagementScreenProps {
  navigation: any;
}

export const BusinessReviewsManagementScreen: React.FC<BusinessReviewsManagementScreenProps> = ({ navigation }) => {
  const { user, userProfile } = useFirebaseAuth();
  const { colors } = useTheme();
  const { getMyBusinesses } = useBusinessActions();
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showBusinessSelector, setShowBusinessSelector] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingsBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  // Load user's businesses and reviews
  useEffect(() => {
    loadBusinessesAndReviews();
  }, []);

  const loadBusinessesAndReviews = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading businesses for user:', user?.uid);
      
      // Get all user's businesses
      const userBusinesses = await getMyBusinesses();
      if (userBusinesses.length === 0) {
        console.log('⚠️ No businesses found for user');
        setBusinesses([]);
        setSelectedBusiness(null);
        return;
      }
      
      // Map to our Business interface
      const mappedBusinesses: Business[] = userBusinesses.map((business: any) => ({
        id: business.id,
        name: business.name,
        category: business.category || 'General',
        averageRating: business.averageRating || 0,
        totalReviews: business.totalReviews || 0,
        status: business.status || 'active'
      }));
      
      setBusinesses(mappedBusinesses);
      console.log('✅ Found', mappedBusinesses.length, 'businesses');
      
      // Auto-select first business if only one, otherwise show selector
      if (mappedBusinesses.length === 1) {
        setSelectedBusiness(mappedBusinesses[0]);
        await loadReviews(mappedBusinesses[0].id);
      } else {
        // Multiple businesses - let user choose
        setShowBusinessSelector(true);
      }
      
    } catch (error) {
      console.error('❌ Error loading businesses:', error);
      Alert.alert('Error', 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSelection = async (business: Business) => {
    setSelectedBusiness(business);
    setShowBusinessSelector(false);
    await loadReviews(business.id);
  };

  const loadReviews = async (businessId: string) => {
    try {
      console.log('🔍 Loading reviews for business:', businessId);
      
      // Get all reviews (not just the last 3)
      const allReviews = await getBusinessReviews(businessId, 100); // Get up to 100 reviews
      setReviews(allReviews);
      console.log('✅ Loaded', allReviews.length, 'reviews');
      
      // Calculate review statistics
      calculateReviewStats(allReviews);
      
    } catch (error) {
      console.error('❌ Error loading reviews:', error);
    }
  };

  const calculateReviewStats = (reviewsList: Review[]) => {
    if (reviewsList.length === 0) {
      setReviewStats({
        totalReviews: 0,
        averageRating: 0,
        ratingsBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
      return;
    }

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    reviewsList.forEach(review => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        breakdown[rating as keyof typeof breakdown]++;
        totalRating += review.rating;
      }
    });

    const averageRating = totalRating / reviewsList.length;

    setReviewStats({
      totalReviews: reviewsList.length,
      averageRating,
      ratingsBreakdown: breakdown
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (selectedBusiness) {
      await loadReviews(selectedBusiness.id);
    }
    setRefreshing(false);
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

  const renderRatingBar = (rating: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <View style={styles.ratingBarContainer}>
        <Text style={[styles.ratingLabel, { color: colors.text }]}>{rating}</Text>
        <Ionicons name="star" size={14} color="#fbbf24" />
        <View style={[styles.ratingBarBackground, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.ratingBarFill, 
              { 
                backgroundColor: colors.primary,
                width: `${percentage}%`
              }
            ]} 
          />
        </View>
        <Text style={[styles.ratingCount, { color: colors.textSecondary }]}>{count}</Text>
      </View>
    );
  };

  const formatDate = (dateValue: any) => {
    try {
      let date: Date;
      if (dateValue?.toDate) {
        date = dateValue.toDate();
      } else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        return 'Unknown date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const firstName = user?.displayName?.split(' ')[0] || 'Business Owner';

  // Check if user has business owner/manager role
  const isBizUser = userProfile?.role === 'bizowner' || userProfile?.role === 'bizmanager';

  if (!isBizUser) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.accessDeniedContainer}>
          <Ionicons name="business-outline" size={64} color="#ef4444" />
          <Text style={styles.accessDeniedTitle}>Business Access Required</Text>
          <Text style={styles.accessDeniedText}>
            This section is only available to business owners and managers.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading businesses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (businesses.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.noBusiness}>
          <Ionicons name="storefront-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.noBusinessTitle, { color: colors.text }]}>No Businesses Found</Text>
          <Text style={[styles.noBusinessText, { color: colors.textSecondary }]}>
            You need to have a registered business to manage reviews.
          </Text>
          <TouchableOpacity 
            style={[styles.contactButton, { backgroundColor: colors.primary }]}
            onPress={() => Alert.alert('Business Registration', 'Contact support to register your business:\n\nbusiness-support@accesslinklgbtq.app')}
          >
            <Text style={styles.contactButtonText}>Register Business</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedBusiness && !showBusinessSelector) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.noBusiness}>
          <Ionicons name="storefront-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.noBusinessTitle, { color: colors.text }]}>No Business Selected</Text>
          <Text style={[styles.noBusinessText, { color: colors.textSecondary }]}>
            Select a business to view its reviews.
          </Text>
          <TouchableOpacity 
            style={[styles.contactButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowBusinessSelector(true)}
          >
            <Text style={styles.contactButtonText}>Select Business</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: colors.headerText }]}>Reviews Management</Text>
          {businesses.length > 1 && (
            <TouchableOpacity 
              style={[styles.businessSelectorButton, { borderColor: colors.headerText + '40' }]}
              onPress={() => setShowBusinessSelector(true)}
            >
              <Ionicons name="swap-horizontal" size={20} color={colors.headerText} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.selectedBusinessContainer}
          onPress={() => businesses.length > 1 && setShowBusinessSelector(true)}
        >
          <Text style={[styles.headerSubtitle, { color: colors.headerText + 'CC' }]}>
            {selectedBusiness?.name || 'No business selected'}
          </Text>
          {businesses.length > 1 && (
            <Ionicons name="chevron-down" size={16} color={colors.headerText + 'CC'} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Review Statistics */}
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statsHeader}>
            <View style={styles.overallRating}>
              <Text style={[styles.averageRating, { color: colors.text }]}>
                {reviewStats.averageRating.toFixed(1)}
              </Text>
              <View style={styles.starsContainer}>
                {renderStars(Math.round(reviewStats.averageRating))}
              </View>
              <Text style={[styles.totalReviews, { color: colors.textSecondary }]}>
                {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
              </Text>
            </View>
            
            <View style={styles.ratingsBreakdown}>
              {[5, 4, 3, 2, 1].map(rating => 
                renderRatingBar(
                  rating, 
                  reviewStats.ratingsBreakdown[rating as keyof typeof reviewStats.ratingsBreakdown], 
                  reviewStats.totalReviews
                )
              )}
            </View>
          </View>
        </View>

        {/* Reviews List */}
        <View style={[styles.reviewsSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Reviews</Text>
          
          {reviews.length === 0 ? (
            <View style={styles.noReviewsContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.noReviewsTitle, { color: colors.text }]}>No Reviews Yet</Text>
              <Text style={[styles.noReviewsText, { color: colors.textSecondary }]}>
                Your business hasn't received any reviews yet. Encourage customers to leave reviews!
              </Text>
            </View>
          ) : (
            reviews.map((review, index) => (
              <View key={review.id || index} style={[styles.reviewCard, { borderColor: colors.border }]}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAuthor}>
                    <Text style={[styles.reviewerName, { color: colors.text }]}>
                      {review.userName || 'Anonymous'}
                    </Text>
                    <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
                      {formatDate(review.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.reviewRating}>
                    {renderStars(review.rating)}
                  </View>
                </View>
                
                <Text style={[styles.reviewContent, { color: colors.text }]}>
                  {review.comment}
                </Text>
                
                {/* Business Owner Actions */}
                <View style={styles.reviewActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, { borderColor: colors.border }]}
                    onPress={() => Alert.alert('Coming Soon', 'Response to reviews feature coming soon!')}
                  >
                    <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
                    <Text style={[styles.actionButtonText, { color: colors.primary }]}>Respond</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, { borderColor: colors.border }]}
                    onPress={() => Alert.alert('Coming Soon', 'Report review feature coming soon!')}
                  >
                    <Ionicons name="flag-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Report</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Business Insights */}
        <View style={[styles.insightsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Review Insights</Text>
          
          <View style={styles.insightItem}>
            <Ionicons name="trending-up" size={20} color={colors.primary} />
            <View style={styles.insightContent}>
              <Text style={[styles.insightTitle, { color: colors.text }]}>Average Rating</Text>
              <Text style={[styles.insightValue, { color: colors.textSecondary }]}>
                {reviewStats.averageRating.toFixed(1)} out of 5 stars
              </Text>
            </View>
          </View>
          
          <View style={styles.insightItem}>
            <Ionicons name="people" size={20} color={colors.primary} />
            <View style={styles.insightContent}>
              <Text style={[styles.insightTitle, { color: colors.text }]}>Total Reviews</Text>
              <Text style={[styles.insightValue, { color: colors.textSecondary }]}>
                {reviewStats.totalReviews} customer{reviewStats.totalReviews !== 1 ? 's' : ''} reviewed
              </Text>
            </View>
          </View>
          
          <View style={styles.insightItem}>
            <Ionicons name="heart" size={20} color={colors.primary} />
            <View style={styles.insightContent}>
              <Text style={[styles.insightTitle, { color: colors.text }]}>Positive Reviews</Text>
              <Text style={[styles.insightValue, { color: colors.textSecondary }]}>
                {reviewStats.ratingsBreakdown[4] + reviewStats.ratingsBreakdown[5]} five and four-star reviews
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Business Selector Modal */}
      <Modal
        visible={showBusinessSelector}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBusinessSelector(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.header }]}>
            <Text style={[styles.modalTitle, { color: colors.headerText }]}>Select Business</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowBusinessSelector(false)}
            >
              <Ionicons name="close" size={24} color={colors.headerText} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={businesses}
            keyExtractor={(item) => item.id}
            style={styles.businessList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.businessItem,
                  { 
                    backgroundColor: colors.card,
                    borderColor: selectedBusiness?.id === item.id ? colors.primary : colors.border
                  }
                ]}
                onPress={() => handleBusinessSelection(item)}
              >
                <View style={styles.businessItemContent}>
                  <Text style={[styles.businessItemName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.businessItemCategory, { color: colors.textSecondary }]}>
                    {item.category}
                  </Text>
                  <View style={styles.businessItemStats}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#fbbf24" />
                      <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                        {item.averageRating.toFixed(1)} ({item.totalReviews} reviews)
                      </Text>
                    </View>
                  </View>
                </View>
                {selectedBusiness?.id === item.id && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
            ListFooterComponent={() => (
              <TouchableOpacity
                style={[styles.addBusinessItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  setShowBusinessSelector(false);
                  navigation.navigate('AddBusiness');
                }}
              >
                <View style={[styles.addBusinessIconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="add" size={24} color={colors.primary} />
                </View>
                <View style={styles.addBusinessContent}>
                  <Text style={[styles.addBusinessTitle, { color: colors.text }]}>Add New Business</Text>
                  <Text style={[styles.addBusinessSubtitle, { color: colors.textSecondary }]}>
                    Register another business to manage reviews
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    padding: 16,
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
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#ef4444',
  },
  accessDeniedText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
  },
  noBusiness: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noBusinessTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noBusinessText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  contactButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  statsCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  overallRating: {
    alignItems: 'center',
    flex: 1,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
  },
  ratingsBreakdown: {
    flex: 2,
    marginLeft: 20,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingLabel: {
    width: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  ratingBarBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  ratingBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  ratingCount: {
    width: 20,
    fontSize: 12,
    textAlign: 'right',
  },
  reviewsSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  noReviewsContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noReviewsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  noReviewsText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  reviewCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewAuthor: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  insightsCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightContent: {
    marginLeft: 12,
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 14,
  },
  // Header styles for multiple businesses
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  businessSelectorButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedBusinessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 4,
  },
  businessList: {
    flex: 1,
    padding: 16,
  },
  businessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  businessItemContent: {
    flex: 1,
  },
  businessItemName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  businessItemCategory: {
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  businessItemStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
  },
  // Add business styles
  addBusinessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  addBusinessIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  addBusinessContent: {
    flex: 1,
  },
  addBusinessTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  addBusinessSubtitle: {
    fontSize: 14,
  },
});

export default BusinessReviewsManagementScreen;
