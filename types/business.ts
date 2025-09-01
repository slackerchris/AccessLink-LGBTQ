import { FieldValue } from 'firebase/firestore';
import { BusinessCategory } from '../services/businessService';

export type TimestampField = Date | FieldValue;

export interface BusinessListing {
  id?: string;
  name: string;
  description: string;
  category: BusinessCategory;
  location: {
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact?: {
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
  hours?: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  lgbtqFriendly?: {
    verified: boolean;
    certifications: string[];
    inclusivityFeatures: string[];
  };
  accessibility?: {
    wheelchairAccessible: boolean;
    brailleMenus: boolean;
    signLanguageSupport: boolean;
    quietSpaces: boolean;
    accessibilityNotes: string;
  };
  ownerId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  featured?: boolean;
  profilePhoto?: string | null;
  images?: string[];
  tags?: string[];
  averageRating: number;
  totalReviews?: number;
  createdAt?: TimestampField;
  updatedAt?: TimestampField;
}
