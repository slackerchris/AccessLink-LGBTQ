import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  FlatList,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Modal } from '../common/FixedModal';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useCreateReview, PhotoUpload } from '../../hooks/useCreateReview';

type CreateReviewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateReview'>;
type CreateReviewScreenRouteProp = RouteProp<RootStackParamList, 'CreateReview'>;

interface CreateReviewScreenProps {
  navigation: CreateReviewScreenNavigationProp;
  route: CreateReviewScreenRouteProp;
}

const availableAccessibilityTags = [
  'Wheelchair Accessible', 'Wide Doorways', 'Accessible Bathroom', 'Braille Menus',
  'Sign Language Friendly', 'Quiet Environment', 'Good Lighting', 'Easy Navigation',
  'Accessible Parking', 'Elevator Access', 'Audio Descriptions', 'Staff Assistance Available'
];

const photoCategories = [
  { value: 'accessibility', label: 'Accessibility Features', icon: 'accessibility-outline' },
  { value: 'interior', label: 'Interior', icon: 'home-outline' },
  { value: 'exterior', label: 'Exterior', icon: 'business-outline' },
  { value: 'menu', label: 'Menu/Signage', icon: 'restaurant-outline' },
  { value: 'staff', label: 'Staff/Service', icon: 'people-outline' },
  { value: 'event', label: 'Events', icon: 'calendar-outline' },
  { value: 'other', label: 'Other', icon: 'images-outline' }
];

const ScreenHeader = React.memo(({ onGoBack }: { onGoBack: () => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onGoBack}>
        <Ionicons name="arrow-back" size={24} color={colors.headerText} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Write Review</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
});

const BusinessInfo = React.memo(({ businessName }: { businessName: string }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.businessInfo}>
      <Text style={styles.businessName}>{businessName}</Text>
      <Text style={styles.reviewPrompt}>Share your experience</Text>
    </View>
  );
});

