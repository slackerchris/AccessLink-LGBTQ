/**
 * Media Gallery Management Screen for Business Owners - Test Version
 * Simplified version for Expo Go testing without Firebase
 */

import React, { useState, useMemo, memo } from 'react';
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
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

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

type MediaGalleryTestScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'BusinessManagement'
>;

interface MediaGalleryTestScreenProps {
  navigation: MediaGalleryTestScreenNavigationProp;
}

const categories = [
  { key: 'all', label: 'All Media', icon: 'images' as const },
  { key: 'interior', label: 'Interior', icon: 'home' as const },
  { key: 'exterior', label: 'Exterior', icon: 'storefront' as const },
  { key: 'accessibility', label: 'Accessibility', icon: 'accessibility' as const },
  { key: 'event', label: 'Events', icon: 'calendar' as const },
  { key: 'menu', label: 'Menu/Services', icon: 'restaurant' as const },
  { key: 'staff', label: 'Staff', icon: 'people' as const },
  { key: 'other', label: 'Other', icon: 'folder' as const }
];

const localStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      paddingTop: 10,
      paddingBottom: 15,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.headerText,
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
      alignItems: 'center',
      justifyContent: 'center',
    },
    categoryFilter: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    categoryFilterContent: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    categoryChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryChipText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.primary,
    },
    categoryChipTextActive: {
      color: colors.headerText,
    },
    statsBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statsText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    mediaList: {
      flex: 1,
    },
    mediaListContent: {
      padding: 12,
    },
    gridItem: {
      flex: 0.5,
      margin: 8,
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: colors.shadow,
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
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 4,
    },
    gridInfo: {
      padding: 12,
    },
    gridTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    gridCategory: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    listItem: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      shadowColor: colors.shadow,
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
      color: colors.text,
      flex: 1,
    },
    listDescription: {
      fontSize: 14,
      color: colors.textSecondary,
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
      color: colors.primary,
      fontWeight: '500',
    },
    listDate: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    listActions: {
      justifyContent: 'center',
      paddingLeft: 12,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      flex: 1,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      paddingHorizontal: 32,
      lineHeight: 20,
    },
    emptyButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    emptyButtonText: {
      color: colors.headerText,
      fontSize: 16,
      fontWeight: '600',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalButton: {
      padding: 8,
    },
    modalButtonText: {
      fontSize: 16,
      color: colors.primary,
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
      color: colors.text,
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
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.surface,
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    categorySelectorItemActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categorySelectorText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.primary,
    },
    categorySelectorTextActive: {
      color: colors.headerText,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.text,
    },
    featuredToggleSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
});

