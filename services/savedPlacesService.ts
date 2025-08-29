/**
 * Saved Places Service
 * Handles saving and unsaving businesses for users
 */

import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface SavedPlacesService {
  saveBusiness: (userId: string, businessId: string) => Promise<void>;
  unsaveBusiness: (userId: string, businessId: string) => Promise<void>;
  getSavedBusinesses: (userId: string) => Promise<string[]>;
  isBusinessSaved: (userId: string, businessId: string) => Promise<boolean>;
}

class SavedPlacesServiceImpl implements SavedPlacesService {
  /**
   * Save a business to user's saved places
   */
  async saveBusiness(userId: string, businessId: string): Promise<void> {
    if (!userId || !businessId) {
      throw new Error('User ID and Business ID are required');
    }

    try {
      const userRef = doc(db, 'users', userId);
      
      // Use arrayUnion to add the business ID if it doesn't already exist
      await updateDoc(userRef, {
        'profile.details.savedBusinesses': arrayUnion(businessId),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error saving business:', error);
      throw new Error('Failed to save business');
    }
  }

  /**
   * Remove a business from user's saved places
   */
  async unsaveBusiness(userId: string, businessId: string): Promise<void> {
    if (!userId || !businessId) {
      throw new Error('User ID and Business ID are required');
    }

    try {
      const userRef = doc(db, 'users', userId);
      
      // Use arrayRemove to remove the business ID
      await updateDoc(userRef, {
        'profile.details.savedBusinesses': arrayRemove(businessId),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error unsaving business:', error);
      throw new Error('Failed to unsave business');
    }
  }

  /**
   * Get all saved business IDs for a user
   */
  async getSavedBusinesses(userId: string): Promise<string[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return [];
      }

      const userData = userDoc.data();
      const savedBusinesses = userData?.profile?.details?.savedBusinesses || [];
      
      // Ensure we return an array of strings
      return Array.isArray(savedBusinesses) ? savedBusinesses : [];
    } catch (error) {
      console.error('Error getting saved businesses:', error);
      throw new Error('Failed to get saved businesses');
    }
  }

  /**
   * Check if a business is saved by a user
   */
  async isBusinessSaved(userId: string, businessId: string): Promise<boolean> {
    if (!userId || !businessId) {
      return false;
    }

    try {
      const savedBusinesses = await this.getSavedBusinesses(userId);
      return savedBusinesses.includes(businessId);
    } catch (error) {
      console.error('Error checking if business is saved:', error);
      return false;
    }
  }
}

// Export singleton instance
export const savedPlacesService = new SavedPlacesServiceImpl();
export default savedPlacesService;
