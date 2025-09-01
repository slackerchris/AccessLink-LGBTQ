
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth as useFirebaseAuth } from './useFirebaseAuth';
import { addReview as addReviewToDb } from '../services/reviewService';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

export interface PhotoUpload {
  id: string;
  uri: string;
  caption: string;
  category: 'accessibility' | 'interior' | 'exterior' | 'menu' | 'staff' | 'event' | 'other';
}

type CreateReviewNavigationProp = StackNavigationProp<RootStackParamList, 'CreateReview'>;

export const useCreateReview = (businessId: string, businessName: string) => {
  const { user } = useFirebaseAuth();
  const navigation = useNavigation<CreateReviewNavigationProp>();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [accessibilityTags, setAccessibilityTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoUpload | null>(null);

  const handleRatingPress = useCallback((selectedRating: number) => {
    setRating(selectedRating);
  }, []);

  const handleAddPhoto = useCallback(() => {
    Alert.alert(
      'Add Photo',
      'Choose how to add a photo',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => simulatePhotoCapture('camera') },
        { text: 'Photo Library', onPress: () => simulatePhotoCapture('library') }
      ]
    );
  }, []);

  const simulatePhotoCapture = useCallback((source: 'camera' | 'library') => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&q=80'
    ];

    const randomPhoto = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    
    const newPhoto: PhotoUpload = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      uri: randomPhoto,
      caption: '',
      category: 'other'
    };

    setPhotos(prev => [...prev, newPhoto]);
    setEditingPhoto(newPhoto);
    setShowPhotoModal(true);
  }, []);

  const handleSavePhotoDetails = useCallback((photoDetails: { caption: string; category: string }) => {
    if (!editingPhoto) return;

    setPhotos(prev => prev.map(photo => 
      photo.id === editingPhoto.id 
        ? { ...photo, ...photoDetails, category: photoDetails.category as PhotoUpload['category'] }
        : photo
    ));
    setEditingPhoto(null);
    setShowPhotoModal(false);
  }, [editingPhoto]);

  const handleRemovePhoto = useCallback((photoId: string) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => setPhotos(prev => prev.filter(photo => photo.id !== photoId))
        }
      ]
    );
  }, []);

  const toggleAccessibilityTag = useCallback((tag: string) => {
    setAccessibilityTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const handleSubmitReview = useCallback(async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting your review.');
      return;
    }

    if (comment.trim().length === 0) {
      Alert.alert('Review Required', 'Please write a review before submitting.');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Error', 'You must be logged in to submit a review.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const reviewPhotos = photos.map(photo => photo.uri);

      await addReviewToDb({
        businessId,
        userId: user.uid,
        rating,
        comment: comment.trim(),
        photos: reviewPhotos,
        businessName,
        accessibilityTags,
      });
      
      Alert.alert(
        'Review Successfully Saved!',
        `Your review for ${businessName} has been saved.`,
        [
          { 
            text: 'Great!', 
            onPress: () => navigation.goBack()
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Failed to submit review:', error);
      Alert.alert(
        'Submission Error', 
        'Unable to save your review at this time. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [rating, comment, photos, accessibilityTags, user, businessId, businessName, navigation]);

  return {
    user,
    rating,
    comment,
    setComment,
    photos,
    accessibilityTags,
    isSubmitting,
    showPhotoModal,
    setShowPhotoModal,
    editingPhoto,
    setEditingPhoto,
    handleRatingPress,
    handleAddPhoto,
    handleSavePhotoDetails,
    handleRemovePhoto,
    toggleAccessibilityTag,
    handleSubmitReview,
  };
};
