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
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface BusinessResponse {
  id: string;
  reviewId: string;
  businessId: string;
  businessOwnerId: string;
  businessOwnerName: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessResponseInput {
  reviewId: string;
  businessId: string;
  businessOwnerId: string;
  businessOwnerName: string;
  message: string;
}

/**
 * Create a business response to a customer review
 */
export async function createBusinessResponse(input: CreateBusinessResponseInput): Promise<string> {
  const { reviewId, businessId, businessOwnerId, businessOwnerName, message } = input;

  if (!reviewId) throw new Error('reviewId is required');
  if (!businessId) throw new Error('businessId is required');
  if (!businessOwnerId) throw new Error('businessOwnerId is required');
  if (!message?.trim()) throw new Error('message is required');

  // Check if response already exists for this review
  const existingResponse = await getBusinessResponseByReviewId(reviewId);
  if (existingResponse) {
    throw new Error('A response already exists for this review. Use updateBusinessResponse to modify it.');
  }

  const docRef = await addDoc(collection(db, 'businessResponses'), {
    reviewId,
    businessId,
    businessOwnerId,
    businessOwnerName: businessOwnerName || 'Business Owner',
    message: message.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  console.log('✅ Business response created:', docRef.id);
  return docRef.id;
}

/**
 * Update an existing business response
 */
export async function updateBusinessResponse(responseId: string, message: string): Promise<void> {
  if (!responseId) throw new Error('responseId is required');
  if (!message?.trim()) throw new Error('message is required');

  const responseRef = doc(db, 'businessResponses', responseId);
  await updateDoc(responseRef, {
    message: message.trim(),
    updatedAt: serverTimestamp(),
  });

  console.log('✅ Business response updated:', responseId);
}

/**
 * Get business response for a specific review
 */
export async function getBusinessResponseByReviewId(reviewId: string): Promise<BusinessResponse | null> {
  try {
    const q = query(
      collection(db, 'businessResponses'),
      where('reviewId', '==', reviewId)
    );
    
    const snap = await getDocs(q);
    
    if (snap.empty) {
      return null;
    }

    const doc = snap.docs[0];
    const data = doc.data();
    
    const toIso = (t: any) => {
      if (!t) return new Date().toISOString();
      if (t instanceof Timestamp) return t.toDate().toISOString();
      if (typeof t?.toDate === 'function') return t.toDate().toISOString();
      if (typeof t === 'string') return t;
      if (typeof t === 'number') return new Date(t).toISOString();
      return new Date().toISOString();
    };

    return {
      id: doc.id,
      reviewId: data.reviewId,
      businessId: data.businessId,
      businessOwnerId: data.businessOwnerId,
      businessOwnerName: data.businessOwnerName || 'Business Owner',
      message: data.message,
      createdAt: toIso(data.createdAt),
      updatedAt: toIso(data.updatedAt),
    };
  } catch (error) {
    console.error('❌ Error fetching business response:', error);
    throw error;
  }
}

/**
 * Get all business responses for a specific business
 */
export async function getBusinessResponses(businessId: string): Promise<BusinessResponse[]> {
  try {
    const q = query(
      collection(db, 'businessResponses'),
      where('businessId', '==', businessId),
      orderBy('createdAt', 'desc')
    );
    
    const snap = await getDocs(q);
    
    const responses = snap.docs.map((doc) => {
      const data = doc.data();
      
      const toIso = (t: any) => {
        if (!t) return new Date().toISOString();
        if (t instanceof Timestamp) return t.toDate().toISOString();
        if (typeof t?.toDate === 'function') return t.toDate().toISOString();
        if (typeof t === 'string') return t;
        if (typeof t === 'number') return new Date(t).toISOString();
        return new Date().toISOString();
      };

      return {
        id: doc.id,
        reviewId: data.reviewId,
        businessId: data.businessId,
        businessOwnerId: data.businessOwnerId,
        businessOwnerName: data.businessOwnerName || 'Business Owner',
        message: data.message,
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      };
    });

    console.log('✅ Fetched', responses.length, 'business responses for business:', businessId);
    return responses;
  } catch (error) {
    console.error('❌ Error fetching business responses:', error);
    throw error;
  }
}

/**
 * Get all responses by a specific business owner
 */
export async function getResponsesByBusinessOwner(businessOwnerId: string): Promise<BusinessResponse[]> {
  try {
    const q = query(
      collection(db, 'businessResponses'),
      where('businessOwnerId', '==', businessOwnerId),
      orderBy('createdAt', 'desc')
    );
    
    const snap = await getDocs(q);
    
    const responses = snap.docs.map((doc) => {
      const data = doc.data();
      
      const toIso = (t: any) => {
        if (!t) return new Date().toISOString();
        if (t instanceof Timestamp) return t.toDate().toISOString();
        if (typeof t?.toDate === 'function') return t.toDate().toISOString();
        if (typeof t === 'string') return t;
        if (typeof t === 'number') return new Date(t).toISOString();
        return new Date().toISOString();
      };

      return {
        id: doc.id,
        reviewId: data.reviewId,
        businessId: data.businessId,
        businessOwnerId: data.businessOwnerId,
        businessOwnerName: data.businessOwnerName || 'Business Owner',
        message: data.message,
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      };
    });

    console.log('✅ Fetched', responses.length, 'responses by business owner:', businessOwnerId);
    return responses;
  } catch (error) {
    console.error('❌ Error fetching responses by business owner:', error);
    throw error;
  }
}

/**
 * Delete a business response (in case business owner wants to remove their response)
 */
export async function deleteBusinessResponse(responseId: string): Promise<void> {
  try {
    const responseRef = doc(db, 'businessResponses', responseId);
    
    // Check if response exists
    const responseDoc = await getDoc(responseRef);
    if (!responseDoc.exists()) {
      throw new Error('Response not found');
    }

    await updateDoc(responseRef, {
      message: '[Response deleted by business owner]',
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Business response marked as deleted:', responseId);
  } catch (error) {
    console.error('❌ Error deleting business response:', error);
    throw error;
  }
}
