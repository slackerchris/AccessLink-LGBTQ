/**
 * Business Relationship Service
 * Handles business-user relationships separately from user profiles
 */

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface BusinessRelationship {
  id: string;
  userId: string;
  userEmail: string;
  businessId: string;
  businessName: string;
  relationshipType: 'owner' | 'manager' | 'staff';
  permissions: string[];
  isActive: boolean;
  isPrimary: boolean;
  delegatedBy?: string;
  delegatedByEmail?: string;
  managerTitle?: string;
  staffTitle?: string;
  createdAt: any;
  updatedAt: any;
}

export interface BusinessPermissions {
  full_access: boolean;
  edit_details: boolean;
  manage_staff: boolean;
  manage_events: boolean;
  view_analytics: boolean;
  manage_reviews: boolean;
}

export class BusinessRelationshipService {
  
  /**
   * Get all businesses a user has access to
   */
  static async getUserBusinesses(userId: string): Promise<BusinessRelationship[]> {
    try {
      const relationshipsQuery = query(
        collection(db, 'business_relationships'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(relationshipsQuery);
      const relationships: BusinessRelationship[] = [];
      
      snapshot.forEach(doc => {
        relationships.push({ id: doc.id, ...doc.data() } as BusinessRelationship);
      });
      
      // Sort by isPrimary (primary business first), then by business name
      return relationships.sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return a.businessName.localeCompare(b.businessName);
      });
      
    } catch (error) {
      console.error('Error getting user businesses:', error);
      return [];
    }
  }
  
  /**
   * Get all staff/managers for a business
   */
  static async getBusinessStaff(businessId: string): Promise<BusinessRelationship[]> {
    try {
      const relationshipsQuery = query(
        collection(db, 'business_relationships'),
        where('businessId', '==', businessId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(relationshipsQuery);
      const relationships: BusinessRelationship[] = [];
      
      snapshot.forEach(doc => {
        relationships.push({ id: doc.id, ...doc.data() } as BusinessRelationship);
      });
      
      // Sort by relationship type (owner first, then managers, then staff)
      const typeOrder = { 'owner': 1, 'manager': 2, 'staff': 3 };
      return relationships.sort((a, b) => {
        return typeOrder[a.relationshipType] - typeOrder[b.relationshipType];
      });
      
    } catch (error) {
      console.error('Error getting business staff:', error);
      return [];
    }
  }
  
  /**
   * Check if user has access to a business and get their permissions
   */
  static async getUserBusinessPermissions(userId: string, businessId: string): Promise<BusinessRelationship | null> {
    try {
      const relationshipsQuery = query(
        collection(db, 'business_relationships'),
        where('userId', '==', userId),
        where('businessId', '==', businessId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(relationshipsQuery);
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as BusinessRelationship;
      
    } catch (error) {
      console.error('Error checking business permissions:', error);
      return null;
    }
  }
  
  /**
   * Add a user to a business (create relationship)
   */
  static async addUserToBusiness(
    userId: string,
    userEmail: string,
    businessId: string,
    businessName: string,
    relationshipType: 'owner' | 'manager' | 'staff',
    permissions: string[],
    delegatedBy?: string,
    delegatedByEmail?: string,
    title?: string
  ): Promise<string> {
    try {
      const relationshipId = `${userId}-${businessId}-${relationshipType}`;
      
      const relationshipData: Partial<BusinessRelationship> = {
        userId,
        userEmail,
        businessId,
        businessName,
        relationshipType,
        permissions,
        isActive: true,
        isPrimary: false, // Set manually if needed
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      if (delegatedBy) {
        relationshipData.delegatedBy = delegatedBy;
        relationshipData.delegatedByEmail = delegatedByEmail;
      }
      
      if (title) {
        if (relationshipType === 'manager') {
          relationshipData.managerTitle = title;
        } else if (relationshipType === 'staff') {
          relationshipData.staffTitle = title;
        }
      }
      
      await setDoc(doc(db, 'business_relationships', relationshipId), relationshipData);
      
      return relationshipId;
      
    } catch (error) {
      console.error('Error adding user to business:', error);
      throw error;
    }
  }
  
  /**
   * Remove user from business (deactivate relationship)
   */
  static async removeUserFromBusiness(userId: string, businessId: string): Promise<void> {
    try {
      const relationshipsQuery = query(
        collection(db, 'business_relationships'),
        where('userId', '==', userId),
        where('businessId', '==', businessId)
      );
      
      const snapshot = await getDocs(relationshipsQuery);
      
      for (const doc of snapshot.docs) {
        await updateDoc(doc.ref, {
          isActive: false,
          updatedAt: serverTimestamp()
        });
      }
      
    } catch (error) {
      console.error('Error removing user from business:', error);
      throw error;
    }
  }
  
  /**
   * Update user permissions for a business
   */
  static async updateUserPermissions(
    userId: string, 
    businessId: string, 
    permissions: string[]
  ): Promise<void> {
    try {
      const relationshipsQuery = query(
        collection(db, 'business_relationships'),
        where('userId', '==', userId),
        where('businessId', '==', businessId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(relationshipsQuery);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        await updateDoc(doc.ref, {
          permissions,
          updatedAt: serverTimestamp()
        });
      }
      
    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw error;
    }
  }
  
  /**
   * Check if user has a specific permission for a business
   */
  static async hasPermission(
    userId: string, 
    businessId: string, 
    permission: string
  ): Promise<boolean> {
    try {
      const relationship = await this.getUserBusinessPermissions(userId, businessId);
      return relationship ? relationship.permissions.includes(permission) : false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }
  
  /**
   * Get user's primary business
   */
  static async getUserPrimaryBusiness(userId: string): Promise<BusinessRelationship | null> {
    try {
      const relationshipsQuery = query(
        collection(db, 'business_relationships'),
        where('userId', '==', userId),
        where('isActive', '==', true),
        where('isPrimary', '==', true)
      );
      
      const snapshot = await getDocs(relationshipsQuery);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as BusinessRelationship;
      }
      
      return null;
      
    } catch (error) {
      console.error('Error getting primary business:', error);
      return null;
    }
  }
}

export default BusinessRelationshipService;
