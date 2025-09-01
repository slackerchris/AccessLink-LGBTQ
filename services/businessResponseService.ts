/**
 * Business Response Service (Firebase)
 * Handles business owner responses to customer reviews
 */

import { 
  addDoc, 
  collection, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc,
  deleteDoc,
  getDoc,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { TimestampField } from '../types/business';

export interface BusinessResponse {
  id: string;
  reviewId: string;
  businessId: string;
  businessOwnerId: string;
  businessOwnerName: string;
  message: string;
  createdAt: TimestampField;
  updatedAt: TimestampField;
  isDeleted?: boolean;
}

export interface CreateBusinessResponseInput {
  reviewId: string;
  businessId: string;
  businessOwnerId: string;
  businessOwnerName: string;
  message: string;
}

const toBusinessResponse = (docSnap: any): BusinessResponse => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    reviewId: data.reviewId,
    businessId: data.businessId,
    businessOwnerId: data.businessOwnerId,
    businessOwnerName: data.businessOwnerName || 'Business Owner',
    message: data.message,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
    isDeleted: data.isDeleted || false,
  };
};

class BusinessResponseService {
  private responsesCollection = collection(db, 'businessResponses');

  async create(input: CreateBusinessResponseInput): Promise<string> {
    const { reviewId, businessId, businessOwnerId, businessOwnerName, message } = input;

    if (!reviewId || !businessId || !businessOwnerId || !message?.trim()) {
      throw new Error('Missing required fields for business response.');
    }

    const existingResponse = await this.getByReviewId(reviewId);
    if (existingResponse) {
      throw new Error('A response already exists for this review. Use update to modify it.');
    }

    const docRef = await addDoc(this.responsesCollection, {
      reviewId,
      businessId,
      businessOwnerId,
      businessOwnerName: businessOwnerName || 'Business Owner',
      message: message.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isDeleted: false,
    });

    console.log('✅ Business response created:', docRef.id);
    return docRef.id;
  }

  async update(responseId: string, message: string): Promise<void> {
    if (!responseId || !message?.trim()) {
      throw new Error('Response ID and message are required for update.');
    }

    const responseRef = doc(this.responsesCollection, responseId);
    await updateDoc(responseRef, {
      message: message.trim(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Business response updated:', responseId);
  }

  async getByReviewId(reviewId: string): Promise<BusinessResponse | null> {
    try {
      const q = query(
        this.responsesCollection,
        where('reviewId', '==', reviewId),
        limit(1)
      );
      
      const snap = await getDocs(q);
      
      if (snap.empty) {
        return null;
      }

      return toBusinessResponse(snap.docs[0]);
    } catch (error) {
      console.error('❌ Error fetching business response by review ID:', error);
      throw error;
    }
  }

  async getForBusiness(businessId: string): Promise<BusinessResponse[]> {
    try {
      const q = query(
        this.responsesCollection,
        where('businessId', '==', businessId),
        orderBy('createdAt', 'desc')
      );
      
      const snap = await getDocs(q);
      const responses = snap.docs.map(toBusinessResponse);

      console.log('✅ Fetched', responses.length, 'business responses for business:', businessId);
      return responses;
    } catch (error) {
      console.error('❌ Error fetching business responses for business:', error);
      throw error;
    }
  }

  async getByOwner(businessOwnerId: string): Promise<BusinessResponse[]> {
    try {
      const q = query(
        this.responsesCollection,
        where('businessOwnerId', '==', businessOwnerId),
        orderBy('createdAt', 'desc')
      );
      
      const snap = await getDocs(q);
      const responses = snap.docs.map(toBusinessResponse);

      console.log('✅ Fetched', responses.length, 'responses by business owner:', businessOwnerId);
      return responses;
    } catch (error) {
      console.error('❌ Error fetching responses by business owner:', error);
      throw error;
    }
  }

  async softDelete(responseId: string): Promise<void> {
    try {
      const responseRef = doc(this.responsesCollection, responseId);
      const responseDoc = await getDoc(responseRef);

      if (!responseDoc.exists()) {
        throw new Error('Response not found');
      }

      await updateDoc(responseRef, {
        message: '[Response deleted by business owner]',
        isDeleted: true,
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Business response marked as deleted:', responseId);
    } catch (error) {
      console.error('❌ Error soft-deleting business response:', error);
      throw error;
    }
  }

  async hardDelete(responseId: string): Promise<void> {
    try {
      const responseRef = doc(this.responsesCollection, responseId);
      await deleteDoc(responseRef);
      console.log('✅ Business response permanently deleted:', responseId);
    } catch (error) {
      console.error('❌ Error permanently deleting business response:', error);
      throw error;
    }
  }
}

export const businessResponseService = new BusinessResponseService();
export default businessResponseService;
