import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../hooks/useTheme';
import { useBusinessDetailsScreen } from '../../hooks/useBusinessDetailsScreen';
import { RootStackParamList } from '../../types/navigation';
import { UserReview } from '../../services/reviewService';
import { Business } from '../../services/businessService';

// Navigation & Route Types
type BusinessDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BusinessDetails'>;
type BusinessDetailsScreenRouteProp = RouteProp<RootStackParamList, 'BusinessDetails'>;

interface BusinessDetailsScreenProps {
  route: BusinessDetailsScreenRouteProp;
}

// --- Memoized Sub-components ---

const LoadingState: React.FC = memo(() => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading business details...</Text>
    </View>
  );
});

const ErrorState: React.FC<{ error?: string; onRetry: () => void }> = memo(({ error, onRetry }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={48} color={colors.notification} />
      <Text style={styles.errorTitle}>Error Loading Business</Text>
      <Text style={styles.errorText}>{error || "We couldn't find the business you're looking for."}</Text>
      <TouchableOpacity style={styles.errorButton} onPress={onRetry}>
        <Text style={styles.errorButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
});

const Header: React.FC<{
  businessName: string;
  averageRating: number;
  reviewCount: number;
  isSaved: boolean;
  loadingSaved: boolean;
  onBack: () => void;
  onToggleSave: () => void;
}> = memo(({ businessName, averageRating, reviewCount, isSaved, loadingSaved, onBack, onToggleSave }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={colors.headerText} />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.businessName} numberOfLines={1}>{businessName}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={colors.warning} />
          <Text style={styles.ratingText}>{`${averageRating.toFixed(1)} (${reviewCount} reviews)`}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.headerButton} onPress={onToggleSave} disabled={loadingSaved}>
        {loadingSaved ? (
          <ActivityIndicator size="small" color={colors.headerText} />
        ) : (
          <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={24} color={colors.headerText} />
        )}
      </TouchableOpacity>
    </View>
  );
});

const Banner: React.FC<{ photos: string[] | undefined }> = memo(({ photos }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.bannerContainer}>
      {photos && photos.length > 0 ? (
        <Image source={{ uri: photos[0] }} style={styles.bannerImage} resizeMode="cover" />
      ) : (
        <View style={styles.placeholderBanner}>
          <Ionicons name="business" size={48} color={colors.textSecondary} />
          <Text style={styles.placeholderText}>No image available</Text>
        </View>
      )}
    </View>
  );
});

