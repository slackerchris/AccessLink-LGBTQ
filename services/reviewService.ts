/**
 * Review Service (Firebase)
 * Minimal Firestore-backed review creation used by CreateReviewScreen
 */

import { addDoc, collection, serverTimestamp, query, where, orderBy, getDocs, Timestamp, runTransaction, doc, limit } from 'firebase/firestore';
import { db } from './firebase';

export interface Review extends UserReview {}

export interface CreateReviewInput {
  businessId: string;
  userId: string;
  rating: number;
  comment: string;
  photos?: string[];
  businessName?: string;
  accessibilityTags?: string[];
}

export async function addReview(input: CreateReviewInput): Promise<string> {
  const { businessId, userId, rating, comment, photos = [], businessName, accessibilityTags = [] } = input;

  if (!businessId) throw new Error('businessId is required');
  if (!userId) throw new Error('userId is required');
  if (!rating || rating < 1 || rating > 5) throw new Error('rating must be between 1 and 5');
  if (!comment?.trim()) throw new Error('comment is required');

  const docRef = await addDoc(collection(db, 'reviews'), {
    businessId,
    userId,
    rating,
    comment: comment.trim(),
    photos,
    businessName: businessName || null,
    accessibilityTags,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Atomically update business aggregates
  const businessRef = doc(db, 'businesses', businessId);
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(businessRef);
      if (!snap.exists()) {
        // If business doc doesn’t exist, skip aggregation silently
        return;
      }
      const data = snap.data() as any;
      const oldCount = typeof data.totalReviews === 'number' ? data.totalReviews : 0;
      const oldAvg = typeof data.averageRating === 'number' ? data.averageRating : 0;
      const newCount = oldCount + 1;
      const newAvg = Number(((oldAvg * oldCount + rating) / newCount).toFixed(2));
      tx.update(businessRef, {
        totalReviews: newCount,
        averageRating: newAvg,
        updatedAt: serverTimestamp(),
      });
    });
  } catch (e) {
    // Non-fatal; review was saved
    console.warn('Failed to update business aggregates:', e);
  }

  return docRef.id;
}

export interface UserReview {
  id: string;
  businessId: string;
  businessName?: string | null;
  rating: number;
  comment: string;
  photos: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId?: string;
}

export async function getUserReviews(userId: string): Promise<UserReview[]> {
  console.log('🔍 getUserReviews: Called with userId:', userId);

  try {
    const q = query(
      collection(db, 'reviews'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    console.log('🔍 getUserReviews: Query created, executing...');
    const snap = await getDocs(q);
    console.log('🔍 getUserReviews: Query executed, found', snap.size, 'documents');

    const results = snap.docs.map(d => {
      const data = d.data();
      console.log('🔍 getUserReviews: Processing document:', d.id, 'with data:', {
        userId: data.userId,
        businessId: data.businessId,
        rating: data.rating,
        comment: data.comment?.substring(0, 50),
        createdAt: data.createdAt,
      });

      const toTimestamp = (t: any): Timestamp => {
        if (!t) return Timestamp.now();
        if (t instanceof Timestamp) return t;
        if (typeof t?.toDate === 'function') return t;
        return Timestamp.fromDate(new Date(t));
      };
      return {
        id: d.id,
        businessId: data.businessId,
        businessName: data.businessName ?? null,
        rating: data.rating,
        comment: data.comment,
        photos: Array.isArray(data.photos) ? data.photos : [],
        createdAt: toTimestamp(data.createdAt),
        updatedAt: toTimestamp(data.updatedAt),
        userId: data.userId,
      } as UserReview;
    });

    console.log('✅ getUserReviews: Returning', results.length, 'processed reviews');
    return results;
  } catch (error) {
    console.error('❌ getUserReviews: Error occurred:', error);
    throw error;
  }
}

export async function getAllReviews(): Promise<{ reviews: UserReview[] }> {
  const snapshot = await getDocs(collection(db, 'reviews'));
  const reviews = snapshot.docs.map(d => {
    const data = d.data();
    const toTimestamp = (t: any): Timestamp => {
      if (!t) return Timestamp.now();
      if (t instanceof Timestamp) return t;
      if (typeof t?.toDate === 'function') return t;
      return Timestamp.fromDate(new Date(t));
    };
    return {
      id: d.id,
      businessId: data.businessId,
      businessName: data.businessName ?? null,
      rating: data.rating,
      comment: data.comment,
      photos: Array.isArray(data.photos) ? data.photos : [],
      createdAt: toTimestamp(data.createdAt),
      updatedAt: toTimestamp(data.updatedAt),
      userId: data.userId,
    } as UserReview;
  });
  return { reviews };
}

// Get recent reviews for a business (for BusinessDetailsScreen)
export async function getBusinessReviews(
  businessId: string,
  limitCount: number = 3
): Promise<UserReview[]> {
  console.log(
    '🔍 getBusinessReviews: Called with businessId:',
    businessId,
    'limit:',
    limitCount
  );

  try {
    // Use a simpler query to avoid index requirements
    const q = query(
      collection(db, 'reviews'),
      where('businessId', '==', businessId),
      limit(limitCount * 2) // Get more to sort client-side
    );

    console.log('🔍 getBusinessReviews: Query created, executing...');
    const snap = await getDocs(q);
    console.log(
      '🔍 getBusinessReviews: Query executed, found',
      snap.size,
      'documents'
    );

    const results = snap.docs.map(d => {
      const data = d.data();
      console.log(
        '🔍 getBusinessReviews: Processing document:',
        d.id,
        'with data:',
        {
          userId: data.userId,
          businessId: data.businessId,
          rating: data.rating,
          comment: data.comment?.substring(0, 50),
          createdAt: data.createdAt,
        }
      );

      const toTimestamp = (t: any): Timestamp => {
        if (!t) return Timestamp.now();
        if (t instanceof Timestamp) return t;
        if (typeof t?.toDate === 'function') return t;
        return Timestamp.fromDate(new Date(t));
      };
      return {
        id: d.id,
        businessId: data.businessId,
        businessName: data.businessName ?? null,
        rating: data.rating,
        comment: data.comment,
        photos: Array.isArray(data.photos) ? data.photos : [],
        createdAt: toTimestamp(data.createdAt),
        updatedAt: toTimestamp(data.updatedAt),
        userId: data.userId, // Include userId for display
      } as UserReview;
    });

    // Sort by createdAt client-side and limit results
    const sortedResults = results
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
      .slice(0, limitCount);

    console.log(
      '✅ getBusinessReviews: Returning',
      sortedResults.length,
      'processed reviews'
    );
    return sortedResults;
  } catch (error) {
    console.error('❌ getBusinessReviews: Error occurred:', error);
    throw error;
  }
}
