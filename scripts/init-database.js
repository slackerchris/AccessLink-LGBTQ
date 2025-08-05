#!/usr/bin/env node

/**
 * Script to initialize database collections and ensure proper structure
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDoc } = require('firebase/firestore');

// Firebase configuration (from your config/domain.ts)
const firebaseConfig = {
  apiKey: "AIzaSyBZ5lPUbO5TF8Lj5wdXhGhGhGhGhGhGhG",
  authDomain: "acceslink-lgbtq.firebaseapp.com",
  projectId: "acceslink-lgbtq",
  storageBucket: "acceslink-lgbtq.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeDatabase() {
  console.log('🔥 Initializing Firebase database collections...');
  
  try {
    // Initialize businesses collection with a placeholder
    console.log('📦 Checking businesses collection...');
    const businessesRef = collection(db, 'businesses');
    const businessPlaceholderRef = doc(businessesRef, '_placeholder');
    
    const businessPlaceholderDoc = await getDoc(businessPlaceholderRef);
    if (!businessPlaceholderDoc.exists()) {
      await setDoc(businessPlaceholderRef, {
        _isPlaceholder: true,
        _purpose: 'Ensures businesses collection exists',
        _note: 'This document can be deleted once real businesses are added',
        createdAt: new Date()
      });
      console.log('✅ Businesses collection initialized');
    } else {
      console.log('✅ Businesses collection already exists');
    }

    // Initialize reviews collection with a placeholder
    console.log('📦 Checking reviews collection...');
    const reviewsRef = collection(db, 'reviews');
    const reviewPlaceholderRef = doc(reviewsRef, '_placeholder');
    
    const reviewPlaceholderDoc = await getDoc(reviewPlaceholderRef);
    if (!reviewPlaceholderDoc.exists()) {
      await setDoc(reviewPlaceholderRef, {
        _isPlaceholder: true,
        _purpose: 'Ensures reviews collection exists',
        _note: 'This document can be deleted once real reviews are added',
        createdAt: new Date()
      });
      console.log('✅ Reviews collection initialized');
    } else {
      console.log('✅ Reviews collection already exists');
    }

    // Initialize events collection with a placeholder
    console.log('📦 Checking events collection...');
    const eventsRef = collection(db, 'events');
    const eventPlaceholderRef = doc(eventsRef, '_placeholder');
    
    const eventPlaceholderDoc = await getDoc(eventPlaceholderRef);
    if (!eventPlaceholderDoc.exists()) {
      await setDoc(eventPlaceholderRef, {
        _isPlaceholder: true,
        _purpose: 'Ensures events collection exists',
        _note: 'This document can be deleted once real events are added',
        createdAt: new Date()
      });
      console.log('✅ Events collection initialized');
    } else {
      console.log('✅ Events collection already exists');
    }

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\nCollection status:');
    console.log('  📊 users - (managed by authentication)');
    console.log('  🏢 businesses - ✅ Ready');
    console.log('  ⭐ reviews - ✅ Ready');
    console.log('  📅 events - ✅ Ready');
    console.log('\nNext steps:');
    console.log('1. Run "node scripts/create-sample-businesses.js" to add sample data');
    console.log('2. Access the admin debug dashboard to view statistics');
    console.log('3. Test business creation and management features\n');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Run the script
initializeDatabase().then(() => {
  console.log('✅ Database initialization completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
});
