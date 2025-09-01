import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { 
  createBusinessResponse, 
  updateBusinessResponse, 
  getBusinessResponseByReviewId,
  BusinessResponse 
} from '../services/businessResponseService';
import { Review } from '../types/review';

export const useReviewResponse = (
  review: Review | null,
  onResponseSubmitted: () => void,
  onClose: () => void
) => {
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingResponse, setExistingResponse] = useState<BusinessResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const loadExistingResponse = useCallback(async () => {
    if (review?.id) {
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
    }
  }, [review]);

  useEffect(() => {
    if (review) {
      loadExistingResponse();
    }
  }, [review, loadExistingResponse]);

  const handleSubmit = async (businessOwnerId: string, businessOwnerName: string) => {
    if (!review) return;

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
        await updateBusinessResponse(existingResponse.id, responseMessage.trim());
        Alert.alert('Success', 'Your response has been updated!');
      } else {
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
      onClose();
    } else if (existingResponse && isEditing) {
      setResponseMessage(existingResponse.message);
      setIsEditing(false);
    } else {
      setResponseMessage('');
      onClose();
    }
  };

  return {
    responseMessage,
    setResponseMessage,
    loading,
    existingResponse,
    isEditing,
    setIsEditing,
    handleSubmit,
    handleCancel,
  };
};
