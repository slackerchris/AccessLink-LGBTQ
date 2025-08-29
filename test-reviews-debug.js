/**
 * Debug script to test review functionality
 * Run this with: node test-reviews-debug.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, orderBy } = require('firebase/firestore');

// Firebase config - using the same config as your app
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

async function testReviews() {
  console.log('🔍 Starting review debug test...');
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  console.log('✅ Firebase initialized');
  
  try {
    // Test 1: Check if reviews collection exists and has any documents
    console.log('\n📊 Test 1: Checking reviews collection...');
    const reviewsCollection = collection(db, 'reviews');
    const allReviewsSnapshot = await getDocs(reviewsCollection);
    
    console.log(`   Total reviews in database: ${allReviewsSnapshot.size}`);
    
    if (allReviewsSnapshot.size > 0) {
      console.log('   Sample review data:');
      allReviewsSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data();
        console.log(`   Review ${index + 1}:`, {
          id: doc.id,
          userId: data.userId,
          businessId: data.businessId,
          rating: data.rating,
          comment: data.comment?.substring(0, 50) + '...',
          createdAt: data.createdAt
        });
      });
    }
    
    // Test 2: Check for specific user's reviews (replace with actual user ID)
    console.log('\n👤 Test 2: Checking for user-specific reviews...');
    
    // Get all unique user IDs first
    const userIds = new Set();
    allReviewsSnapshot.docs.forEach(doc => {
      const userId = doc.data().userId;
      if (userId) userIds.add(userId);
    });
    
    console.log(`   Found reviews from ${userIds.size} different users:`);
    Array.from(userIds).forEach(userId => {
      console.log(`   - ${userId}`);
    });
    
    // Test 3: Try to query by a specific user ID
    if (userIds.size > 0) {
      const testUserId = Array.from(userIds)[0];
      console.log(`\n🔍 Test 3: Querying reviews for user: ${testUserId}`);
      
      const userReviewsQuery = query(
        collection(db, 'reviews'),
        where('userId', '==', testUserId),
        orderBy('createdAt', 'desc')
      );
      
      const userReviewsSnapshot = await getDocs(userReviewsQuery);
      console.log(`   Found ${userReviewsSnapshot.size} reviews for this user`);
      
      userReviewsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   User Review ${index + 1}:`, {
          id: doc.id,
          businessId: data.businessId,
          businessName: data.businessName,
          rating: data.rating,
          comment: data.comment?.substring(0, 50) + '...',
          createdAt: data.createdAt
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    
    if (error.code === 'failed-precondition') {
      console.log('💡 This might be a Firestore index issue. You may need to create a composite index.');
      console.log('   Go to Firebase Console > Firestore > Indexes and create an index for:');
      console.log('   Collection: reviews');
      console.log('   Fields: userId (Ascending), createdAt (Descending)');
    }
  }
}

// Load environment variables
require('dotenv').config();

testReviews().then(() => {
  console.log('\n✅ Debug test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug test failed:', error);
  process.exit(1);
});
