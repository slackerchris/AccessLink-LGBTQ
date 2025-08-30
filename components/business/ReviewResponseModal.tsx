/**
 * Business Review Response Modal
 * Allows business owners to respond to customer reviews
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { 
  createBusinessResponse, 
  updateBusinessResponse, 
  getBusinessResponseByReviewId,
  BusinessResponse 
} from '../../services/businessResponseService';

interface ReviewResponseModalProps {
  visible: boolean;
  onClose: () => void;
  review: {
    id: string;
    businessId: string;
    userName?: string;
    rating: number;
    comment: string;
    createdAt: any;
  };
  businessOwnerId: string;
  businessOwnerName: string;
  onResponseSubmitted: () => void;
}

export const ReviewResponseModal: React.FC<ReviewResponseModalProps> = ({
  visible,
  onClose,
  review,
  businessOwnerId,
  businessOwnerName,
  onResponseSubmitted,
}) => {
  const { colors } = useTheme();
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingResponse, setExistingResponse] = useState<BusinessResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load existing response when modal opens
  useEffect(() => {
    if (visible && review.id) {
      loadExistingResponse();
    }
  }, [visible, review.id]);

  const loadExistingResponse = async () => {
    try {
      const response = await getBusinessResponseByReviewId(review.id);
      if (response) {
        setExistingResponse(response);
        setResponseMessage(response.message);
        setIsEditing(false);
      } else {
        setExistingResponse(null);
        setResponseMessage('');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error loading existing response:', error);
    }
  };

  const handleSubmit = async () => {
    if (!responseMessage.trim()) {
      Alert.alert('Error', 'Please enter a response message.');
      return;
    }

    if (responseMessage.trim().length < 10) {
      Alert.alert('Error', 'Response must be at least 10 characters long.');
      return;
    }

    if (responseMessage.trim().length > 1000) {
      Alert.alert('Error', 'Response must be less than 1000 characters.');
      return;
    }

    setLoading(true);

    try {
      if (existingResponse) {
        // Update existing response
        await updateBusinessResponse(existingResponse.id, responseMessage.trim());
        Alert.alert('Success', 'Your response has been updated!');
      } else {
        // Create new response
        await createBusinessResponse({
          reviewId: review.id,
          businessId: review.businessId,
          businessOwnerId,
          businessOwnerName,
          message: responseMessage.trim(),
        });
        Alert.alert('Success', 'Your response has been posted!');
      }

      setResponseMessage('');
      setIsEditing(false);
      onResponseSubmitted();
      onClose();
    } catch (error) {
      console.error('Error submitting response:', error);
      Alert.alert('Error', 'Failed to submit response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (existingResponse && !isEditing) {
      // Just viewing existing response
      onClose();
    } else if (existingResponse && isEditing) {
      // Cancel editing, restore original message
      setResponseMessage(existingResponse.message);
      setIsEditing(false);
    } else {
      // Cancel new response
      setResponseMessage('');
      onClose();
    }
  };

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

  const canEdit = !existingResponse || isEditing;
  const showEditButton = existingResponse && !isEditing;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={colors.headerText} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: colors.headerText }]}>
            {existingResponse ? (isEditing ? 'Edit Response' : 'Your Response') : 'Respond to Review'}
          </Text>
          
          {showEditButton ? (
            <TouchableOpacity 
              onPress={() => setIsEditing(true)} 
              style={[styles.headerButton, styles.editButton]}
            >
              <Ionicons name="pencil" size={20} color={colors.headerText} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerButton} />
          )}
        </View>

        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Original Review */}
            <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Customer Review</Text>
              
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAuthor}>
                  <Text style={[styles.reviewerName, { color: colors.text }]}>
                    {review.userName || 'Anonymous Customer'}
                  </Text>
                  <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
                    {formatDate(review.createdAt)}
                  </Text>
                </View>
                <View style={styles.reviewRating}>
                  {renderStars(review.rating)}
                </View>
              </View>
              
              <Text style={[styles.reviewComment, { color: colors.text }]}>
                {review.comment}
              </Text>
            </View>

            {/* Response Section */}
            <View style={[styles.responseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {existingResponse ? 'Your Response' : 'Write Your Response'}
              </Text>
              
              {existingResponse && !isEditing ? (
                // Display existing response
                <View style={styles.existingResponse}>
                  <View style={styles.responseHeader}>
                    <Text style={[styles.businessOwnerName, { color: colors.text }]}>
                      {existingResponse.businessOwnerName}
                    </Text>
                    <Text style={[styles.responseDate, { color: colors.textSecondary }]}>
                      {formatDate(existingResponse.createdAt)}
                    </Text>
                  </View>
                  <Text style={[styles.responseText, { color: colors.text }]}>
                    {existingResponse.message}
                  </Text>
                  {existingResponse.updatedAt !== existingResponse.createdAt && (
                    <Text style={[styles.editedIndicator, { color: colors.textSecondary }]}>
                      (edited)
                    </Text>
                  )}
                </View>
              ) : (
                // Response input
                <View style={styles.responseInput}>
                  <TextInput
                    style={[
                      styles.textInput,
                      { 
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text,
                      }
                    ]}
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
                    <Text style={[styles.characterCount, { color: colors.textSecondary }]}>
                      {responseMessage.length}/1000 characters
                    </Text>
                    
                    <View style={styles.inputHints}>
                      <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
                        💡 Be professional and address their concerns
                      </Text>
                      <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
                        🤝 Thank them for their feedback
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          {canEdit && (
            <View style={[styles.actionButtons, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                onPress={handleCancel}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.submitButton, 
                  { backgroundColor: colors.primary },
                  loading && styles.buttonDisabled
                ]}
                onPress={handleSubmit}
                disabled={loading || !responseMessage.trim()}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color="#ffffff" />
                    <Text style={[styles.buttonText, { color: '#ffffff' }]}>
                      {existingResponse ? 'Update Response' : 'Post Response'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
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
  },
  responseCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
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
  },
  responseDate: {
    fontSize: 12,
  },
  responseText: {
    fontSize: 14,
    lineHeight: 20,
  },
  editedIndicator: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
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
  },
  inputFooter: {
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 8,
  },
  inputHints: {
    gap: 4,
  },
  inputHint: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
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
  },
  submitButton: {
    // backgroundColor set dynamically
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
