import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import { useReviewHistory } from '../../hooks/useReviewHistory';
import { UserReview } from '../../services/reviewService';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

type ReviewHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ReviewHistory'>;

type Review = UserReview & {
  accessibilityTags?: string[];
  helpfulCount?: number;
};

const ScreenHeader = React.memo(({ navigation }: { navigation: ReviewHistoryScreenNavigationProp }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <View style={styles.headerTitleSection}>
          <Text style={styles.headerTitle}>Review History</Text>
          <Text style={styles.headerSubtitle}>
            Your contributions to the community
          </Text>
        </View>
      </View>
    </View>
  );
});

const StatsCard = React.memo(({ stats }: { stats: any }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  if (!stats) return null;

  return (
    <View style={styles.statsCard}>
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>Your Impact</Text>
        <Ionicons name="bar-chart" size={20} color={colors.primary} />
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
          <Text style={styles.statNumber}>{stats.reviewsThisMonth}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
      </View>
    </View>
  );
});

const StarRating = React.memo(({ rating }: { rating: number }) => {
  const { colors } = useTheme();
  const stars = Array.from({ length: 5 }, (_, i) => (
    <Ionicons
      key={i}
      name={i < rating ? 'star' : 'star-outline'}
      size={16}
      color={i < rating ? colors.primary : colors.border}
    />
  ));
  return <>{stars}</>;
});

const ReviewCard = React.memo(({ review, onEdit, onDelete }: { review: Review, onEdit: () => void, onDelete: () => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);

  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>{review.businessName || review.businessId}</Text>
          <View style={styles.ratingContainer}>
            <StarRating rating={review.rating} />
            <Text style={styles.ratingText}>({review.rating}/5)</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => Alert.alert('Review Options', 'Choose an action', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Edit', onPress: onEdit },
            { text: 'Delete', style: 'destructive', onPress: onDelete },
          ])}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.reviewComment}>{review.comment}</Text>

      {review.photos && review.photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosSection}>
          {review.photos.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.reviewPhotoImage} />
          ))}
        </ScrollView>
      )}

      <View style={styles.reviewFooter}>
        <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
        {review.updatedAt && formatDate(review.createdAt) !== formatDate(review.updatedAt) && (
          <Text style={styles.editedLabel}>• Edited</Text>
        )}
      </View>
    </View>
  );
});

const EmptyState = React.memo(() => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.emptyState}>
      <Ionicons name="star-outline" size={80} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Reviews Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start exploring businesses and share your experiences!
      </Text>
      <TouchableOpacity style={styles.exploreButton}>
        <Text style={styles.exploreButtonText}>Explore Businesses</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.headerText} />
      </TouchableOpacity>
    </View>
  );
});

export default function ReviewHistoryScreen({ navigation }: { navigation: ReviewHistoryScreenNavigationProp }) {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const {
    refreshing,
    reviews,
    error,
    onRefresh,
    handleEditReview,
    handleDeleteReview,
  } = useReviewHistory(navigation);

  const stats = React.useMemo(() => {
    if (reviews.length === 0) return null;
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    const reviewsThisMonth = reviews.filter(r => {
      const reviewDate = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt as any);
      return reviewDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }).length;
    return {
      totalReviews,
      averageRating: averageRating.toFixed(1),
      reviewsThisMonth,
    };
  }, [reviews]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader navigation={navigation} />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <StatsCard stats={stats} />
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.notification} />
            <Text style={styles.errorTitle}>An Error Occurred</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : reviews.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>All Reviews ({reviews.length})</Text>
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onEdit={() => handleEditReview(review)}
                onDelete={() => handleDeleteReview(review)}
              />
            ))}
          </View>
        ) : (
          <EmptyState />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    backgroundColor: colors.header,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: colors.surface,
  },
  headerTitleSection: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.headerText,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.headerText,
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
    backgroundColor: colors.card,
    borderColor: colors.border,
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
    color: colors.text,
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
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: colors.text,
  },
  reviewCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
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
    color: colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 6,
    color: colors.textSecondary,
  },
  menuButton: {
    padding: 4,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    color: colors.text,
  },
  photosSection: {
    marginTop: 12,
    marginBottom: 8,
  },
  reviewPhotoImage: {
    width: 80,
    height: 60,
    marginRight: 8,
    borderRadius: 6,
    resizeMode: 'cover',
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  editedLabel: {
    fontSize: 12,
    marginLeft: 4,
    fontStyle: 'italic',
    color: colors.textSecondary,
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
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 24,
    color: colors.textSecondary,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 30,
    gap: 8,
    backgroundColor: colors.primary,
  },
  exploreButtonText: {
    color: colors.headerText,
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginVertical: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});