const RatingSection = React.memo(({ rating, onRate }: { rating: number, onRate: (r: number) => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Rating *</Text>
      <View style={styles.starsContainer}>
        {[0, 1, 2, 3, 4].map((index) => (
          <TouchableOpacity key={index} onPress={() => onRate(index + 1)} style={styles.starButton}>
            <Ionicons
              name={index < rating ? 'star' : 'star-outline'}
              size={32}
              color={index < rating ? colors.warning : colors.border}
            />
          </TouchableOpacity>
        ))}
      </View>
      {rating > 0 && (
        <Text style={styles.ratingText}>
          {rating} star{rating !== 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );
});

const ReviewInput = React.memo(({ comment, setComment }: { comment: string, setComment: (c: string) => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Your Review *</Text>
      <TextInput
        style={styles.reviewInput}
        placeholder="Share your experience with this business..."
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
  );
});

const PhotoItem = React.memo(({ item, onEdit, onRemove }: { item: PhotoUpload, onEdit: () => void, onRemove: () => void }) => {
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.photoContainer}>
      <Image source={{ uri: item.uri }} style={styles.photoImage} />
      <View style={styles.photoOverlay}>
        <TouchableOpacity style={styles.photoEditButton} onPress={onEdit}>
          <Ionicons name="create-outline" size={16} color={colors.headerText} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoRemoveButton} onPress={onRemove}>
          <Ionicons name="close" size={16} color={colors.headerText} />
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
});

const PhotosSection = React.memo(({ photos, onAdd, onEdit, onRemove }: { photos: PhotoUpload[], onAdd: () => void, onEdit: (item: PhotoUpload) => void, onRemove: (id: string) => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <TouchableOpacity onPress={onAdd} style={styles.addPhotoButton}>
          <Ionicons name="camera" size={20} color={colors.primary} />
          <Text style={styles.addPhotoText}>Add Photo</Text>
        </TouchableOpacity>
      </View>
      
      {photos.length > 0 ? (
        <FlatList
          data={photos}
          renderItem={({ item }) => (
            <PhotoItem
              item={item}
              onEdit={() => onEdit(item)}
              onRemove={() => onRemove(item.id)}
            />
          )
          }
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
  );
});

const AccessibilityTags = React.memo(({ selectedTags, onToggleTag }: { selectedTags: string[], onToggleTag: (tag: string) => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Accessibility Features</Text>
      <Text style={styles.sectionSubtitle}>Tag accessibility features you experienced</Text>
      <View style={styles.tagsContainer}>
        {availableAccessibilityTags.map(tag => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tagItem,
              selectedTags.includes(tag) && styles.tagItemSelected
            ]}
            onPress={() => onToggleTag(tag)}
          >
            <Text style={[
              styles.tagText,
              selectedTags.includes(tag) && styles.tagTextSelected
            ]}>
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

const SubmitFooter = React.memo(({ isSubmitting, onSubmit }: { isSubmitting: boolean, onSubmit: () => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={colors.headerText} />
        ) : (
          <Text style={styles.submitButtonText}>Submit Review</Text>
        )}
      </TouchableOpacity>
    </View>
  );
});

const PhotoDetailsModal = React.memo(({ visible, onClose, onSave, editingPhoto, setEditingPhoto }: any) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  
  if (!editingPhoto) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Photo Details</Text>
          <TouchableOpacity onPress={onSave}>
            <Text style={styles.modalSaveButton}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          <Image source={{ uri: editingPhoto.uri }} style={styles.modalPhoto} />
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Caption</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Add a caption for this photo..."
              value={editingPhoto.caption}
              onChangeText={(text) => setEditingPhoto({ ...editingPhoto, caption: text })}
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
                  onPress={() => setEditingPhoto({ ...editingPhoto, category: category.value })}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={20}
                    color={editingPhoto.category === category.value ? colors.headerText : colors.textSecondary}
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
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
});

export default function CreateReviewScreen({ navigation, route }: CreateReviewScreenProps) {
  const { businessId, businessName } = route.params;
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const {
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
  } = useCreateReview(businessId, businessName);

  const handleSaveModal = () => {
    if (editingPhoto) {
      handleSavePhotoDetails({
        caption: editingPhoto.caption,
        category: editingPhoto.category
      });
    }
  };

  const handleEditPhoto = (item: PhotoUpload) => {
    setEditingPhoto(item);
    setShowPhotoModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader onGoBack={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <BusinessInfo businessName={businessName} />
        <RatingSection rating={rating} onRate={handleRatingPress} />
        <ReviewInput comment={comment} setComment={setComment} />
        <PhotosSection 
          photos={photos}
          onAdd={handleAddPhoto}
          onEdit={handleEditPhoto}
          onRemove={handleRemovePhoto}
        />
        <AccessibilityTags selectedTags={accessibilityTags} onToggleTag={toggleAccessibilityTag} />
      </ScrollView>

      <SubmitFooter isSubmitting={isSubmitting} onSubmit={handleSubmitReview} />

      <PhotoDetailsModal
        visible={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onSave={handleSaveModal}
        editingPhoto={editingPhoto}
        setEditingPhoto={setEditingPhoto}
      />
    </SafeAreaView>
  );
}

const localStyles = (colors: ThemeColors) => StyleSheet.create({
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
    backgroundColor: colors.header,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.headerText,
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
    textAlign: 'center',
    marginBottom: 8,
    color: colors.text,
  },
  reviewPrompt: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.textSecondary,
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
    marginBottom: 12,
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    color: colors.textSecondary,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starButton: {
    marginHorizontal: 4,
  },
  ratingText: {
    fontSize: 14,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: colors.card,
    borderColor: colors.border,
    color: colors.text,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
    color: colors.textSecondary,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 8,
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  addPhotoText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
  },
  photosContainer: {
    paddingVertical: 8,
  },
  photoContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    marginRight: 12,
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
    backgroundColor: colors.shadow + '99',
    borderRadius: 12,
    padding: 4,
  },
  photoRemoveButton: {
    backgroundColor: colors.notification + 'CC',
    borderRadius: 12,
    padding: 4,
  },
  noPhotosContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 16,
    borderColor: colors.border,
  },
  noPhotosText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    color: colors.text,
  },
  noPhotosSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    color: colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagItem: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  tagItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  tagTextSelected: {
    color: colors.headerText,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    backgroundColor: colors.card,
    borderTopColor: colors.border,
  },
  submitButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.headerText,
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
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalSaveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
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
    marginBottom: 8,
    color: colors.text,
  },
  modalTextInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    borderColor: colors.border,
    color: colors.text,
    backgroundColor: colors.card,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: colors.surface,
    borderColor: colors.border,
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
    color: colors.headerText,
  },
  photoCaptionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.shadow + 'B3',
    padding: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  photoCaption: {
    color: colors.headerText,
    fontSize: 12,
    textAlign: 'center',
  },
  photoCategoryBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.shadow + '99',
  },
  photoCategoryText: {
    color: colors.headerText,
    fontSize: 10,
    fontWeight: '500',
  },
});