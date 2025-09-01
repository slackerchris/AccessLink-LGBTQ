import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useBusinessReviewsManagement } from '../../hooks/useBusinessReviewsManagement';
import { ReviewResponseModal } from './ReviewResponseModal';
import { formatTimestamp } from '../../utils/dateUtils';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import { BusinessListing } from '../../types/business';
import { Review } from '../../types/review';

// --- Memoized Sub-components ---

const Header: React.FC<{ onBack: () => void; onSwap: () => void; showSwap: boolean }> = React.memo(({ onBack, onSwap, showSwap }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={styles.headerTitle.color as string} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Reviews Management</Text>
      {showSwap ? (
        <TouchableOpacity style={styles.headerButton} onPress={onSwap}>
          <Ionicons name="swap-horizontal" size={24} color={styles.headerTitle.color as string} />
        </TouchableOpacity>
      ) : <View style={{ width: 24 }} />}
    </View>
  );
});

const CenteredMessage: React.FC<{ icon: keyof typeof Ionicons.glyphMap; title: string; message: string; children?: React.ReactNode }> = React.memo(({ icon, title, message, children }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.centeredMessage}>
      <Ionicons name={icon} size={64} color={styles.messageTitle.color as string} />
      <Text style={styles.messageTitle}>{title}</Text>
      <Text style={styles.messageText}>{message}</Text>
      {children}
    </View>
  );
});

const Stars: React.FC<{ rating: number }> = React.memo(({ rating }) => {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row' }}>
      {[...Array(5)].map((_, i) => (
        <Ionicons key={i} name={i < Math.round(rating) ? 'star' : 'star-outline'} size={16} color={colors.primary} />
      ))}
    </View>
  );
});

const RatingBar: React.FC<{ rating: number; count: number; total: number }> = React.memo(({ rating, count, total }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={styles.ratingBarContainer}>
      <Text style={styles.ratingLabel}>{rating}</Text>
      <Ionicons name="star" size={14} color={styles.ratingLabel.color as string} />
      <View style={styles.ratingBarBackground}>
        <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.ratingCount}>{count}</Text>
    </View>
  );
});

const StatsCard: React.FC<{ stats: any }> = React.memo(({ stats }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.statsCard}>
      <View style={styles.overallRating}>
        <Text style={styles.averageRating}>{stats.averageRating.toFixed(1)}</Text>
        <Stars rating={stats.averageRating} />
        <Text style={styles.totalReviews}>{stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}</Text>
      </View>
      <View style={styles.ratingsBreakdown}>
        {[5, 4, 3, 2, 1].map(r => <RatingBar key={r} rating={r} count={stats.ratingsBreakdown[r]} total={stats.totalReviews} />)}
      </View>
    </View>
  );
});

