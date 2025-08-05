/**
 * Business Data Adapters
 * Functions for adapting business data between different components and APIs
 */

import { BusinessListing, BusinessReview } from '../services/businessService';

/**
 * Adapts a BusinessListing from the API format to the component-friendly format
 * Handles type mismatches and ensures all required properties exist
 * 
 * @param business The original business listing
 * @returns A business listing with all properties expected by components
 */
export function adaptBusinessForDisplay(business: BusinessListing | null): (BusinessListing & {
  reviewCount: number;
  photos: string[];
  accessibilityFeatures: string[];
  reviews?: BusinessReview[];
}) | null {
  if (!business) return null;
  
  // Extract accessibility features as array from accessibility object
  const accessibilityFeatures: string[] = [];
  
  if (business.accessibility) {
    Object.entries(business.accessibility).forEach(([key, value]) => {
      if (value === true && key !== 'accessibilityNotes') {
        // Convert camelCase to readable format (e.g., wheelchairAccessible -> Wheelchair Accessible)
        accessibilityFeatures.push(
          key.replace(/([A-Z])/g, ' $1').charAt(0).toUpperCase() + key.replace(/([A-Z])/g, ' $1').slice(1)
        );
      }
    });
  }
  
  // Map business data to the component format
  return {
    ...business,
    // Map the property names expected by the component
    reviewCount: business.totalReviews || 0,
    photos: business.images || [],
    accessibilityFeatures,
    // Other properties not in the original model
    reviews: [], // This will be populated separately by the business details hook
  };
}

/**
 * Parses hours from the business data into a more readable format
 * 
 * @param hours The hours object from the business listing
 * @returns Formatted hours as an object with day names and readable time ranges
 */
export function formatBusinessHours(hours: Record<string, any> | undefined): Record<string, string> {
  if (!hours) return {};
  
  const formattedHours: Record<string, string> = {};
  
  Object.entries(hours).forEach(([day, timeInfo]) => {
    if (timeInfo.closed) {
      formattedHours[day] = 'Closed';
    } else if (timeInfo.open && timeInfo.close) {
      formattedHours[day] = `${timeInfo.open} - ${timeInfo.close}`;
    } else {
      formattedHours[day] = 'Hours not specified';
    }
  });
  
  return formattedHours;
}
