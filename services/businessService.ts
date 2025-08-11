
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from './authService';

export interface BusinessListing {
  id?: string;
  name: string;
  description: string;
  category: BusinessCategory;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
    };
  };
  hours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  lgbtqFriendly: {
    verified: boolean;
    certifications: string[];
    inclusivityFeatures: string[];
  };
  accessibility: {
    wheelchairAccessible: boolean;
    brailleMenus: boolean;
    signLanguageSupport: boolean;
    quietSpaces: boolean;
    accessibilityNotes: string;
  };
  ownerId: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  featured: boolean;
  images: string[];
  tags: string[];
  averageRating: number;
  totalReviews: number;
  createdAt: any;
  updatedAt: any;
}

export type BusinessCategory = 
  | 'restaurant'
  | 'healthcare'
  | 'beauty'
  | 'fitness'
  | 'retail'
  | 'professional_services'
  | 'entertainment'
  | 'education'
  | 'nonprofit'
  | 'other';

class BusinessService {

}

// Export singleton instance
export const businessService = new BusinessService();
export default businessService;
