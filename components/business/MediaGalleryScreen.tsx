/**
 * Modern Media Gallery Management Screen for Business Owners
 * Clean, Instagram-inspired interface for photo management
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
  Modal,
  StatusBar,
  Platform,
  TextInput,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useBusinessActions } from '../../hooks/useFirebaseAuth';
import { photoUploadService } from '../../services/photoUploadService';
import { useTheme } from '../../hooks/useTheme';

const { width: screenWidth } = Dimensions.get('window');
const photoSize = (screenWidth - 48) / 3; // 3 photos per row with padding

interface MediaItem {
  id: string;
  uri: string;
  title: string;
  description: string;
  category: 'accessibility' | 'interior' | 'exterior' | 'menu' | 'staff' | 'event' | 'other';
  featured: boolean;
  uploadedAt: string;
}

interface MediaGalleryScreenProps {
  navigation: any;
}

export const MediaGalleryScreen: React.FC<MediaGalleryScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { getMyBusinesses } = useBusinessActions();
  
  const [userBusiness, setUserBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Load user's business
  useEffect(() => {
    const loadBusiness = async () => {
      try {
        console.log('📸 MediaGallery: Loading business for user ID:', user?.uid);
        const businesses = await getMyBusinesses();
        console.log('📸 MediaGallery: Found', businesses.length, 'businesses');
        if (businesses.length > 0) {
          setUserBusiness(businesses[0]); // Get the first business
          console.log('📸 MediaGallery: Set business:', businesses[0].name, 'ID:', businesses[0].id);
          console.log('📸 MediaGallery: Current photos in business:', (businesses[0] as any).photos?.length || 0);
        } else {
          console.log('📸 MediaGallery: No businesses found for user');
        }
      } catch (error) {
        console.error('📸 MediaGallery: Error loading business:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadBusiness();
    } else {
      console.log('📸 MediaGallery: No user found, cannot load business');
    }
  }, [user?.uid]); // Only depend on user ID, not the full user object
  
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other' as MediaItem['category'],
    featured: false
  });

  const categories = [
    { key: 'all', label: 'All Media', icon: 'images' },
    { key: 'interior', label: 'Interior', icon: 'home' },
    { key: 'exterior', label: 'Exterior', icon: 'storefront' },
    { key: 'accessibility', label: 'Accessibility', icon: 'accessibility' },
    { key: 'events', label: 'Events', icon: 'calendar' },
    { key: 'menu', label: 'Menu/Services', icon: 'restaurant' },
    { key: 'staff', label: 'Staff', icon: 'people' },
    { key: 'other', label: 'Other', icon: 'folder' }
  ];

  useEffect(() => {
    loadMediaItems();
  }, [userBusiness]);

  const loadMediaItems = async () => {
    if (userBusiness?.id) {
      try {
        console.log('📸 MediaGallery: Loading media items for business:', userBusiness.name);
        
        // Load photos from the business's photos array
        const businessPhotos = (userBusiness as any).photos || [];
        console.log('📸 MediaGallery: Found', businessPhotos.length, 'photos in business');
        
        // Convert business photos to MediaItem format
        const businessMedia: MediaItem[] = businessPhotos.map((photoUrl: string, index: number) => ({
          id: `existing-${Date.now()}-${index}`,
          uri: photoUrl,
          title: `Business Photo ${index + 1}`,
          description: 'Uploaded business photo',
          category: 'other' as const,
          uploadedAt: new Date().toISOString(),
          featured: false
        }));
        
        console.log('📸 MediaGallery: Converted to', businessMedia.length, 'media items');
        setMediaItems(businessMedia);
      } catch (error) {
        console.error('📸 MediaGallery: Error loading media:', error);
        setMediaItems([]); // Set empty array on error
      }
    } else {
      console.log('📸 MediaGallery: No business ID, setting empty media items');
      setMediaItems([]);
    }
  };

  const filteredMedia = selectedCategory === 'all' 
    ? mediaItems 
    : mediaItems.filter(item => item.category === selectedCategory);

  const handleAddMedia = () => {
    console.log('📸 MediaGallery: Add Media button clicked');
    console.log('📸 MediaGallery: Current userBusiness:', userBusiness);
    console.log('📸 MediaGallery: Business ID:', userBusiness?.id);
    
    if (!userBusiness?.id) {
      console.log('❌ MediaGallery: No business ID found');
      Alert.alert('Error', 'No business account found. Please ensure you are logged in as a business owner.');
      return;
    }

    // Use React Native Alert for photo selection
    Alert.alert(
      'Add Media',
      'Choose how you want to add a photo',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => handleMediaSelection('camera-photo') },
        { text: 'Choose Photo', onPress: () => handleMediaSelection('photo') }
      ]
    );
  };

  const handleMediaSelection = async (type: string) => {
    console.log('📸 MediaGallery: Starting photo upload for business:', userBusiness?.id);
    console.log('📸 MediaGallery: Selection type:', type);
    
    if (!userBusiness?.id) {
      console.log('❌ MediaGallery: No business ID in handleMediaSelection');
      Alert.alert('Error', 'No business account found. Please ensure you are logged in as a business owner.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('📸 MediaGallery: About to call selectPhotoSource');

      // Use our photo upload service to select and upload photo
      const imageResult = await photoUploadService.selectPhotoSource();
      console.log('📸 MediaGallery: Image selection result:', imageResult);
      
      if (!imageResult || imageResult.canceled || !imageResult.assets?.[0]) {
        console.log('📸 MediaGallery: Image selection was canceled or failed');
        setIsLoading(false);
        return;
      }

      const selectedImage = imageResult.assets[0];
      console.log('📸 MediaGallery: Selected image:', selectedImage.uri);
      
      // Upload to Firebase Storage
      console.log('📸 MediaGallery: Starting Firebase upload...');
      const uploadResult = await photoUploadService.uploadBusinessPhoto(
        userBusiness.id,
        selectedImage.uri,
        'gallery'
      );
      console.log('📸 MediaGallery: Upload result:', uploadResult);

      if (uploadResult.success && uploadResult.downloadURL) {
        console.log('📸 MediaGallery: Upload successful, creating media item');
        // Create new media item with real Firebase URL
        const newMediaItem: MediaItem = {
          id: `media-${Date.now()}`,
          uri: uploadResult.downloadURL,
          title: 'New Photo',
          description: 'Recently uploaded business photo',
          category: 'other',
          uploadedAt: new Date().toISOString(),
          featured: false
        };

        console.log('📸 MediaGallery: Adding media item to state:', newMediaItem);
        // Add to local state
        setMediaItems(prev => {
          console.log('📸 MediaGallery: Previous media items:', prev.length);
          const updated = [newMediaItem, ...prev];
          console.log('📸 MediaGallery: Updated media items:', updated.length);
          return updated;
        });
        
        // Open edit modal for the new item
        setEditingItem(newMediaItem);
        setFormData({
          title: newMediaItem.title,
          description: newMediaItem.description || '',
          category: newMediaItem.category,
          featured: newMediaItem.featured
        });
        setIsModalVisible(true);
        
        Alert.alert('Success', 'Photo uploaded successfully! You can now edit the details.');
      } else {
        console.log('❌ MediaGallery: Upload failed:', uploadResult.error);
        throw new Error(uploadResult.error || 'Upload failed');
      }

    } catch (error) {
      console.error('❌ MediaGallery: Upload error:', error);
      Alert.alert(
        'Upload Failed',
        error instanceof Error ? error.message : 'Failed to upload photo. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMedia = (item: MediaItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category,
      featured: item.featured
    });
    setIsModalVisible(true);
  };

  const handleSaveMedia = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please provide a title for this media');
      return;
    }

    if (!userBusiness?.id) return;

    setIsLoading(true);
    try {
      if (editingItem) {
        // Update existing media
        const updatedItem = {
          ...editingItem,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          featured: formData.featured
        };
        
        // For now, just update local state
        // In the future, this would save to the real database
        setMediaItems(prev => prev.map(item => 
          item.id === editingItem.id ? updatedItem : item
        ));
      }

      setIsModalVisible(false);
      Alert.alert('Success', `Media ${editingItem ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Error saving media:', error);
      Alert.alert('Error', 'Failed to save media. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMedia = (mediaId: string) => {
    Alert.alert(
      'Delete Media',
      'Are you sure you want to delete this media item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!userBusiness?.id) return;
            
            try {
              // For now, just remove from local state
              // In the future, this would delete from the real database
              setMediaItems(prev => prev.filter(item => item.id !== mediaId));
              Alert.alert('Success', 'Media deleted successfully!');
            } catch (error) {
              console.error('Error deleting media:', error);
              Alert.alert('Error', 'Failed to delete media. Please try again.');
            }
          }
        }
      ]
    );
  };

  const toggleFeatured = async (mediaId: string) => {
    if (!userBusiness?.id) return;
    
    const mediaItem = mediaItems.find(item => item.id === mediaId);
    if (!mediaItem) return;

    try {
      // For now, just update local state
      // In the future, this would save to the real database
      setMediaItems(prev => prev.map(item => 
        item.id === mediaId ? { ...item, featured: !item.featured } : item
      ));
    } catch (error) {
      console.error('Error toggling featured status:', error);
      Alert.alert('Error', 'Failed to update featured status. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Media Gallery</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userBusiness) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Media Gallery</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>No Business Found</Text>
          <Text style={styles.errorText}>
            You don't have a business profile associated with your account.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading gallery...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      {/* Modern Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Gallery</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {mediaItems.length} {mediaItems.length === 1 ? 'photo' : 'photos'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddMedia}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="add" size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {/* Photo Grid */}
      {mediaItems.length > 0 ? (
        <FlatList
          data={filteredMedia}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.photoItem}
              onPress={() => {
                setEditingItem(item);
                setFormData({
                  title: item.title,
                  description: item.description || '',
                  category: item.category,
                  featured: item.featured
                });
                setIsModalVisible(true);
              }}
            >
              <Image source={{ uri: item.uri }} style={styles.photo} />
              {item.featured && (
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                </View>
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          numColumns={3}
          style={styles.photoGrid}
          contentContainerStyle={styles.photoGridContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
            <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Photos Yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Start building your gallery by adding photos that showcase your business
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: colors.primary }]}
            onPress={handleAddMedia}
          >
            <Ionicons name="camera" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.emptyButtonText}>Add Your First Photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Edit Media Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Media' : 'Add Media'}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSaveMedia}
              disabled={isLoading}
            >
              <Text style={[styles.modalButtonText, styles.saveButton, isLoading && styles.disabledButton]}>
                {isLoading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                placeholder="Enter media title..."
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Describe what this media shows..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categorySelector}>
                  {categories.slice(1).map((category) => (
                    <TouchableOpacity
                      key={category.key}
                      style={[
                        styles.categorySelectorItem,
                        formData.category === category.key && styles.categorySelectorItemActive
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, category: category.key as MediaItem['category'] }))}
                    >
                      <Ionicons 
                        name={category.icon as any} 
                        size={20} 
                        color={formData.category === category.key ? '#fff' : '#6366f1'} 
                      />
                      <Text style={[
                        styles.categorySelectorText,
                        formData.category === category.key && styles.categorySelectorTextActive
                      ]}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <TouchableOpacity
                style={styles.featuredToggle}
                onPress={() => setFormData(prev => ({ ...prev, featured: !prev.featured }))}
              >
                <View style={styles.featuredToggleLeft}>
                  <Ionicons name="star" size={20} color="#fbbf24" />
                  <View>
                    <Text style={styles.featuredToggleTitle}>Featured Media</Text>
                    <Text style={styles.featuredToggleSubtitle}>
                      Show this prominently in your business profile
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.toggle,
                  formData.featured && styles.toggleActive
                ]}>
                  <View style={[
                    styles.toggleThumb,
                    formData.featured && styles.toggleThumbActive
                  ]} />
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    minHeight: 64,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photoGrid: {
    flex: 1,
  },
  photoGridContent: {
    padding: 16,
  },
  photoItem: {
    width: photoSize,
    height: photoSize,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Error state styles
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Modal styles for edit photo modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#6366f1',
  },
  saveButton: {
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#6366f1',
  },
  modalButtonSecondary: {
    backgroundColor: '#f3f4f6',
  },
  modalButtonTextPrimary: {
    color: 'white',
  },
  modalButtonTextSecondary: {
    color: '#6b7280',
  },
  // Form styles
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categorySelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  categorySelectorItemActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categorySelectorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366f1',
  },
  categorySelectorTextActive: {
    color: '#fff',
  },
  featuredToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  featuredToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  featuredToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  featuredToggleSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#10b981',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
});