const ReviewCard: React.FC<{ review: Review; onRespond: (review: Review) => void }> = React.memo(({ review, onRespond }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>{review.userName || 'Anonymous'}</Text>
        <Stars rating={review.rating} />
      </View>
      <Text style={styles.reviewDate}>{formatTimestamp(review.createdAt)}</Text>
      <Text style={styles.reviewContent}>{review.comment}</Text>
      {review.businessResponse && (
        <View style={styles.businessResponseContainer}>
          <View style={styles.responseHeader}>
            <Ionicons name="storefront-outline" size={16} color={styles.responseAuthorName.color as string} />
            <Text style={styles.responseAuthorName}>{review.businessResponse.businessOwnerName}</Text>
          </View>
          <Text style={styles.responseDate}>{formatTimestamp(review.businessResponse.createdAt)}</Text>
          <Text style={styles.responseContent}>{review.businessResponse.message}</Text>
          {review.businessResponse.updatedAt > review.businessResponse.createdAt && <Text style={styles.editedIndicator}>(edited)</Text>}
        </View>
      )}
      <View style={styles.reviewActions}>
        <TouchableOpacity style={styles.respondButton} onPress={() => onRespond(review)}>
          <Ionicons name={review.businessResponse ? "pencil-outline" : "chatbubble-outline"} size={16} color={styles.respondButtonText.color as string} />
          <Text style={styles.respondButtonText}>{review.businessResponse ? 'Edit Response' : 'Respond'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const BusinessSelectorModal: React.FC<{ visible: boolean; onClose: () => void; businesses: BusinessListing[]; onSelect: (business: BusinessListing) => void; }> = React.memo(({ visible, onClose, businesses, onSelect }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select a Business</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color={styles.modalTitle.color as string} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={businesses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.businessItem} onPress={() => onSelect(item)}>
                <Text style={styles.businessItemName}>{item.name}</Text>
                <Text style={styles.businessItemCategory}>{item.category}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
});

// --- Main Component ---

const BusinessReviewsManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const {
    user,
    isBizUser,
    businesses,
    businessesLoading,
    selectedBusiness,
    showBusinessSelector,
    setShowBusinessSelector,
    reviews,
    loadingReviews,
    refreshing,
    responseModalVisible,
    setResponseModalVisible,
    selectedReview,
    handleRefresh,
    handleResponseSubmitted,
    handleBusinessSelection,
    handleRespondToReview,
    reviewStats,
  } = useBusinessReviewsManagement();

  if (!isBizUser) {
    return (
      <SafeAreaView style={styles.container}>
        <CenteredMessage icon="lock-closed-outline" title="Access Denied" message="This section is for business owners and managers only." />
      </SafeAreaView>
    );
  }

  if (businessesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <CenteredMessage icon="hourglass-outline" title="Loading" message="Loading your businesses..." />
      </SafeAreaView>
    );
  }

  if (businesses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <CenteredMessage icon="business-outline" title="No Businesses Found" message="You need a registered business to manage reviews.">
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AddBusiness' as never)}>
            <Text style={styles.actionButtonText}>Register a Business</Text>
          </TouchableOpacity>
        </CenteredMessage>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header onBack={() => navigation.goBack()} onSwap={() => setShowBusinessSelector(true)} showSwap={businesses.length > 1} />

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.selectedBusinessContainer} onPress={() => setShowBusinessSelector(true)}>
          <Text style={styles.selectedBusinessName}>{selectedBusiness?.name || 'Select a Business'}</Text>
          <Ionicons name="chevron-down" size={20} color={styles.selectedBusinessName.color as string} />
        </TouchableOpacity>

        {loadingReviews ? (
          <View style={styles.centeredMessage}><ActivityIndicator size="large" /></View>
        ) : (
          <>
            <StatsCard stats={reviewStats} />
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            {reviews.length === 0 ? (
              <CenteredMessage icon="chatbubble-ellipses-outline" title="No Reviews Yet" message="Encourage your customers to leave a review!" />
            ) : (
              reviews.map((review) => <ReviewCard key={review.id} review={review} onRespond={handleRespondToReview} />)
            )}
          </>
        )}
      </ScrollView>

      {selectedReview && user && (
        <ReviewResponseModal
          visible={responseModalVisible}
          onClose={() => setResponseModalVisible(false)}
          review={selectedReview}
          businessOwnerId={user.uid}
          businessOwnerName={user.displayName || 'Business Owner'}
          onResponseSubmitted={handleResponseSubmitted}
        />
      )}

      <BusinessSelectorModal
        visible={showBusinessSelector}
        onClose={() => setShowBusinessSelector(false)}
        businesses={businesses}
        onSelect={handleBusinessSelection}
      />
    </SafeAreaView>
  );
};

const localStyles = (colors: ThemeColors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: 45, paddingBottom: 15 },
    headerButton: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.headerText },
    content: { flex: 1, padding: 16 },
    centeredMessage: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    messageTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginTop: 16, marginBottom: 8, textAlign: 'center' },
    messageText: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
    actionButton: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 20 },
    actionButtonText: { color: colors.headerText, fontSize: 16, fontWeight: '600' },
    selectedBusinessContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
    selectedBusinessName: { fontSize: 18, fontWeight: '600', color: colors.text },
    statsCard: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
    overallRating: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    averageRating: { fontSize: 40, fontWeight: 'bold', color: colors.text },
    totalReviews: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
    ratingsBreakdown: { flex: 2, marginLeft: 16 },
    ratingBarContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    ratingLabel: { width: 15, fontSize: 14, color: colors.text },
    ratingBarBackground: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.border, marginHorizontal: 8 },
    ratingBarFill: { height: '100%', borderRadius: 4, backgroundColor: colors.primary },
    ratingCount: { fontSize: 12, color: colors.textSecondary, minWidth: 20, textAlign: 'right' },
    sectionTitle: { fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 16 },
    reviewCard: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    reviewerName: { fontSize: 16, fontWeight: '600', color: colors.text },
    reviewDate: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },
    reviewContent: { fontSize: 14, color: colors.text, lineHeight: 20 },
    businessResponseContainer: { backgroundColor: colors.surface, borderRadius: 8, padding: 12, marginTop: 12, borderWidth: 1, borderColor: colors.border },
    responseHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    responseAuthorName: { fontWeight: '600', color: colors.primary },
    responseDate: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },
    responseContent: { fontSize: 14, color: colors.textSecondary, fontStyle: 'italic' },
    editedIndicator: { fontSize: 11, color: colors.textSecondary, fontStyle: 'italic', textAlign: 'right', marginTop: 4 },
    reviewActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
    respondButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primaryMuted, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
    respondButtonText: { color: colors.primary, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: colors.shadow + '99', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    businessItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    businessItemName: { fontSize: 18, color: colors.text },
    businessItemCategory: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
});

export default BusinessReviewsManagementScreen;
