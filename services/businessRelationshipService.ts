import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from './authService';
import { BusinessListing } from './businessService';

export type RelationshipType = 'saved' | 'followed' | 'visited';

export interface BusinessRelationship {
  id: string; // Composite key: `${userId}_${businessId}_${type}`
  userId: string;
  businessId: string;
  type: RelationshipType;
  createdAt: any;
}

class BusinessRelationshipService {
  private relationshipsCollection = collection(db, 'businessRelationships');

  private getRelationshipId(userId: string, businessId: string, type: RelationshipType): string {
    return `${userId}_${businessId}_${type}`;
  }

  async addRelationship(userId: string, businessId: string, type: RelationshipType): Promise<void> {
    const id = this.getRelationshipId(userId, businessId, type);
    const relationshipRef = doc(this.relationshipsCollection, id);
    await setDoc(relationshipRef, {
      userId,
      businessId,
      type,
      createdAt: serverTimestamp(),
    });
  }

  async removeRelationship(userId: string, businessId: string, type: RelationshipType): Promise<void> {
    const id = this.getRelationshipId(userId, businessId, type);
    const relationshipRef = doc(this.relationshipsCollection, id);
    await deleteDoc(relationshipRef);
  }

  async getRelationships(userId: string, type: RelationshipType): Promise<BusinessRelationship[]> {
    const q = query(
      this.relationshipsCollection,
      where('userId', '==', userId),
      where('type', '==', type)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessRelationship));
  }

  async getUsersForBusiness(businessId: string, type: RelationshipType): Promise<UserProfile[]> {
    const q = query(
      this.relationshipsCollection,
      where('businessId', '==', businessId),
      where('type', '==', type)
    );
    const snapshot = await getDocs(q);
    const userIds = snapshot.docs.map(doc => doc.data().userId);
    
    if (userIds.length === 0) {
      return [];
    }

    const usersCollection = collection(db, 'users');
    const usersQuery = query(usersCollection, where('uid', 'in', userIds));
    const usersSnapshot = await getDocs(usersQuery);
    
    return usersSnapshot.docs.map(doc => doc.data() as UserProfile);
  }
}

export const businessRelationshipService = new BusinessRelationshipService();
export default businessRelationshipService;
