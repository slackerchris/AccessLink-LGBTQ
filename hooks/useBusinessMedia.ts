/**
 * Custom Hook for Managing Business Media
 * Encapsulates all logic for fetching, adding, updating, and deleting media items for a business.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { photoUploadService } from '../services/photoUploadService';
import { MediaItem, MediaCategory } from '../types/media';
import { BusinessListing } from '../types/business';

interface UseBusinessMediaResult {
  mediaItems: MediaItem[];
  loading: boolean;
  error: string | null;
  refreshMedia: () => void;
  addMedia: (business: BusinessListing) => Promise<void>;
  updateMedia: (mediaId: string, data: Partial<Omit<MediaItem, 'id' | 'uri' | 'uploadedAt'>>) => Promise<void>;
  deleteMedia: (business: BusinessListing, mediaItem: MediaItem) => Promise<void>;
}

export const useBusinessMedia = (businessId: string | null): UseBusinessMediaResult => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    if (!businessId) {
      setMediaItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const q = query(collection(db, 'media'), where('businessId', '==', businessId));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaItem));
      setMediaItems(items.sort((a, b) => b.uploadedAt.toMillis() - a.uploadedAt.toMillis()));
    } catch (e: any) {
      console.error("Error fetching media items: ", e);
      setError('Failed to fetch media gallery.');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const addMedia = async (business: BusinessListing) => {
    if (!business?.id) {
      setError('Business ID is required to add media.');
      return;
    }

    setLoading(true);
    try {
      const imageResult = await photoUploadService.selectPhotoSource();
      if (!imageResult || imageResult.canceled || !imageResult.assets?.[0]) {
        setLoading(false);
        return;
      }

      const selectedImage = imageResult.assets[0];
      const uploadResult = await photoUploadService.uploadBusinessPhoto(
        business.id,
        selectedImage.uri,
        'gallery'
      );

      if (!uploadResult.success || !uploadResult.downloadURL) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      const newMediaData = {
        uri: uploadResult.downloadURL,
        businessId: business.id,
        title: 'New Photo',
        description: '',
        category: 'other' as MediaCategory,
        featured: false,
        uploadedAt: serverTimestamp(),
      };

      const batch = writeBatch(db);
      
      // 1. Add new document to 'media' collection
      const mediaDocRef = doc(collection(db, 'media'));
      batch.set(mediaDocRef, newMediaData);

      // 2. Update the 'images' array in the business document
      const businessDocRef = doc(db, 'businesses', business.id);
      const updatedImages = [...(business.images || []), uploadResult.downloadURL];
      batch.update(businessDocRef, { images: updatedImages });

      await batch.commit();
      
      await fetchMedia(); // Refresh the list
    } catch (e: any) {
      console.error("Error adding media: ", e);
      setError('Failed to add new media.');
    } finally {
      setLoading(false);
    }
  };

  const updateMedia = async (mediaId: string, data: Partial<Omit<MediaItem, 'id' | 'uri' | 'uploadedAt'>>) => {
    setLoading(true);
    try {
      const mediaDocRef = doc(db, 'media', mediaId);
      await updateDoc(mediaDocRef, data);
      setMediaItems(prev =>
        prev.map(item => (item.id === mediaId ? { ...item, ...data } : item))
      );
    } catch (e: any) {
      console.error("Error updating media: ", e);
      setError('Failed to update media details.');
    } finally {
      setLoading(false);
    }
  };

  const deleteMedia = async (business: BusinessListing, mediaItem: MediaItem) => {
    if (!business?.id || !mediaItem?.id) {
        setError('Business and Media item IDs are required.');
        return;
    }
    setLoading(true);
    try {
        const batch = writeBatch(db);

        // 1. Delete from 'media' collection
        const mediaDocRef = doc(db, 'media', mediaItem.id);
        batch.delete(mediaDocRef);

        // 2. Update business 'images' array
        const businessDocRef = doc(db, 'businesses', business.id);
        const updatedImages = (business.images || []).filter(url => url !== mediaItem.uri);
        batch.update(businessDocRef, { images: updatedImages });

        // 3. Delete from storage
        await photoUploadService.deleteBusinessPhoto(mediaItem.uri);

        await batch.commit();

        setMediaItems(prev => prev.filter(item => item.id !== mediaItem.id));
    } catch (e: any) {
        console.error("Error deleting media: ", e);
        setError('Failed to delete media.');
    } finally {
        setLoading(false);
    }
  };

  return {
    mediaItems,
    loading,
    error,
    refreshMedia: fetchMedia,
    addMedia,
    updateMedia,
    deleteMedia,
  };
};
