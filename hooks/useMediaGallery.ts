/**
 * Hook for Media Gallery Management Screen
 */
import { useState, useEffect, useMemo } from 'react';
import { Alert, Dimensions } from 'react-native';
import { useAuth, useBusiness } from './useFirebaseAuth';
import { useTheme } from './useTheme';
import { BusinessListing } from '../types/business';
import { MediaItem, MediaCategory } from '../types/media';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useBusinessMedia } from './useBusinessMedia';

const { width: screenWidth } = Dimensions.get('window');
const photoSize = (screenWidth - 48) / 3; // 3 photos per row with padding

type MediaGalleryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MediaGallery'
>;

export const useMediaGallery = (navigation: MediaGalleryScreenNavigationProp) => {
  const { userProfile } = useAuth();
  const { businesses, loading: businessLoading } = useBusiness();
  const { colors, isDarkMode, shadows } = useTheme();
  
  const [userBusiness, setUserBusiness] = useState<BusinessListing | null>(null);

  useEffect(() => {
    if (businesses.length > 0) {
      setUserBusiness(businesses[0]);
    } else {
      setUserBusiness(null);
    }
  }, [businesses]);

  const { 
    mediaItems, 
    loading: mediaLoading, 
    error: mediaError, 
    addMedia, 
    updateMedia, 
    deleteMedia,
    refreshMedia,
  } = useBusinessMedia(userBusiness?.id || null);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | 'all'>('all');
  
  const [formData, setFormData] = useState<Partial<Omit<MediaItem, 'id' | 'uri' | 'uploadedAt'>>>({
    title: '',
    description: '',
    category: 'other',
    featured: false
  });

  const categories: { key: MediaCategory | 'all'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All Media', icon: 'images' },
    { key: 'interior', label: 'Interior', icon: 'home' },
    { key: 'exterior', label: 'storefront' as any, icon: 'storefront' as any },
    { key: 'accessibility', label: 'Accessibility', icon: 'accessibility' },
    { key: 'event', label: 'Events', icon: 'calendar' },
    { key: 'menu', label: 'Menu/Services', icon: 'restaurant' },
    { key: 'staff', label: 'Staff', icon: 'people' },
    { key: 'other', label: 'Other', icon: 'folder' }
  ];

  const filteredMedia = useMemo(() => selectedCategory === 'all' 
    ? mediaItems 
    : mediaItems.filter(item => item.category === selectedCategory), [mediaItems, selectedCategory]);

  const handleAddMedia = async () => {
    if (!userBusiness) {
      Alert.alert('Error', 'No business account found.');
      return;
    }
    await addMedia(userBusiness);
  };

  const handleEditMedia = (item: MediaItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      featured: item.featured
    });
    setIsModalVisible(true);
  };

  const handleSaveMedia = async () => {
    if (!formData.title?.trim()) {
      Alert.alert('Error', 'Please provide a title for this media');
      return;
    }

    if (!editingItem) return;

    try {
      await updateMedia(editingItem.id, formData);
      setIsModalVisible(false);
      setEditingItem(null);
      Alert.alert('Success', 'Media updated successfully!');
    } catch (error) {
      console.error('Error saving media:', error);
      Alert.alert('Error', 'Failed to save media. Please try again.');
    }
  };

  const handleDeleteMedia = (item: MediaItem) => {
    Alert.alert(
      'Delete Media',
      'Are you sure you want to delete this photo? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!userBusiness) return;
            try {
              await deleteMedia(userBusiness, item);
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

  return {
    navigation,
    userProfile,
    businesses,
    businessLoading,
    colors,
    isDarkMode,
    shadows,
    userBusiness,
    mediaItems,
    mediaLoading,
    mediaError,
    addMedia,
    updateMedia,
    deleteMedia,
    refreshMedia,
    isModalVisible,
    setIsModalVisible,
    editingItem,
    setEditingItem,
    selectedCategory,
    setSelectedCategory,
    formData,
    setFormData,
    categories,
    filteredMedia,
    handleAddMedia,
    handleEditMedia,
    handleSaveMedia,
    handleDeleteMedia,
    photoSize,
  };
};
