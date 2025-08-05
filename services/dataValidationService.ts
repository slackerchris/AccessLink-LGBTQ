/**
 * Data Validation Service for Firebase
 * Validates data structures before saving to database
 */

import { BusinessListing, BusinessCategory } from '../services/properBusinessService';

class DataValidationService {
  /**
   * Validate business data before saving
   */
  validateBusiness(business: Partial<BusinessListing>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!business.name || business.name.trim() === '') {
      errors.push('Business name is required');
    }

    if (!business.description || business.description.trim() === '') {
      errors.push('Business description is required');
    }

    if (!business.category) {
      errors.push('Business category is required');
    }

    // Validate category is one of the allowed values
    const allowedCategories: BusinessCategory[] = [
      'restaurant',
      'healthcare',
      'beauty',
      'fitness',
      'retail',
      'professional_services',
      'entertainment',
      'education',
      'nonprofit',
      'other'
    ];

    if (business.category && !allowedCategories.includes(business.category)) {
      errors.push(`Invalid category: ${business.category}`);
    }

    // Validate location
    if (!business.location) {
      errors.push('Business location is required');
    } else {
      if (!business.location.address || business.location.address.trim() === '') {
        errors.push('Business address is required');
      }
      if (!business.location.city || business.location.city.trim() === '') {
        errors.push('Business city is required');
      }
      if (!business.location.state || business.location.state.trim() === '') {
        errors.push('Business state is required');
      }
      if (!business.location.zipCode || business.location.zipCode.trim() === '') {
        errors.push('Business zip code is required');
      }

      // Validate coordinates if provided
      if (business.location.coordinates) {
        const { latitude, longitude } = business.location.coordinates;
        if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
          errors.push('Invalid latitude value');
        }
        if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
          errors.push('Invalid longitude value');
        }
      }
    }

    // Validate contact information
    if (!business.contact) {
      errors.push('Business contact information is required');
    } else {
      // Either phone or email should be provided
      if ((!business.contact.phone || business.contact.phone.trim() === '') &&
          (!business.contact.email || business.contact.email.trim() === '')) {
        errors.push('At least one contact method (phone or email) is required');
      }

      // Validate email format if provided
      if (business.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.contact.email)) {
        errors.push('Invalid email format');
      }

      // Validate phone format if provided
      if (business.contact.phone && !/^\+?[\d\s\-()]{7,}$/.test(business.contact.phone)) {
        errors.push('Invalid phone number format');
      }

      // Validate website URL if provided
      if (business.contact.website && !/^https?:\/\/\S+\.\S+/.test(business.contact.website)) {
        errors.push('Invalid website URL format');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate search terms for a business
   */
  generateSearchTerms(business: BusinessListing): string[] {
    const searchTerms = new Set<string>();

    // Add name words
    business.name.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2) // Skip very short words
      .forEach(word => searchTerms.add(word));

    // Add category
    searchTerms.add(business.category);

    // Add location
    searchTerms.add(business.location.city.toLowerCase());
    searchTerms.add(business.location.state.toLowerCase());

    // Add tags
    if (business.tags && Array.isArray(business.tags)) {
      business.tags.forEach(tag => searchTerms.add(tag.toLowerCase()));
    }

    // Add LGBTQ features
    if (business.lgbtqFriendly?.inclusivityFeatures && 
        Array.isArray(business.lgbtqFriendly.inclusivityFeatures)) {
      business.lgbtqFriendly.inclusivityFeatures.forEach(feature => {
        searchTerms.add(feature.toLowerCase());
      });
    }

    // Convert set to array and return
    return Array.from(searchTerms);
  }
}

// Export singleton
export const dataValidation = new DataValidationService();
export default dataValidation;