const Header = memo(({ navigation, viewMode, onToggleViewMode, onAdd }: { navigation: MediaGalleryTestScreenNavigationProp, viewMode: 'grid' | 'list', onToggleViewMode: () => void, onAdd: () => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.headerText} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Media Gallery (Test)</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerButton} onPress={onToggleViewMode}>
          <Ionicons name={viewMode === 'grid' ? 'list' : 'grid'} size={20} color={colors.headerText} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={onAdd}>
          <Ionicons name="add" size={24} color={colors.headerText} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const CategoryFilter = memo(({ selectedCategory, onSelectCategory }: { selectedCategory: string, onSelectCategory: (key: string) => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter} contentContainerStyle={styles.categoryFilterContent}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.key}
          style={[styles.categoryChip, selectedCategory === category.key && styles.categoryChipActive]}
          onPress={() => onSelectCategory(category.key)}
        >
          <Ionicons name={category.icon} size={16} color={selectedCategory === category.key ? colors.headerText : colors.primary} />
          <Text style={[styles.categoryChipText, selectedCategory === category.key && styles.categoryChipTextActive]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
});

const StatsBar = memo(({ filteredCount, totalFeaturedCount, selectedCategory }: { filteredCount: number, totalFeaturedCount: number, selectedCategory: string }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const categoryLabel = categories.find(c => c.key === selectedCategory)?.label;
  return (
    <View style={styles.statsBar}>
      <Text style={styles.statsText}>
        {filteredCount} {filteredCount === 1 ? 'item' : 'items'}
        {selectedCategory !== 'all' && ` in ${categoryLabel}`}
      </Text>
      <Text style={styles.statsText}>
        {totalFeaturedCount} featured
      </Text>
    </View>
  );
});

const MediaGridItem = memo(({ item, onEdit }: { item: MediaItem, onEdit: (item: MediaItem) => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const isVideo = item.uri.includes('.mp4') || item.uri.includes('video');
  const categoryLabel = categories.find(c => c.key === item.category)?.label;

  return (
    <TouchableOpacity style={styles.gridItem} onPress={() => onEdit(item)}>
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
        <Text style={styles.gridCategory}>{categoryLabel}</Text>
      </View>
    </TouchableOpacity>
  );
});

const MediaListItem = memo(({ item, onEdit, onDelete }: { item: MediaItem, onEdit: (item: MediaItem) => void, onDelete: (id: string) => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const isVideo = item.uri.includes('.mp4') || item.uri.includes('video');
  const categoryLabel = categories.find(c => c.key === item.category)?.label;

  return (
    <TouchableOpacity style={styles.listItem} onPress={() => onEdit(item)}>
      <Image source={{ uri: item.uri }} style={styles.listImage} />
      {isVideo && (
        <View style={styles.listVideoOverlay}>
          <Ionicons name="play-circle" size={24} color="rgba(255,255,255,0.9)" />
        </View>
      )}
      <View style={styles.listInfo}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{item.title}</Text>
          {item.featured && <Ionicons name="star" size={16} color={colors.primary} />}
        </View>
        <Text style={styles.listDescription} numberOfLines={2}>
          {item.description || 'No description'}
        </Text>
        <View style={styles.listMeta}>
          <Text style={styles.listCategory}>{categoryLabel}</Text>
          <Text style={styles.listDate}>{new Date(item.uploadedAt).toLocaleDateString()}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.listActions} onPress={() => onDelete(item.id)}>
        <Ionicons name="trash-outline" size={20} color={colors.notification} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const EmptyState = memo(({ onAdd }: { onAdd: () => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.emptyState}>
      <Ionicons name="images-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No media yet</Text>
      <Text style={styles.emptySubtitle}>
        Start building your gallery by adding photos and videos that showcase your business
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onAdd}>
        <Text style={styles.emptyButtonText}>Add Media</Text>
      </TouchableOpacity>
    </View>
  );
});

const EditModal = memo(({ isVisible, onClose, onSave, editingItem, formData, setFormData, isLoading }: { isVisible: boolean, onClose: () => void, onSave: () => void, editingItem: MediaItem | null, formData: any, setFormData: any, isLoading: boolean }) => {
  const { colors, isDarkMode, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{editingItem ? 'Edit Media' : 'Add Media'}</Text>
          <TouchableOpacity style={[styles.modalButton, isLoading && styles.disabledButton]} onPress={onSave} disabled={isLoading}>
            <Text style={[styles.modalButtonText, styles.saveButton]}>{isLoading ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Enter media title..."
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Describe what this media shows..."
              placeholderTextColor={colors.textSecondary}
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
                    style={[styles.categorySelectorItem, formData.category === category.key && styles.categorySelectorItemActive]}
                    onPress={() => setFormData(prev => ({ ...prev, category: category.key as MediaItem['category'] }))}
                  >
                    <Ionicons name={category.icon} size={20} color={formData.category === category.key ? colors.headerText : colors.primary} />
                    <Text style={[styles.categorySelectorText, formData.category === category.key && styles.categorySelectorTextActive]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <View style={styles.featuredToggleLeft}>
                <Ionicons name="star" size={20} color={colors.primary} />
                <View>
                  <Text style={styles.featuredToggleTitle}>Featured Media</Text>
                  <Text style={styles.featuredToggleSubtitle}>Show this prominently in your profile</Text>
                </View>
              </View>
              <Switch
                value={formData.featured}
                onValueChange={(value) => setFormData(prev => ({ ...prev, featured: value }))}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isDarkMode ? colors.card : '#ffffff'}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
});

export const MediaGalleryTestScreen: React.FC<MediaGalleryTestScreenProps> = ({ navigation }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);

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

  const filteredMedia = useMemo(() => selectedCategory === 'all' 
    ? mediaItems 
    : mediaItems.filter(item => item.category === selectedCategory), [mediaItems, selectedCategory]);

  const handleAddMedia = () => {
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
  };

  const handleMediaSelection = async (type: string) => {
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

    setMediaItems(prev => [newMediaItem, ...prev]);
    setEditingItem(newMediaItem);
    setFormData({
      title: newMediaItem.title,
      description: newMediaItem.description || '',
      category: newMediaItem.category,
      featured: newMediaItem.featured
    });
    setIsModalVisible(true);
    Alert.alert('Success', 'Media added successfully! You can now edit the details.');
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

    setIsLoading(true);
    if (editingItem) {
      const updatedItem = {
        ...editingItem,
        ...formData
      };
      setMediaItems(prev => prev.map(item => item.id === editingItem.id ? updatedItem : item));
    }
    setIsModalVisible(false);
    Alert.alert('Success', `Media ${editingItem ? 'updated' : 'added'} successfully!`);
    setIsLoading(false);
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
          onPress: () => {
            setMediaItems(prev => prev.filter(item => item.id !== mediaId));
            Alert.alert('Success', 'Media deleted successfully!');
          }
        }
      ]
    );
  };

  const renderMediaItem = ({ item }: { item: MediaItem }) => {
    if (viewMode === 'grid') {
      return <MediaGridItem item={item} onEdit={handleEditMedia} />;
    }
    return <MediaListItem item={item} onEdit={handleEditMedia} onDelete={handleDeleteMedia} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        navigation={navigation}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        onAdd={handleAddMedia}
      />

      <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      <StatsBar 
        filteredCount={filteredMedia.length}
        totalFeaturedCount={mediaItems.filter(item => item.featured).length}
        selectedCategory={selectedCategory}
      />

      <FlatList
        data={filteredMedia}
        renderItem={renderMediaItem}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        style={styles.mediaList}
        contentContainerStyle={styles.mediaListContent}
        ListEmptyComponent={<EmptyState onAdd={handleAddMedia} />}
      />

      <EditModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveMedia}
        editingItem={editingItem}
        formData={formData}
        setFormData={setFormData}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
};

export default MediaGalleryTestScreen;
