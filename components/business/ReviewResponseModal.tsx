import React, { useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import { useReviewResponse } from '../../hooks/useReviewResponse';
import { Review } from '../../types/review';
import { formatTimestamp } from '../../utils/dateUtils';

interface ReviewResponseModalProps {
  visible: boolean;
  onClose: () => void;
  review: Review;
  businessOwnerId: string;
  businessOwnerName: string;
  onResponseSubmitted: () => void;
}

const StarRating = memo(({ rating }: { rating: number }) => {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row' }}>
      {[...Array(5)].map((_, i) => (
        <Ionicons
          key={i}
          name={i < Math.round(rating) ? 'star' : 'star-outline'}
          size={14}
          color={i < Math.round(rating) ? '#fbbf24' : colors.border}
        />
      ))}
    </View>
  );
});

const ModalHeader = memo(({ isEditing, existingResponse, onCancel, onEdit }: { isEditing: boolean, existingResponse: any, onCancel: () => void, onEdit: () => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const showEditButton = existingResponse && !isEditing;

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
        <Ionicons name="close" size={24} color={colors.headerText} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {existingResponse ? (isEditing ? 'Edit Response' : 'Your Response') : 'Respond to Review'}
      </Text>
      {showEditButton ? (
        <TouchableOpacity onPress={onEdit} style={[styles.headerButton, styles.editButton]}>
          <Ionicons name="pencil" size={20} color={colors.headerText} />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerButton} />
      )}
    </View>
  );
});

const ReviewDetailsCard = memo(({ review }: { review: Review }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.reviewCard}>
      <Text style={styles.cardTitle}>Customer Review</Text>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAuthor}>
          <Text style={styles.reviewerName}>{review.userName || 'Anonymous Customer'}</Text>
          <Text style={styles.reviewDate}>{formatTimestamp(review.createdAt)}</Text>
        </View>
        <StarRating rating={review.rating} />
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
    </View>
  );
});

const ResponseForm = memo(({ responseMessage, setResponseMessage }: { responseMessage: string, setResponseMessage: (text: string) => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.responseInput}>
      <TextInput
        style={styles.textInput}
        placeholder="Write a thoughtful response to this customer review..."
        placeholderTextColor={colors.textSecondary}
        value={responseMessage}
        onChangeText={setResponseMessage}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        maxLength={1000}
      />
      <View style={styles.inputFooter}>
        <Text style={styles.characterCount}>{responseMessage.length}/1000 characters</Text>
        <View style={styles.inputHints}>
          <Text style={styles.inputHint}>💡 Be professional and address their concerns</Text>
          <Text style={styles.inputHint}>🤝 Thank them for their feedback</Text>
        </View>
      </View>
    </View>
  );
});

const ExistingResponse = memo(({ response }: { response: any }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.existingResponse}>
      <View style={styles.responseHeader}>
        <Text style={styles.businessOwnerName}>{response.businessOwnerName}</Text>
        <Text style={styles.responseDate}>{formatTimestamp(response.createdAt)}</Text>
      </View>
      <Text style={styles.responseText}>{response.message}</Text>
      {response.updatedAt > response.createdAt && (
        <Text style={styles.editedIndicator}>(edited)</Text>
      )}
    </View>
  );
});

const ActionButtons = memo(({ onCancel, onSubmit, loading, disabled, submitText }: { onCancel: () => void, onSubmit: () => void, loading: boolean, disabled: boolean, submitText: string }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.actionButtons}>
      <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel} disabled={loading}>
        <Text style={[styles.buttonText, { color: colors.textSecondary }]}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.submitButton, (loading || disabled) && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading || disabled}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Ionicons name="send" size={16} color="#ffffff" />
            <Text style={[styles.buttonText, { color: '#ffffff' }]}>{submitText}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
});

export const ReviewResponseModal: React.FC<ReviewResponseModalProps> = ({
  visible,
  onClose,
  review,
  businessOwnerId,
  businessOwnerName,
  onResponseSubmitted,
}) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const {
    responseMessage,
    setResponseMessage,
    loading,
    existingResponse,
    isEditing,
    setIsEditing,
    handleSubmit,
    handleCancel,
  } = useReviewResponse(review, onResponseSubmitted, onClose);

  const canEdit = !existingResponse || isEditing;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <ModalHeader 
          isEditing={isEditing}
          existingResponse={existingResponse}
          onCancel={handleCancel}
          onEdit={() => setIsEditing(true)}
        />

        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <ReviewDetailsCard review={review} />

            <View style={styles.responseCard}>
              <Text style={styles.cardTitle}>
                {existingResponse ? 'Your Response' : 'Write Your Response'}
              </Text>
              
              {existingResponse && !isEditing ? (
                <ExistingResponse response={existingResponse} />
              ) : (
                <ResponseForm responseMessage={responseMessage} setResponseMessage={setResponseMessage} />
              )}
            </View>
          </ScrollView>

          {canEdit && (
            <ActionButtons 
              onCancel={handleCancel}
              onSubmit={() => handleSubmit(businessOwnerId, businessOwnerName)}
              loading={loading}
              disabled={!responseMessage.trim()}
              submitText={existingResponse ? 'Update Response' : 'Post Response'}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const localStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: colors.primary,
    borderBottomColor: colors.border,
  },
  headerButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.headerText,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  reviewCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  responseCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.text,
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
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: colors.text,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  existingResponse: {
    marginTop: 8,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  businessOwnerName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  responseDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  responseText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  editedIndicator: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
    color: colors.textSecondary,
  },
  responseInput: {
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
    lineHeight: 20,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    color: colors.text,
  },
  inputFooter: {
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 8,
    color: colors.textSecondary,
  },
  inputHints: {
    gap: 4,
  },
  inputHint: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ReviewResponseModal;
