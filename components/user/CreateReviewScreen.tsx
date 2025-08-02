/**
 * Create Review Screen with Photo Upload
 * Allows users to write reviews and upload photos for businesses
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  SafeAreaView,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useAuthActions } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

const { width: screenWidth } = Dimensions.get('window');

interface PhotoUpload {
  id: string;
  uri: string;
  caption: string;
  category: 'accessibility' | 'interior' | 'exterior' | 'menu' | 'staff' | 'event' | 'other';
}

interface CreateReviewScreenProps {
  navigation: any;
  route: {
    params: {
      businessId: string;
      businessName: string;
    };
  };
}

export default function CreateReviewScreen({ navigation, route }: CreateReviewScreenProps) {
  const { businessId, businessName } = route.params;
  const { userProfile } = useAuth();
  const { addReview } = useAuthActions();
  const { colors } = useTheme();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [accessibilityTags, setAccessibilityTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoUpload | null>(null);

  // Available accessibility tags
  const availableAccessibilityTags = [
    'Wheelchair Accessible',
    'Wide Doorways',
    'Accessible Bathroom',
    'Braille Menus',
    'Sign Language Friendly',
    'Quiet Environment',
    'Good Lighting', 
    'Easy Navigation',
    'Accessible Parking',
    'Elevator Access',
    'Audio Descriptions',
    'Staff Assistance Available'
  ];

  // Photo categories
  const photoCategories = [
    { value: 'accessibility', label: 'Accessibility Features', icon: 'accessibility-outline' },
    { value: 'interior', label: 'Interior', icon: 'home-outline' },
    { value: 'exterior', label: 'Exterior', icon: 'business-outline' },
    { value: 'menu', label: 'Menu/Signage', icon: 'restaurant-outline' },
    { value: 'staff', label: 'Staff/Service', icon: 'people-outline' },
    { value: 'event', label: 'Events', icon: 'calendar-outline' },
    { value: 'other', label: 'Other', icon: 'images-outline' }
  ];

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleAddPhoto = () => {
    // Simulate photo picker
    Alert.alert(
      'Add Photo',
      'Choose how to add a photo',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => simulatePhotoCapture('camera') },
        { text: 'Photo Library', onPress: () => simulatePhotoCapture('library') }
      ]
    );
  };

  const simulatePhotoCapture = (source: 'camera' | 'library') => {
    // Simulate photo capture/selection
    const samplePhotos = [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80', // Restaurant interior
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80', // Restaurant exterior
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', // Restaurant tables
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80', // Accessibility ramp
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&q=80'  // Menu board
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
  };

  const handleSavePhotoDetails = (photoDetails: { caption: string; category: string }) => {
    if (!editingPhoto) return;

    setPhotos(prev => prev.map(photo => 
      photo.id === editingPhoto.id 
        ? { ...photo, ...photoDetails, category: photoDetails.category as PhotoUpload['category'], }
        : photo
    ));
    setEditingPhoto(null);
    setShowPhotoModal(false);
  };

  const handleRemovePhoto = (photoId: string) => {
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
  };

  const toggleAccessibilityTag = (tag: string) => {
    setAccessibilityTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting your review.');
      return;
    }

    if (comment.trim().length === 0) {
      Alert.alert('Review Required', 'Please write a review before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convert photos to the expected format
      const reviewPhotos = photos.map(photo => ({
        uri: photo.uri,
        caption: photo.caption,
        category: photo.category
      }));

      await addReview(businessId, rating, comment.trim(), reviewPhotos, accessibilityTags);
      
      Alert.alert(
        'Review Submitted! ⭐',
        'Thank you for sharing your experience with the community. Your review helps other users find inclusive businesses.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Submission Error', 'Failed to submit review. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStar = (index: number) => (
    <TouchableOpacity
      key={index}
      onPress={() => handleRatingPress(index + 1)}
      style={styles.starButton}
    >
      <Ionicons
        name={index < rating ? 'star' : 'star-outline'}
        size={32}
        color={index < rating ? '#fbbf24' : colors.border}
      />
    </TouchableOpacity>
  );

  const renderPhoto = ({ item }: { item: PhotoUpload }) => (
    <View style={styles.photoContainer}>
      <Image source={{ uri: item.uri }} style={styles.photoImage} />
      <View style={styles.photoOverlay}>
        <TouchableOpacity
          style={styles.photoEditButton}
          onPress={() => {
            setEditingPhoto(item);
            setShowPhotoModal(true);
          }}
        >
          <Ionicons name="create-outline" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.photoRemoveButton}
          onPress={() => handleRemovePhoto(item.id)}
        >
          <Ionicons name="close" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      {item.caption && (
        <View style={styles.photoCaptionContainer}>
          <Text style={styles.photoCaption} numberOfLines={2}>{item.caption}</Text>
        </View>
      )}
      <View style={styles.photoCategoryBadge}>
        <Text style={styles.photoCategoryText}>
          {photoCategories.find(cat => cat.value === item.category)?.label || 'Other'}
        </Text>
      </View>
    </View>
  );

  const renderPhotoModal = () => (
    <Modal visible={showPhotoModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowPhotoModal(false)}>
            <Text style={styles.modalCancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Photo Details</Text>
          <TouchableOpacity onPress={() => {
            if (editingPhoto) {
              handleSavePhotoDetails({
                caption: editingPhoto.caption,
                category: editingPhoto.category
              });
            }
          }}>
            <Text style={styles.modalSaveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {editingPhoto && (
            <>
              <Image source={{ uri: editingPhoto.uri }} style={styles.modalPhoto} />
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Caption</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="Add a caption for this photo..."
                  value={editingPhoto.caption}
                  onChangeText={(text) => setEditingPhoto(prev => prev ? { ...prev, caption: text } : null)}
                  multiline
                  maxLength={200}
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Category</Text>
                <View style={styles.categoryGrid}>
                  {photoCategories.map(category => (
                    <TouchableOpacity
                      key={category.value}
                      style={[
                        styles.categoryItem,
                        editingPhoto.category === category.value && styles.categoryItemSelected
                      ]}
                      onPress={() => setEditingPhoto(prev => prev ? { ...prev, category: category.value as PhotoUpload['category'] } : null)}
                    >
                      <Ionicons 
                        name={category.icon as any} 
                        size={20} 
                        color={editingPhoto.category === category.value ? colors.primary : colors.textSecondary} 
                      />
                      <Text style={[
                        styles.categoryItemText,
                        editingPhoto.category === category.value && styles.categoryItemTextSelected
                      ]}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    headerSpacer: {
      width: 24,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    businessInfo: {
      alignItems: 'center',
      marginBottom: 32,
    },
    businessName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    reviewPrompt: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    section: {
      marginBottom: 32,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    starsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 8,
    },
    starButton: {
      marginHorizontal: 4,
    },
    ratingLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.card,
      minHeight: 120,
      textAlignVertical: 'top',
    },
    addPhotoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      gap: 8,
    },
    addPhotoText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.primary,
    },
    photosGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 16,
    },
    photoContainer: {
      position: 'relative',
      width: 100,
      height: 100,
    },
    photoImage: {
      width: '100%',
      height: '100%',
      borderRadius: 8,
    },
    photoOverlay: {
      position: 'absolute',
      top: 4,
      right: 4,
      flexDirection: 'row',
      gap: 4,
    },
    photoEditButton: {
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 12,
      padding: 4,
    },
    photoRemoveButton: {
      backgroundColor: 'rgba(239,68,68,0.8)',
      borderRadius: 12,
      padding: 4,
    },
    noPhotosContainer: {
      alignItems: 'center',
      paddingVertical: 40,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: 12,
      marginTop: 16,
    },
    noPhotosText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginTop: 12,
    },
    noPhotosSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    accessibilityTagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    accessibilityTag: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    accessibilityTagSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    accessibilityTagText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    accessibilityTagTextSelected: {
      color: '#FFFFFF',
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 32,
      marginBottom: 20,
    },
    submitButtonDisabled: {
      backgroundColor: colors.surface,
    },
    submitButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    submitButtonTextDisabled: {
      color: colors.textSecondary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      margin: 20,
      maxWidth: 400,
      width: '100%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    captionInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.background,
      marginBottom: 16,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 24,
    },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 6,
    },
    categoryItemSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryItemText: {
      fontSize: 14,
      color: colors.text,
    },
    categoryItemTextSelected: {
      color: '#FFFFFF',
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    modalButtonPrimary: {
      backgroundColor: colors.primary,
    },
    modalButtonSecondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    modalButtonTextPrimary: {
      color: '#FFFFFF',
    },
    modalButtonTextSecondary: {
      color: colors.text,
    },
    photoCaptionContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: 4,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
    },
    photoCaption: {
      color: '#FFFFFF',
      fontSize: 12,
      textAlign: 'center',
    },
    photoCategoryBadge: {
      position: 'absolute',
      top: 4,
      left: 4,
      backgroundColor: colors.primary,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    photoCategoryText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '500',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalCancelButton: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    modalSaveButton: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    modalPhoto: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginBottom: 16,
    },
    modalSection: {
      marginBottom: 20,
    },
    modalSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    modalTextInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.card,
    },
    ratingText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    reviewInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      minHeight: 120,
      textAlignVertical: 'top',
    },
    characterCount: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'right',
      marginTop: 4,
    },
    photosContainer: {
      padding: 16,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tagItem: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    tagItemSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tagText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    tagTextSelected: {
      color: '#FFFFFF',
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>Write Review</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.businessInfo}>
          <Text style={[styles.businessName, { color: colors.text }]}>{businessName}</Text>
          <Text style={[styles.reviewPrompt, { color: colors.textSecondary }]}>Share your experience</Text>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Rating *</Text>
          <View style={styles.starsContainer}>
            {[0, 1, 2, 3, 4].map(renderStar)}
          </View>
          {rating > 0 && (
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {rating} star{rating !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Review Text Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Review *</Text>
          <TextInput
            style={[styles.reviewInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="Share your experience with this business. How was the accessibility? What did you like most?"
            placeholderTextColor={colors.textSecondary}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{comment.length}/1000</Text>
        </View>

        {/* Photos Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <TouchableOpacity onPress={handleAddPhoto} style={styles.addPhotoButton}>
              <Ionicons name="camera" size={20} color={colors.primary} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
          
          {photos.length > 0 ? (
            <FlatList
              data={photos}
              renderItem={renderPhoto}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosContainer}
            />
          ) : (
            <View style={styles.noPhotosContainer}>
              <Ionicons name="images-outline" size={40} color={colors.border} />
              <Text style={styles.noPhotosText}>Add photos to help other users</Text>
              <Text style={styles.noPhotosSubtext}>
                Show accessibility features, atmosphere, or anything helpful
              </Text>
            </View>
          )}
        </View>

        {/* Accessibility Tags Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility Features</Text>
          <Text style={styles.sectionSubtitle}>Tag accessibility features you experienced</Text>
          <View style={styles.tagsContainer}>
            {availableAccessibilityTags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagItem,
                  accessibilityTags.includes(tag) && styles.tagItemSelected
                ]}
                onPress={() => toggleAccessibilityTag(tag)}
              >
                <Text style={[
                  styles.tagText,
                  accessibilityTags.includes(tag) && styles.tagTextSelected
                ]}>
                  {tag}
                </Text>
                {accessibilityTags.includes(tag) && (
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton, 
            { backgroundColor: colors.primary },
            isSubmitting && { backgroundColor: colors.border }
          ]}
          onPress={handleSubmitReview}
          disabled={isSubmitting}
        >
          <Text style={[styles.submitButtonText, { color: '#ffffff' }]}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {renderPhotoModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  businessInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  reviewPrompt: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    color: '#1f2937',
  },
  characterCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6366f1',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  photosContainer: {
    paddingVertical: 8,
  },
  photoContainer: {
    width: 120,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  photoImage: {
    width: '100%',
    height: 80,
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
  },
  photoEditButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  photoRemoveButton: {
    backgroundColor: 'rgba(239,68,68,0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCaptionContainer: {
    padding: 8,
    paddingBottom: 4,
  },
  photoCaption: {
    fontSize: 11,
    color: '#4b5563',
    lineHeight: 14,
  },
  photoCategoryBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    margin: 8,
    marginTop: 0,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  photoCategoryText: {
    fontSize: 10,
    color: '#6366f1',
    fontWeight: '500',
  },
  noPhotosContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  noPhotosText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 4,
  },
  noPhotosSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  tagItemSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#ede9fe',
  },
  tagText: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 4,
  },
  tagTextSelected: {
    color: '#6366f1',
    fontWeight: '500',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
    minHeight: 56, // Ensure good touch target
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalSaveButton: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 24,
    resizeMode: 'cover',
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    minWidth: 100,
  },
  categoryItemSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#ede9fe',
  },
  categoryItemText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  categoryItemTextSelected: {
    color: '#6366f1',
    fontWeight: '500',
  },
});
