/**
 * View Tracking Service
 * Handles tracking of business profile views
 */

import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Increment the view count for a business
 * @param businessId - The ID of the business to track views for
 * @returns Promise that resolves when the view is tracked
 */
export async function trackBusinessView(businessId: string): Promise<void> {
  try {
    console.log('📊 ViewTracking: Incrementing view count for business:', businessId);
    
    const businessRef = doc(db, 'businesses', businessId);
    
    // Use Firebase's atomic increment to safely update the view count
    await updateDoc(businessRef, {
      views: increment(1),
      lastViewed: new Date()
    });
    
    console.log('✅ ViewTracking: Successfully incremented view count');
  } catch (error) {
    console.error('❌ ViewTracking: Error tracking business view:', error);
    // Don't throw the error - view tracking shouldn't break the user experience
    // if it fails, just log it and continue
  }
}

/**
 * Track multiple views (batch operation)
 * @param businessIds - Array of business IDs to track views for
 * @returns Promise that resolves when all views are tracked
 */
export async function trackMultipleBusinessViews(businessIds: string[]): Promise<void> {
  try {
    console.log('📊 ViewTracking: Tracking views for multiple businesses:', businessIds.length);
    
    // Track views for each business (could be optimized with batch operations if needed)
    const trackingPromises = businessIds.map(businessId => trackBusinessView(businessId));
    
    await Promise.all(trackingPromises);
    
    console.log('✅ ViewTracking: Successfully tracked all business views');
  } catch (error) {
    console.error('❌ ViewTracking: Error tracking multiple business views:', error);
  }
}

export const viewTrackingService = {
  trackBusinessView,
  trackMultipleBusinessViews
};
