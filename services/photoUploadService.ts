/**
 * Photo Upload Service
 * Handles uploading photos to Firebase Cloud Storage
 */

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const storage = getStorage();

export interface PhotoUploadResult {
  success: boolean;
  downloadURL?: string;
  error?: string;
}

export interface PhotoUploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

/**
 * Request camera and media library permissions
 */
export async function requestPhotoPermissions(): Promise<boolean> {
  try {
    // Request camera permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera permissions in your device settings to take photos.'
      );
      return false;
    }

    // Request media library permissions
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaPermission.status !== 'granted') {
      Alert.alert(
        'Media Library Permission Required',
        'Please enable media library permissions in your device settings to select photos.'
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ PhotoUpload: Error requesting permissions:', error);
    return false;
  }
}

/**
 * Show photo selection options (camera or gallery)
 */
export async function selectPhotoSource(): Promise<ImagePicker.ImagePickerResult | null> {
  return new Promise((resolve) => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const hasPermission = await requestPhotoPermissions();
            if (!hasPermission) {
              resolve(null);
              return;
            }

            try {
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              resolve(result);
            } catch (error) {
              console.error('❌ PhotoUpload: Camera error:', error);
              resolve(null);
            }
          }
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const hasPermission = await requestPhotoPermissions();
            if (!hasPermission) {
              resolve(null);
              return;
            }

            try {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              resolve(result);
            } catch (error) {
              console.error('❌ PhotoUpload: Gallery error:', error);
              resolve(null);
            }
          }
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(null)
        }
      ]
    );
  });
}

/**
 * Upload a photo to Firebase Storage
 */
export async function uploadPhoto(
  uri: string,
  folder: 'users' | 'businesses',
  fileName: string,
  onProgress?: (progress: PhotoUploadProgress) => void
): Promise<PhotoUploadResult> {
  try {
    console.log('📤 PhotoUpload: Starting upload for:', fileName);

    // Create a reference to the file location
    const storageRef = ref(storage, `${folder}/${fileName}`);

    // Convert URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    console.log('📤 PhotoUpload: Blob created, size:', blob.size, 'bytes');

    // Upload the file
    const uploadTask = uploadBytes(storageRef, blob);

    // Wait for upload to complete
    const snapshot = await uploadTask;
    console.log('✅ PhotoUpload: Upload completed');

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ PhotoUpload: Download URL obtained:', downloadURL);

    return {
      success: true,
      downloadURL
    };

  } catch (error) {
    console.error('❌ PhotoUpload: Upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Delete a photo from Firebase Storage
 */
export async function deletePhoto(downloadURL: string): Promise<boolean> {
  try {
    console.log('🗑️ PhotoUpload: Deleting photo:', downloadURL);
    
    const photoRef = ref(storage, downloadURL);
    await deleteObject(photoRef);
    
    console.log('✅ PhotoUpload: Photo deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ PhotoUpload: Delete failed:', error);
    return false;
  }
}

/**
 * Upload user profile photo
 */
export async function uploadUserProfilePhoto(
  userId: string,
  uri: string,
  onProgress?: (progress: PhotoUploadProgress) => void
): Promise<PhotoUploadResult> {
  const fileName = `${userId}_profile_${Date.now()}.jpg`;
  const result = await uploadPhoto(uri, 'users', fileName, onProgress);

  if (result.success && result.downloadURL) {
    try {
      // Update user document with new profile photo
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        profilePhoto: result.downloadURL,
        updatedAt: new Date()
      });

      console.log('✅ PhotoUpload: User profile photo updated in Firestore');
    } catch (error) {
      console.error('❌ PhotoUpload: Failed to update user document:', error);
    }
  }

  return result;
}

/**
 * Upload business photo (profile or gallery)
 */
export async function uploadBusinessPhoto(
  businessId: string,
  uri: string,
  type: 'profile' | 'gallery',
  onProgress?: (progress: PhotoUploadProgress) => void
): Promise<PhotoUploadResult> {
  const fileName = `${businessId}_${type}_${Date.now()}.jpg`;
  const result = await uploadPhoto(uri, 'businesses', fileName, onProgress);

  if (result.success && result.downloadURL) {
    try {
      const businessRef = doc(db, 'businesses', businessId);
      
      if (type === 'profile') {
        // Update business profile photo
        await updateDoc(businessRef, {
          profilePhoto: result.downloadURL,
          updatedAt: new Date()
        });
      } else {
        // Add to business gallery
        await updateDoc(businessRef, {
          photos: arrayUnion(result.downloadURL),
          updatedAt: new Date()
        });
      }

      console.log(`✅ PhotoUpload: Business ${type} photo updated in Firestore`);
    } catch (error) {
      console.error('❌ PhotoUpload: Failed to update business document:', error);
    }
  }

  return result;
}

export async function deleteBusinessPhoto(downloadURL: string): Promise<boolean> {
  return deletePhoto(downloadURL);
}

/**
 * Remove business photo from gallery and Firestore
 */
export async function removeBusinessPhotoFromFirestore(
  businessId: string,
  downloadURL: string
): Promise<boolean> {
  try {
    // Remove from Firestore
    const businessRef = doc(db, 'businesses', businessId);
    await updateDoc(businessRef, {
      photos: arrayRemove(downloadURL),
      updatedAt: new Date()
    });

    // Delete from Storage
    await deletePhoto(downloadURL);

    console.log('✅ PhotoUpload: Business photo removed successfully');
    return true;
  } catch (error) {
    console.error('❌ PhotoUpload: Failed to remove business photo:', error);
    return false;
  }
}

/**
 * Generate a unique filename
 */
export function generateFileName(prefix: string, extension: string = 'jpg'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}_${timestamp}_${random}.${extension}`;
}

export const photoUploadService = {
  requestPhotoPermissions,
  selectPhotoSource,
  uploadPhoto,
  deletePhoto,
  uploadUserProfilePhoto,
  uploadBusinessPhoto,
  deleteBusinessPhoto,
  removeBusinessPhotoFromFirestore,
  generateFileName
};
