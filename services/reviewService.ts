/**
 * Review Service (Firebase)
 * Minimal Firestore-backed review creation used by CreateReviewScreen
 */

import { addDoc, collection, serverTimestamp, query, where, orderBy, getDocs, Timestamp, runTransaction, doc } from 'firebase/firestore';
import { db } from './firebase';

export interface CreateReviewInput {
  businessId: string;
  userId: string;
  rating: number;
  comment: string;
  photos?: string[];
  businessName?: string;
}

export async function addReview(input: CreateReviewInput): Promise<string> {
  const { businessId, userId, rating, comment, photos = [], businessName } = input;

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
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export async function getUserReviews(userId: string): Promise<UserReview[]> {
  const q = query(
    collection(db, 'reviews'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as any;
    const toIso = (t: any) => {
      if (!t) return new Date(0).toISOString();
      if (t instanceof Timestamp) return t.toDate().toISOString();
      if (typeof t?.toDate === 'function') return t.toDate().toISOString();
      // already ISO string or millis
      if (typeof t === 'string') return t;
      if (typeof t === 'number') return new Date(t).toISOString();
      return new Date().toISOString();
    };
    return {
      id: d.id,
      businessId: data.businessId,
      businessName: data.businessName ?? null,
      rating: data.rating,
      comment: data.comment,
      photos: Array.isArray(data.photos) ? data.photos : [],
      createdAt: toIso(data.createdAt),
      updatedAt: toIso(data.updatedAt),
    } as UserReview;
  });
}
