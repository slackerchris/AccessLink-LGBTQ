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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

interface Review {
  id: string;
  businessId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export default function ReviewHistoryScreen() {
  const { userProfile } = useAuth();
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
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>{getBusinessName(review.businessId)}</Text>
          <View style={styles.ratingContainer}>
            {renderStars(review.rating)}
            <Text style={styles.ratingText}>({review.rating}/5)</Text>
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
          <Ionicons name="ellipsis-vertical" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <Text style={styles.reviewComment}>{review.comment}</Text>

      <View style={styles.reviewFooter}>
        <Text style={styles.reviewDate}>
          {formatDate(review.createdAt)}
        </Text>
        {review.updatedAt !== review.createdAt && (
          <Text style={styles.editedLabel}>• Edited</Text>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="star-outline" size={80} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No Reviews Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start exploring businesses and share your experiences with the community!
      </Text>
      <TouchableOpacity style={styles.exploreButton}>
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Review History</Text>
        <Text style={styles.headerSubtitle}>
          Your contributions to the community
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {stats && (
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>Your Impact</Text>
              <Ionicons name="bar-chart" size={20} color="#6366f1" />
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalReviews}</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.averageRating}</Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {reviews.filter(r => new Date(r.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                </Text>
                <Text style={styles.statLabel}>This Month</Text>
              </View>
            </View>
          </View>
        )}

        {sortedReviews.length > 0 ? (
          <View style={styles.reviewsList}>
            <Text style={styles.sectionTitle}>All Reviews ({sortedReviews.length})</Text>
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
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    color: '#1f2937',
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
    color: '#6366f1',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  reviewsList: {
    flex: 1,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
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
    color: '#1f2937',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  menuButton: {
    padding: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  editedLabel: {
    fontSize: 12,
    color: '#6b7280',
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
    color: '#374151',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 24,
  },
  exploreButton: {
    backgroundColor: '#6366f1',
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
});
