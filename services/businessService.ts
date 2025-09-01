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
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, TimestampField } from '../hooks/useFirebaseAuth';

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
  images?: string[];
  tags?: string[];
  averageRating?: number;
  totalReviews?: number;
  createdAt?: TimestampField;
  updatedAt?: TimestampField;
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
  private businessesCollection = collection(db, 'businesses');

  private toBusinessListing(doc: DocumentSnapshot<DocumentData>): BusinessListing {
    const data = doc.data();
    if (!data) {
      throw new Error('Document data is empty');
    }
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
    } as BusinessListing;
  }

  async getBusinessById(businessId: string): Promise<BusinessListing | null> {
    const businessRef = doc(this.businessesCollection, businessId);
    const docSnap = await getDoc(businessRef);
    if (docSnap.exists()) {
      return this.toBusinessListing(docSnap);
    }
    return null;
  }

  async getAllBusinesses(): Promise<{ businesses: BusinessListing[] }> {
    const snapshot = await getDocs(this.businessesCollection);
    const businesses = snapshot.docs.map(doc => this.toBusinessListing(doc));
    return { businesses };
  }

  async approveBusiness(businessId: string, adminUser: UserProfile): Promise<void> {
    if (adminUser.role !== 'admin') {
      throw new Error('User does not have permission to approve businesses.');
    }
    const businessRef = doc(this.businessesCollection, businessId);
    await updateDoc(businessRef, {
      status: 'approved',
      updatedAt: serverTimestamp(),
    });
  }

  async rejectBusiness(businessId: string): Promise<void> {
    const businessRef = doc(this.businessesCollection, businessId);
    await updateDoc(businessRef, {
      status: 'rejected',
      updatedAt: serverTimestamp(),
    });
  }

  async toggleBusinessFeature(businessId: string, featured: boolean): Promise<void> {
    const businessRef = doc(this.businessesCollection, businessId);
    await updateDoc(businessRef, {
      featured: featured,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteBusiness(businessId: string): Promise<void> {
    const businessRef = doc(this.businessesCollection, businessId);
    await deleteDoc(businessRef);
  }
}

// Export singleton instance
export const businessService = new BusinessService();
export default businessService;
