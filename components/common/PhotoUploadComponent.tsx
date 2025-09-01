/**
 * Photo Upload Component
 * Reusable component for uploading photos with progress indication
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { photoUploadService, PhotoUploadProgress } from '../../services/photoUploadService';

interface PhotoUploadComponentProps {
  onPhotoUploaded: (downloadURL: string) => void;
  onPhotoRemoved?: () => void;
  currentPhotoURL?: string;
  uploadType: 'user-profile' | 'business-profile' | 'business-gallery';
  userId?: string;
  businessId?: string;
  disabled?: boolean;
  style?: any;
}

export default function PhotoUploadComponent({
  onPhotoUploaded,
  onPhotoRemoved,
  currentPhotoURL,
  uploadType,
  userId,
  businessId,
  disabled = false,
  style
}: PhotoUploadComponentProps) {
  const { colors } = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePhotoUpload = async () => {
    if (disabled || isUploading) return;

    try {
      // Select photo source (camera or gallery)
      const imageResult = await photoUploadService.selectPhotoSource();
      
      if (!imageResult || imageResult.canceled || !imageResult.assets?.[0]) {
        return;
      }

      const selectedImage = imageResult.assets[0];
      setIsUploading(true);
      setUploadProgress(0);

      let result;
      const onProgress = (progress: PhotoUploadProgress) => {
        setUploadProgress(progress.progress);
      };

      // Upload based on type
      switch (uploadType) {
        case 'user-profile':
          if (!userId) {
            throw new Error('User ID is required for user profile uploads');
          }
          result = await photoUploadService.uploadUserProfilePhoto(
            userId,
            selectedImage.uri,
            onProgress
          );
          break;

        case 'business-profile':
          if (!businessId) {
            throw new Error('Business ID is required for business profile uploads');
          }
          result = await photoUploadService.uploadBusinessPhoto(
            businessId,
            selectedImage.uri,
            'profile',
            onProgress
          );
          break;

        case 'business-gallery':
          if (!businessId) {
            throw new Error('Business ID is required for business gallery uploads');
          }
          result = await photoUploadService.uploadBusinessPhoto(
            businessId,
            selectedImage.uri,
            'gallery',
            onProgress
          );
          break;

        default:
          throw new Error('Invalid upload type');
      }

      if (result.success && result.downloadURL) {
        onPhotoUploaded(result.downloadURL);
        Alert.alert('Success', 'Photo uploaded successfully!');
      } else {
        throw new Error(result.error || 'Upload failed');
      }

    } catch (error) {
      console.error('❌ PhotoUploadComponent: Upload error:', error);
      Alert.alert(
        'Upload Failed',
        error instanceof Error ? error.message : 'Failed to upload photo. Please try again.'
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePhotoRemove = async () => {
    if (!currentPhotoURL || disabled || isUploading) return;

    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              if (uploadType === 'business-gallery' && businessId) {
                const success = await photoUploadService.removeBusinessPhotoFromFirestore(
                  businessId,
                  currentPhotoURL
                );
                if (success) {
                  onPhotoRemoved?.();
                  Alert.alert('Success', 'Photo removed successfully!');
                } else {
                  throw new Error('Failed to remove photo');
                }
              } else {
                // For profile photos, just call the callback
                // The parent component should handle the Firestore update
                onPhotoRemoved?.();
              }
            } catch (error) {
              console.error('❌ PhotoUploadComponent: Remove error:', error);
              Alert.alert('Error', 'Failed to remove photo. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getPlaceholderIcon = () => {
    switch (uploadType) {
      case 'user-profile':
        return 'person';
      case 'business-profile':
        return 'business';
      case 'business-gallery':
        return 'images';
      default:
        return 'camera';
    }
  };

  const getUploadText = () => {
    switch (uploadType) {
      case 'user-profile':
        return 'Upload Profile Photo';
      case 'business-profile':
        return 'Upload Business Photo';
      case 'business-gallery':
        return 'Add to Gallery';
      default:
        return 'Upload Photo';
    }
  };

  return (
    <View style={[styles.container, style]}>
      {currentPhotoURL ? (
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: currentPhotoURL }}
            style={[styles.photo, { borderColor: colors.border }]}
          />
          {!disabled && (
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: colors.notification }]}
              onPress={handlePhotoRemove}
            >
              <Ionicons name="close" size={16} color={colors.headerText} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.uploadButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: disabled ? 0.6 : 1
            }
          ]}
          onPress={handlePhotoUpload}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.uploadingText, { color: colors.text }]}>
                Uploading... {Math.round(uploadProgress * 100)}%
              </Text>
            </View>
          ) : (
            <View style={styles.uploadContent}>
              <Ionicons
                name={getPlaceholderIcon()}
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.uploadText, { color: colors.text }]}>
                {getUploadText()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  uploadingContainer: {
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
});
