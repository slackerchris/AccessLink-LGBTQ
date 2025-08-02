import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

interface Review {
  id: string;
  businessId: string;
  rating: number;
  comment: string;
  photos?: {
    id: string;
    uri: string;
    caption?: string;
    category: 'accessibility' | 'interior' | 'exterior' | 'menu' | 'staff' | 'event' | 'other';
    uploadedAt: string;
  }[];
  accessibilityTags?: string[];
  helpfulCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function ReviewHistoryScreen({ navigation }: { navigation: any }) {
  const { userProfile } = useAuth();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  
  const reviews = userProfile?.profile?.reviews || [];
  const sortedReviews = reviews.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // In a real app, this would refresh the data from the server
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBusinessName = (businessId: string) => {
    // In a real app, this would fetch business data
    const businessNames: { [key: string]: string } = {
      'rainbow-cafe-001': 'Rainbow Cafe',
      'pride-health-center-002': 'Pride Health Center',
      'inclusive-bookstore-003': 'Inclusive Books',
    };
    return businessNames[businessId] || 'Unknown Business';
  };

  const handleEditReview = (review: Review) => {
    Alert.alert(
      'Edit Review',
      'Review editing is coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteReview = (review: Review) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would delete the review
            Alert.alert('Success', 'Review deleted successfully!');
          }
        }
      ]
    );
  };

  const renderReviewItem = (review: Review, index: number) => (
    <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.reviewHeader}>
        <View style={styles.businessInfo}>
          <Text style={[styles.businessName, { color: colors.text }]}>{getBusinessName(review.businessId)}</Text>
          <View style={styles.ratingContainer}>
            {renderStars(review.rating)}
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>({review.rating}/5)</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            Alert.alert(
              'Review Options',
              'Choose an action',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Edit', onPress: () => handleEditReview(review) },
                { text: 'Delete', style: 'destructive', onPress: () => handleDeleteReview(review) }
              ]
            );
          }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.reviewComment, { color: colors.text }]}>{review.comment}</Text>

      {/* Photos Section */}
      {review.photos && review.photos.length > 0 && (
        <View style={styles.photosSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {review.photos.map(photo => (
              <View key={photo.id} style={styles.reviewPhoto}>
                <Image source={{ uri: photo.uri }} style={styles.reviewPhotoImage} />
                {photo.caption && (
                  <Text style={[styles.reviewPhotoCaption, { color: colors.textSecondary, backgroundColor: colors.surface }]} numberOfLines={2}>
                    {photo.caption}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Accessibility Tags */}
      {review.accessibilityTags && review.accessibilityTags.length > 0 && (
        <View style={styles.accessibilityTagsSection}>
          <Text style={[styles.accessibilityTagsTitle, { color: colors.text }]}>Accessibility Features:</Text>
          <View style={styles.accessibilityTags}>
            {review.accessibilityTags.map(tag => (
              <View key={tag} style={styles.accessibilityTag}>
                <Ionicons name="checkmark-circle" size={12} color="#059669" />
                <Text style={styles.accessibilityTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.reviewFooter}>
        <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
          {formatDate(review.createdAt)}
        </Text>
        {review.updatedAt !== review.createdAt && (
          <Text style={[styles.editedLabel, { color: colors.textSecondary }]}>• Edited</Text>
        )}
        {review.helpfulCount && review.helpfulCount > 0 && (
          <Text style={[styles.helpfulCount, { color: colors.textSecondary }]}>• {review.helpfulCount} found helpful</Text>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="star-outline" size={80} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Reviews Yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Start exploring businesses and share your experiences with the community!
      </Text>
      <TouchableOpacity style={[styles.exploreButton, { backgroundColor: colors.primary }]}>
        <Text style={styles.exploreButtonText}>Explore Businesses</Text>
        <Ionicons name="arrow-forward" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const getReviewStats = () => {
    if (reviews.length === 0) return null;
    
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => 
      reviews.filter(review => review.rating === rating).length
    );

    return {
      totalReviews,
      averageRating: averageRating.toFixed(1),
      ratingDistribution
    };
  };

  const stats = getReviewStats();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.headerText} />
          </TouchableOpacity>
          <View style={styles.headerTitleSection}>
            <Text style={[styles.headerTitle, { color: colors.headerText }]}>Review History</Text>
            <Text style={[styles.headerSubtitle, { color: colors.headerText }]}>
              Your contributions to the community
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {stats && (
          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statsHeader}>
              <Text style={[styles.statsTitle, { color: colors.text }]}>Your Impact</Text>
              <Ionicons name="bar-chart" size={20} color={colors.primary} />
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.totalReviews}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Reviews</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.averageRating}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {reviews.filter(r => new Date(r.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Month</Text>
              </View>
            </View>
          </View>
        )}

        {sortedReviews.length > 0 ? (
          <View style={styles.reviewsList}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>All Reviews ({sortedReviews.length})</Text>
            {sortedReviews.map((review, index) => renderReviewItem(review, index))}
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitleSection: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  reviewsList: {
    flex: 1,
  },
  reviewCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 6,
  },
  menuButton: {
    padding: 4,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
  },
  editedLabel: {
    fontSize: 12,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 24,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 30,
    gap: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // New styles for photo and accessibility features
  photosSection: {
    marginTop: 12,
    marginBottom: 8,
  },
  reviewPhoto: {
    width: 80,
    marginRight: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  reviewPhotoImage: {
    width: '100%',
    height: 60,
    resizeMode: 'cover',
  },
  reviewPhotoCaption: {
    fontSize: 10,
    padding: 4,
  },
  accessibilityTagsSection: {
    marginTop: 12,
    marginBottom: 8,
  },
  accessibilityTagsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  accessibilityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  accessibilityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  accessibilityTagText: {
    fontSize: 10,
    color: '#059669',
    marginLeft: 2,
    fontWeight: '500',
  },
  helpfulCount: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
