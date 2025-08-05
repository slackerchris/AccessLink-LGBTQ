/**
 * Data Migration Script
 * Migrates existing business data to optimized collections
 */

import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  query, 
  where,
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { BusinessListing, ApprovedBusiness, BusinessByLocation, FeaturedBusiness } from '../services/properBusinessService';

class DataMigration {
  
  /**
   * Migrate all approved businesses to optimized collections
   */
  public async migrateApprovedBusinesses(): Promise<void> {
    console.log('🚀 Starting migration of approved businesses...');
    
    try {
      // Get all approved businesses from the main collection
      const businessesQuery = query(
        collection(db, 'businesses'),
        where('status', '==', 'approved')
      );
      
      const businessSnapshot = await getDocs(businessesQuery);
      console.log(`📊 Found ${businessSnapshot.docs.length} approved businesses to migrate`);
      
      const batchSize = 500; // Firestore batch limit
      let currentBatch = writeBatch(db);
      let operationCount = 0;
      let totalMigrated = 0;
      
      for (const businessDoc of businessSnapshot.docs) {
        const businessData = { id: businessDoc.id, ...businessDoc.data() } as BusinessListing;
        
        // Create approved business record
        await this.addToApprovedCollection(businessData, currentBatch);
        
        // Create location-based record
        await this.addToLocationCollection(businessData, currentBatch);
        
        // Create featured record if applicable
        if (businessData.featured) {
          await this.addToFeaturedCollection(businessData, currentBatch);
        }
        
        operationCount += businessData.featured ? 3 : 2;
        totalMigrated++;
        
        // Commit batch if approaching limit
        if (operationCount >= batchSize - 10) {
          console.log(`💾 Committing batch (${totalMigrated} businesses migrated so far)`);
          await currentBatch.commit();
          currentBatch = writeBatch(db);
          operationCount = 0;
        }
      }
      
      // Commit final batch
      if (operationCount > 0) {
        await currentBatch.commit();
      }
      
      console.log(`✅ Migration complete! Migrated ${totalMigrated} businesses to optimized collections`);
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }
  
  /**
   * Add business to approved_businesses collection
   */
  private addToApprovedCollection(business: BusinessListing, batch: any): void {
    const approvedBusiness: Omit<ApprovedBusiness, 'id'> = {
      businessId: business.id!,
      name: business.name,
      description: business.description,
      category: business.category,
      location: {
        city: business.location.city,
        state: business.location.state
      },
      featured: business.featured,
      averageRating: business.averageRating || 0,
      totalReviews: business.totalReviews || 0,
      tags: business.tags || [],
      searchTerms: this.generateSearchTerms(business),
      lastActive: business.updatedAt || business.createdAt || serverTimestamp(),
      createdAt: business.createdAt || serverTimestamp()
    };
    
    const approvedRef = doc(collection(db, 'approved_businesses'));
    batch.set(approvedRef, approvedBusiness);
  }
  
  /**
   * Add business to businesses_by_location collection
   */
  private addToLocationCollection(business: BusinessListing, batch: any): void {
    const locationBusiness: Omit<BusinessByLocation, 'id'> = {
      businessId: business.id!,
      name: business.name,
      city: business.location.city,
      state: business.location.state,
      coordinates: business.location.coordinates,
      category: business.category,
      featured: business.featured,
      averageRating: business.averageRating || 0
    };
    
    const locationRef = doc(collection(db, 'businesses_by_location'));
    batch.set(locationRef, locationBusiness);
  }
  
  /**
   * Add business to featured_businesses collection
   */
  private addToFeaturedCollection(business: BusinessListing, batch: any): void {
    const featuredBusiness: Omit<FeaturedBusiness, 'id'> = {
      businessId: business.id!,
      name: business.name,
      description: business.description,
      category: business.category,
      location: {
        city: business.location.city,
        state: business.location.state
      },
      averageRating: business.averageRating || 0,
      featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      priority: 1
    };
    
    const featuredRef = doc(collection(db, 'featured_businesses'));
    batch.set(featuredRef, featuredBusiness);
  }
  
  /**
   * Generate search terms for business
   */
  private generateSearchTerms(business: BusinessListing): string[] {
    const terms = new Set<string>();
    
    // Add name words
    business.name.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 2) terms.add(word);
    });
    
    // Add description words (first 100 chars)
    const description = business.description || '';
    description.toLowerCase().substring(0, 100).split(/\s+/).forEach(word => {
      if (word.length > 2) terms.add(word);
    });
    
    // Add location
    terms.add(business.location.city.toLowerCase());
    terms.add(business.location.state.toLowerCase());
    
    // Add category
    terms.add(business.category);
    
    // Add tags
    if (business.tags) {
      business.tags.forEach(tag => {
        if (tag.length > 2) terms.add(tag.toLowerCase());
      });
    }
    
    // Add LGBTQ-related terms if verified
    if (business.lgbtqFriendly?.verified) {
      terms.add('lgbtq');
      terms.add('lgbt');
      terms.add('queer');
      terms.add('inclusive');
      terms.add('friendly');
    }
    
    // Add accessibility terms
    if (business.accessibility?.wheelchairAccessible) {
      terms.add('wheelchair');
      terms.add('accessible');
      terms.add('disability');
    }
    
    return Array.from(terms);
  }
  
  /**
   * Clean up existing optimized collections (for re-migration)
   */
  public async cleanupOptimizedCollections(): Promise<void> {
    console.log('🧹 Cleaning up existing optimized collections...');
    
    const collections = [
      'approved_businesses',
      'businesses_by_location', 
      'featured_businesses'
    ];
    
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      const batch = writeBatch(db);
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      if (snapshot.docs.length > 0) {
        await batch.commit();
        console.log(`🗑️  Cleaned up ${snapshot.docs.length} documents from ${collectionName}`);
      }
    }
    
    console.log('✅ Cleanup complete');
  }
  
  /**
   * Validate migration results
   */
  public async validateMigration(): Promise<void> {
    console.log('🔍 Validating migration results...');
    
    // Count original approved businesses
    const originalQuery = query(
      collection(db, 'businesses'),
      where('status', '==', 'approved')
    );
    const originalSnapshot = await getDocs(originalQuery);
    const originalCount = originalSnapshot.docs.length;
    
    // Count migrated businesses
    const approvedSnapshot = await getDocs(collection(db, 'approved_businesses'));
    const approvedCount = approvedSnapshot.docs.length;
    
    const locationSnapshot = await getDocs(collection(db, 'businesses_by_location'));
    const locationCount = locationSnapshot.docs.length;
    
    const featuredSnapshot = await getDocs(collection(db, 'featured_businesses'));
    const featuredCount = featuredSnapshot.docs.length;
    
    console.log(`📊 Migration Validation Results:`);
    console.log(`   Original approved businesses: ${originalCount}`);
    console.log(`   Migrated to approved_businesses: ${approvedCount}`);
    console.log(`   Migrated to businesses_by_location: ${locationCount}`);
    console.log(`   Migrated to featured_businesses: ${featuredCount}`);
    
    if (approvedCount === originalCount && locationCount === originalCount) {
      console.log('✅ Migration validation passed!');
    } else {
      console.log('❌ Migration validation failed - counts do not match');
      throw new Error('Migration validation failed');
    }
  }
}

// Export for use in scripts
export const dataMigration = new DataMigration();

// CLI script runner
if (require.main === module) {
  async function runMigration() {
    try {
      console.log('🚀 Starting complete data migration process...');
      
      // Optional: Clean up existing data first
      // await dataMigration.cleanupOptimizedCollections();
      
      // Migrate data
      await dataMigration.migrateApprovedBusinesses();
      
      // Validate results
      await dataMigration.validateMigration();
      
      console.log('🎉 Migration completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    }
  }
  
  runMigration();
}
