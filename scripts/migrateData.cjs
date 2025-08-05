/**
 * Data Migration Script (JavaScript version)
 * Migrates existing business data to optimized collections
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  query, 
  where,
  writeBatch,
  serverTimestamp 
} = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Generate search terms for business
 */
function generateSearchTerms(business) {
  const terms = new Set();
  
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
 * Add business to approved_businesses collection
 */
function addToApprovedCollection(business, batch) {
  const approvedBusiness = {
    businessId: business.id,
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
    searchTerms: generateSearchTerms(business),
    lastActive: business.updatedAt || business.createdAt || serverTimestamp(),
    createdAt: business.createdAt || serverTimestamp()
  };
  
  const approvedRef = doc(collection(db, 'approved_businesses'));
  batch.set(approvedRef, approvedBusiness);
}

/**
 * Add business to businesses_by_location collection
 */
function addToLocationCollection(business, batch) {
  const locationBusiness = {
    businessId: business.id,
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
function addToFeaturedCollection(business, batch) {
  const featuredBusiness = {
    businessId: business.id,
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
 * Migrate all approved businesses to optimized collections
 */
async function migrateApprovedBusinesses() {
  console.log('🚀 Starting migration of approved businesses...');
  
  try {
    // Get all approved businesses from the main collection
    const businessesQuery = query(
      collection(db, 'businesses'),
      where('status', '==', 'approved')
    );
    
    const businessSnapshot = await getDocs(businessesQuery);
    console.log(`📊 Found ${businessSnapshot.docs.length} approved businesses to migrate`);
    
    const batchSize = 490; // Firestore batch limit is 500, leaving some buffer
    let currentBatch = writeBatch(db);
    let operationCount = 0;
    let totalMigrated = 0;
    
    for (const businessDoc of businessSnapshot.docs) {
      const businessData = { id: businessDoc.id, ...businessDoc.data() };
      
      // Create approved business record
      addToApprovedCollection(businessData, currentBatch);
      operationCount++;
      
      // Create location-based record
      addToLocationCollection(businessData, currentBatch);
      operationCount++;
      
      // Create featured record if applicable
      if (businessData.featured) {
        addToFeaturedCollection(businessData, currentBatch);
        operationCount++;
      }
      
      totalMigrated++;
      
      // Commit batch if approaching limit
      if (operationCount >= batchSize) {
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
 * Validate migration results
 */
async function validateMigration() {
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

// Run the migration
async function runMigration() {
  try {
    console.log('🚀 Starting complete data migration process...');
    
    // Migrate data
    await migrateApprovedBusinesses();
    
    // Validate results
    await validateMigration();
    
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