const QuickActions: React.FC<{ onCall: () => void; onDirections: () => void; onWebsite: () => void; onEmail: () => void }> = memo(
  ({ onCall, onDirections, onWebsite, onEmail }) => {
    const { colors, createStyles } = useTheme();
    const styles = createStyles(localStyles);
    const actions = [
      { icon: 'call', label: 'Call', handler: onCall },
      { icon: 'navigate', label: 'Directions', handler: onDirections },
      { icon: 'globe', label: 'Website', handler: onWebsite },
      { icon: 'mail', label: 'Email', handler: onEmail },
    ];

    return (
      <View style={styles.quickActions}>
        {actions.map((action) => (
          <TouchableOpacity key={action.label} style={styles.quickActionButton} onPress={action.handler}>
            <View style={styles.quickActionIcon}>
              <Ionicons name={action.icon as any} size={22} color={colors.primary} />
            </View>
            <Text style={styles.quickActionText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }
);

const DetailSection: React.FC<{ icon: any; title: string; children: React.ReactNode }> = memo(({ icon, title, children }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={22} color={colors.text} style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
});

const RecentReviewItem: React.FC<{ item: UserReview }> = memo(({ item }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Ionicons key={i} name={i < rating ? 'star' : 'star-outline'} size={14} color={colors.warning} />
    ));

  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <View style={styles.recentReviewCard}>
      <View style={styles.recentReviewHeader}>
        <View style={styles.recentReviewRating}>{renderStars(item.rating)}</View>
        <Text style={styles.recentReviewDate}>{formatDate(item.createdAt)}</Text>
      </View>
      <Text style={styles.recentReviewComment} numberOfLines={3}>{item.comment}</Text>
    </View>
  );
});

const ReviewsSection: React.FC<{
  reviews: UserReview[];
  loading: boolean;
  onWriteReview: () => void;
}> = memo(({ reviews, loading, onWriteReview }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);

  return (
    <View style={styles.reviewsContainer}>
      <View style={styles.reviewsHeader}>
        <View>
          <Text style={styles.reviewsTitle}>Recent Reviews</Text>
          {reviews.length > 0 && (
            <Text style={styles.reviewsSubtitle}>{`Latest ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.writeReviewButton} onPress={onWriteReview}>
          <Ionicons name="add" size={16} color={colors.headerText} style={{ marginRight: 4 }} />
          <Text style={styles.writeReviewText}>Write Review</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingReviewsContainer}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingReviewsText}>Loading reviews...</Text>
        </View>
      ) : reviews.length > 0 ? (
        <View style={styles.reviewsList}>
          {reviews.map((review) => <RecentReviewItem key={review.id} item={review} />)}
          <TouchableOpacity
            style={styles.viewAllReviewsButton}
            onPress={() => Alert.alert('Coming Soon', 'View all reviews feature will be available soon!')}
          >
            <Text style={styles.viewAllReviewsText}>View All Reviews</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.noReviewsContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.textSecondary} />
          <Text style={styles.noReviewsText}>No Reviews Yet</Text>
          <Text style={styles.noReviewsSubtext}>Be the first to review this business!</Text>
        </View>
      )}
    </View>
  );
});

// --- Main Component ---

export default function BusinessDetailsScreen({ route }: BusinessDetailsScreenProps) {
  const { businessId, business: initialBusiness } = route.params || {};
  const navigation = useNavigation<BusinessDetailsScreenNavigationProp>();
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);

  const { business, loading, error, reviews, loadingReviews, isSaved, loadingSaved, actions } = useBusinessDetailsScreen(
    businessId,
    initialBusiness
  );

  if (loading) return <LoadingState />;
  if (error || !business) return <ErrorState error={error?.toString()} onRetry={() => navigation.goBack()} />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Header
          businessName={business.name}
          averageRating={business.averageRating}
          reviewCount={business.reviewCount || 0}
          isSaved={isSaved}
          loadingSaved={loadingSaved}
          onBack={() => navigation.goBack()}
          onToggleSave={actions.toggleSaved}
        />
        <Banner photos={business.photos} />
        <QuickActions
          onCall={actions.handleCall}
          onDirections={actions.handleDirections}
          onWebsite={actions.handleWebsite}
          onEmail={actions.handleFeedback}
        />

        <View style={styles.detailsContainer}>
          <DetailSection icon="information-circle" title="About">
            <Text style={styles.description}>{business.description}</Text>
          </DetailSection>

          <DetailSection icon="location" title="Location">
            <Text style={styles.address}>
              {`${business.location.address}\n${business.location.city}, ${business.location.state} ${business.location.zipCode}`}
            </Text>
          </DetailSection>

          {business.hours && (
            <DetailSection icon="time" title="Hours">
              <View style={styles.hoursContainer}>
                {Object.entries(business.hours).map(([day, hoursInfo]) => {
                  const hoursText = (typeof hoursInfo === 'object' && !hoursInfo.closed && hoursInfo.open && hoursInfo.close)
                    ? `${hoursInfo.open} - ${hoursInfo.close}`
                    : "Closed";
                  return (
                    <View key={day} style={styles.hourRow}>
                      <Text style={styles.hourDay}>{day}</Text>
                      <Text style={styles.hourTime}>{hoursText}</Text>
                    </View>
                  );
                })}
              </View>
            </DetailSection>
          )}

          <DetailSection icon="accessibility" title="Accessibility Features">
            <View style={styles.tagsContainer}>
              {business.accessibilityFeatures?.length > 0 ? (
                business.accessibilityFeatures.map((feature, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{feature}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No accessibility features listed.</Text>
              )}
            </View>
          </DetailSection>
        </View>

        <ReviewsSection reviews={reviews} loading={loadingReviews} onWriteReview={actions.handleWriteReview} />
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.header,
  },
  headerTitleContainer: { flex: 1, alignItems: 'center', marginHorizontal: 8 },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary + '40',
  },
  businessName: { fontSize: 20, fontWeight: 'bold', color: colors.headerText, marginBottom: 4, textAlign: 'center' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, color: colors.headerText, marginLeft: 5 },
  bannerContainer: { width: '100%', height: 200 },
  bannerImage: { width: '100%', height: '100%' },
  placeholderBanner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  placeholderText: { marginTop: 8, fontSize: 16, color: colors.textSecondary },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quickActionButton: { alignItems: 'center', padding: 8 },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: colors.primary + '20',
  },
  quickActionText: { fontSize: 12, fontWeight: '500', color: colors.primary },
  detailsContainer: { padding: 16 },
  section: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionIcon: { marginRight: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  description: { fontSize: 16, lineHeight: 24, color: colors.textSecondary },
  address: { fontSize: 16, lineHeight: 24, color: colors.textSecondary },
  hoursContainer: { marginTop: 8 },
  hourRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  hourDay: { fontSize: 16, fontWeight: '500', color: colors.text, width: 100 },
  hourTime: { fontSize: 16, color: colors.textSecondary },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.primary + '20' },
  tagText: { fontSize: 14, fontWeight: '500', color: colors.primary },
  noDataText: { fontSize: 16, fontStyle: 'italic', color: colors.textSecondary },
  reviewsContainer: { padding: 16 },
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  reviewsTitle: { fontSize: 20, fontWeight: '600', color: colors.text },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  writeReviewText: { color: 'white', fontWeight: '600', fontSize: 14 },
  noReviewsContainer: { padding: 24, borderRadius: 12, alignItems: 'center', backgroundColor: colors.surface },
  noReviewsText: { fontSize: 18, fontWeight: '600', marginTop: 12, marginBottom: 4, color: colors.text },
  noReviewsSubtext: { fontSize: 14, textAlign: 'center', color: colors.textSecondary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { fontSize: 16, marginTop: 16, color: colors.textSecondary },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: colors.background },
  errorTitle: { fontSize: 20, fontWeight: '600', marginTop: 16, marginBottom: 8, color: colors.notification },
  errorText: { fontSize: 16, textAlign: 'center', marginBottom: 24, color: colors.textSecondary },
  errorButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, backgroundColor: colors.primary },
  errorButtonText: { color: colors.headerText, fontWeight: '600', fontSize: 16 },
  recentReviewCard: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: colors.card, borderColor: colors.border },
  recentReviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  recentReviewRating: { flexDirection: 'row', gap: 2 },
  starColor: { color: colors.warning },
  recentReviewDate: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  recentReviewComment: { fontSize: 14, lineHeight: 20, color: colors.text },
  reviewsSubtitle: { fontSize: 12, marginTop: 2, color: colors.textSecondary },
  loadingReviewsContainer: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
  },
  loadingReviewsText: { fontSize: 14, color: colors.textSecondary },
  reviewsList: { marginTop: 16 },
  viewAllReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    gap: 6,
    borderColor: colors.border,
  },
  viewAllReviewsText: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
