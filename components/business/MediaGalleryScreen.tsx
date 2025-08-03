/**
 * Media Gallery Management Screen for Business Owners
 * Allows businesses to upload and manage photos/videos showcasing their facilities
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
  TextInput,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useBusinessActions } from '../../hooks/useWebAuth';

const { width: screenWidth } = Dimensions.get('window');

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
        console.log('Loading business for user:', user); // Debug log
        const businesses = await getMyBusinesses();
        console.log('Found businesses:', businesses); // Debug log
        if (businesses.length > 0) {
          setUserBusiness(businesses[0]); // Get the first business
          console.log('Set userBusiness to:', businesses[0]); // Debug log
        } else {
          console.log('No businesses found for user'); // Debug log
        }
      } catch (error) {
        console.error('Error loading business:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadBusiness();
    } else {
      console.log('No user found, cannot load business'); // Debug log
    }
  }, [user, getMyBusinesses]);
  
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
        // For now, use placeholder media items
        // In the future, this would fetch from the real database
        const businessMedia: MediaItem[] = [];
        setMediaItems(businessMedia);
      } catch (error) {
        console.error('Error loading media:', error);
      }
    }
  };

  const filteredMedia = selectedCategory === 'all' 
    ? mediaItems 
    : mediaItems.filter(item => item.category === selectedCategory);

  const handleAddMedia = () => {
    console.log('Add Media button clicked!'); // Debug log
    
    // For web compatibility, let's implement proper file selection
    if (typeof window !== 'undefined') {
      // We're on web - create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,video/*'; // Accept both images and videos
      input.multiple = false; // Single file selection for now
      
      input.onchange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
          console.log('File selected:', file.name, file.type, file.size);
          handleFileUpload(file);
        }
      };
      
      input.click(); // Trigger file selection dialog
    } else {
      // Native - use Alert
      Alert.alert(
        'Add Media',
        'Choose media type to upload',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: () => handleMediaSelection('camera-photo') },
          { text: 'Choose Photo', onPress: () => handleMediaSelection('photo') },
          { text: 'Choose Video', onPress: () => handleMediaSelection('video') }
        ]
      );
    }
  };

  const handleFileUpload = async (file: File) => {
    console.log('Processing file upload:', file.name, file.type);
    
    if (!userBusiness?.id) {
      console.log('No userBusiness found:', userBusiness);
      Alert.alert('Error', 'No business account found. Please ensure you are logged in as a business owner.');
      return;
    }

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      Alert.alert('Error', 'Please select an image or video file.');
      return;
    }

    // Validate file size (limit to 10MB for demo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      Alert.alert('Error', 'File size must be less than 10MB.');
      return;
    }

    try {
      // Create a preview URL for the file
      const previewUrl = URL.createObjectURL(file);
      
      console.log('Creating new media item with preview URL:', previewUrl);
      
      // Create new media item
      const newMediaItem: MediaItem = {
        id: `media-${Date.now()}`,
        uri: previewUrl,
        title: file.name.split('.')[0] || 'New Media', // Use filename without extension as title
        description: `Uploaded ${isImage ? 'image' : 'video'}: ${file.name}`,
        category: 'other',
        uploadedAt: new Date().toISOString(),
        featured: false
      };

      // Add to local state (in a real app, this would upload to server/cloud storage)
      setMediaItems(prev => [newMediaItem, ...prev]);
      
      // Open edit modal for the new item
      setEditingItem(newMediaItem);
      setFormData({
        title: newMediaItem.title,
        description: newMediaItem.description || '',
        category: newMediaItem.category,
        featured: newMediaItem.featured
      });
      setIsModalVisible(true);
      
      Alert.alert('Success', `${isImage ? 'Image' : 'Video'} uploaded successfully! You can now edit the details.`);
      
    } catch (error) {
      console.error('Error processing file:', error);
      Alert.alert('Error', 'Failed to process the selected file. Please try again.');
    }
  };

  const handleMediaSelection = async (type: string) => {
    console.log('Media selection called with type:', type); // Debug log
    if (!userBusiness?.id) {
      console.log('No userBusiness found:', userBusiness); // Debug log
      return;
    }

    console.log('Creating new media item...'); // Debug log
    // Simulate media selection and upload
    const newMediaItem: MediaItem = {
      id: `media-${Date.now()}`,
      uri: type.includes('video') 
        ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      title: 'New Media',
      description: 'Recently uploaded',
      category: 'other',
      uploadedAt: new Date().toISOString(),
      featured: false
    };

    try {
      // For now, just add to local state
      // In the future, this would save to the real database
      setMediaItems(prev => [newMediaItem, ...prev]);
      
      // Open edit modal for the new item
      setEditingItem(newMediaItem);
      setFormData({
        title: newMediaItem.title,
        description: newMediaItem.description || '',
        category: newMediaItem.category,
        featured: newMediaItem.featured
      });
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error uploading media:', error);
      Alert.alert('Error', 'Failed to upload media. Please try again.');
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

  const renderMediaItem = ({ item }: { item: MediaItem }) => {
    const isVideo = item.uri.includes('.mp4') || item.uri.includes('video');
    
    if (viewMode === 'grid') {
      return (
        <TouchableOpacity 
          style={styles.gridItem}
          onPress={() => handleEditMedia(item)}
        >
          <Image source={{ uri: item.uri }} style={styles.gridImage} />
          {isVideo && (
            <View style={styles.videoOverlay}>
              <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.9)" />
            </View>
          )}
          {item.featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={16} color="#fff" />
            </View>
          )}
          <View style={styles.gridInfo}>
            <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.gridCategory}>{categories.find(c => c.key === item.category)?.label}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        style={styles.listItem}
        onPress={() => handleEditMedia(item)}
      >
        <Image source={{ uri: item.uri }} style={styles.listImage} />
        {isVideo && (
          <View style={styles.listVideoOverlay}>
            <Ionicons name="play-circle" size={24} color="rgba(255,255,255,0.9)" />
          </View>
        )}
        <View style={styles.listInfo}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{item.title}</Text>
            {item.featured && <Ionicons name="star" size={16} color="#fbbf24" />}
          </View>
          <Text style={styles.listDescription} numberOfLines={2}>
            {item.description || 'No description'}
          </Text>
          <View style={styles.listMeta}>
            <Text style={styles.listCategory}>
              {categories.find(c => c.key === item.category)?.label}
            </Text>
            <Text style={styles.listDate}>
              {new Date(item.uploadedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.listActions}
          onPress={() => handleDeleteMedia(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
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
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Ionicons 
              name={viewMode === 'grid' ? 'list' : 'grid'} 
              size={20} 
              color="#fff" 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleAddMedia}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={styles.categoryFilterContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryChip,
              selectedCategory === category.key && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={16} 
              color={selectedCategory === category.key ? '#fff' : '#6366f1'} 
            />
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category.key && styles.categoryChipTextActive
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Media Stats */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {filteredMedia.length} {filteredMedia.length === 1 ? 'item' : 'items'}
          {selectedCategory !== 'all' && ` in ${categories.find(c => c.key === selectedCategory)?.label}`}
        </Text>
        <Text style={styles.statsText}>
          {mediaItems.filter(item => item.featured).length} featured
        </Text>
      </View>

      {/* Media Grid/List */}
      <FlatList
        data={filteredMedia}
        renderItem={renderMediaItem}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
        style={styles.mediaList}
        contentContainerStyle={styles.mediaListContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No media yet</Text>
            <Text style={styles.emptySubtitle}>
              Start building your gallery by adding photos and videos that showcase your business
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleAddMedia}
            >
              <Text style={styles.emptyButtonText}>Add Media</Text>
            </TouchableOpacity>
          </View>
        }
      />

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
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryFilter: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
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
  categoryChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366f1',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  mediaList: {
    flex: 1,
  },
  mediaListContent: {
    padding: 20,
  },
  gridItem: {
    flex: 0.5,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    padding: 4,
  },
  gridInfo: {
    padding: 12,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  gridCategory: {
    fontSize: 12,
    color: '#6b7280',
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  listVideoOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
  },
  listInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  listDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  listMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listCategory: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  listDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  listActions: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
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
});
