/**
 * Modern Media Gallery Management Screen for Business Owners
 * Clean, Instagram-inspired interface for photo management
 */

import React, { useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Modal,
  StatusBar,
  TextInput,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useMediaGallery } from '../../hooks/useMediaGallery';
import { MediaItem, MediaCategory } from '../../types/media';
import { useTheme, ThemeColors } from '../../hooks/useTheme';

type MediaGalleryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MediaGallery'
>;

interface MediaGalleryScreenProps {
  navigation: MediaGalleryScreenNavigationProp;
}

const photoSize = Dimensions.get('window').width / 3 - 8;

const Header = memo(({ navigation, mediaCount, onAdd, isLoading }: { navigation: MediaGalleryScreenNavigationProp, mediaCount: number, onAdd: () => void, isLoading: boolean }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>Gallery</Text>
        <Text style={styles.headerSubtitle}>
          {mediaCount} {mediaCount === 1 ? 'item' : 'items'}
        </Text>
      </View>
      <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={onAdd} disabled={isLoading}>
        {isLoading ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="add" size={24} color="white" />}
      </TouchableOpacity>
    </View>
  );
});

const MediaGridItem = memo(({ item, onEdit, onDelete }: { item: MediaItem, onEdit: (item: MediaItem) => void, onDelete: (item: MediaItem) => void }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <TouchableOpacity style={styles.photoItem} onPress={() => onEdit(item)}>
      <Image source={{ uri: item.uri }} style={styles.photo} />
      {item.featured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={12} color="#FFD700" />
        </View>
      )}
      <TouchableOpacity style={styles.deleteIcon} onPress={() => onDelete(item)}>
        <Ionicons name="close-circle" size={24} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const EmptyGallery = memo(({ onAdd }: { onAdd: () => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>Your Gallery is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Add photos to showcase your business to the community.
      </Text>
      <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.primary }]} onPress={onAdd}>
        <Ionicons name="add-circle-outline" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.emptyButtonText}>Add First Photo</Text>
      </TouchableOpacity>
    </View>
  );
});

const EditMediaModal = memo(({ isVisible, onClose, onSave, item, formData, setFormData, categories, isLoading }: { isVisible: boolean, onClose: () => void, onSave: () => void, item: MediaItem | null, formData: Partial<MediaItem>, setFormData: React.Dispatch<React.SetStateAction<Partial<MediaItem>>>, categories: Array<{ key: MediaCategory | 'all', label: string, icon: any }>, isLoading: boolean }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={[styles.modalButtonText, { color: colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Media</Text>
          <TouchableOpacity style={styles.modalButton} onPress={onSave} disabled={isLoading}>
            <Text style={[styles.modalButtonText, styles.saveButton, isLoading && styles.disabledButton]}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
          {item && <Image source={{ uri: item.uri }} style={styles.modalImage} />}
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="e.g., Our new accessible ramp"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Describe what this photo shows..."
              placeholderTextColor={colors.textSecondary}
              multiline
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categorySelector}>
              {categories.filter(c => c.key !== 'all').map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categorySelectorItem,
                    formData.category === category.key && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, category: category.key as MediaCategory }))}
                >
                  <Ionicons 
                    name={category.icon} 
                    size={20} 
                    color={formData.category === category.key ? '#fff' : colors.primary} 
                  />
                  <Text style={[
                    styles.categorySelectorText,
                    formData.category === category.key && styles.categorySelectorTextActive
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
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
                  <Text style={styles.featuredToggleTitle}>Featured Photo</Text>
                  <Text style={styles.featuredToggleSubtitle}>
                    Show this on your main profile
                  </Text>
                </View>
              </View>
              <View style={[styles.toggle, formData.featured && styles.toggleActive]}>
                <View style={[styles.toggleThumb, formData.featured && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
});

export const MediaGalleryScreen: React.FC<MediaGalleryScreenProps> = ({ navigation }) => {
  const {
    businessLoading,
    isDarkMode,
    userBusiness,
    mediaItems,
    mediaLoading,
    refreshMedia,
    isModalVisible,
    setIsModalVisible,
    editingItem,
    formData,
    setFormData,
    categories,
    filteredMedia,
    handleAddMedia,
    handleEditMedia,
    handleSaveMedia,
    handleDeleteMedia,
  } = useMediaGallery(navigation);
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);

  if (businessLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Your Business...</Text>
      </View>
    );
  }

  if (!userBusiness) {
    return (
      <SafeAreaView style={styles.container}>
        <Header navigation={navigation} mediaCount={0} onAdd={() => {}} isLoading={false} />
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={60} color={colors.notification} />
          <Text style={styles.emptyTitle}>No Business Found</Text>
          <Text style={styles.emptySubtitle}>
            You need a business profile to manage a media gallery.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.surface} />
      
      <Header navigation={navigation} mediaCount={mediaItems.length} onAdd={handleAddMedia} isLoading={mediaLoading} />

      <FlatList
        data={filteredMedia}
        renderItem={({ item }) => <MediaGridItem item={item} onEdit={handleEditMedia} onDelete={handleDeleteMedia} />}
        keyExtractor={(item) => item.id}
        numColumns={3}
        style={styles.photoGrid}
        contentContainerStyle={styles.photoGridContent}
        showsVerticalScrollIndicator={false}
        onRefresh={refreshMedia}
        refreshing={mediaLoading}
        ListEmptyComponent={<EmptyGallery onAdd={handleAddMedia} />}
      />

      <EditMediaModal 
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveMedia}
        item={editingItem}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        isLoading={mediaLoading}
      />
    </SafeAreaView>
  );
};

const localStyles = (colors: ThemeColors, shadows?: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    color: colors.textSecondary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoGrid: {
    flex: 1,
  },
  photoGridContent: {
    padding: 4,
  },
  photoItem: {
    width: photoSize,
    height: photoSize,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surface,
  },
  photo: {
    width: '100%',
    height: '100%',
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
  deleteIcon: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: colors.surface,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    color: colors.textSecondary,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: 'white',
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
    paddingHorizontal: 16,
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
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: colors.surface,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categorySelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  categorySelectorText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  categorySelectorTextActive: {
    color: '#fff',
  },
  featuredToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: colors.surface,
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
    marginTop: 2,
    color: colors.textSecondary,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
    backgroundColor: colors.border,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    ...(shadows ? shadows.small : {}),
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
});

export default MediaGalleryScreen;
