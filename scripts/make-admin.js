#!/usr/bin/env node

/**
 * Simple CLI tool to make a user an admin
 * Usage: node scripts/make-admin.js user@example.com
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, updateDoc, doc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration - matches your app config
const firebaseConfig = {
  apiKey: "AIzaSyCIOMEqs_o2VTxj7HnVqGMtG5u2qRuT6TU",
  authDomain: "acceslink-lgbtq.firebaseapp.com",
  projectId: "acceslink-lgbtq",
  storageBucket: "acceslink-lgbtq.firebasestorage.app",
  messagingSenderId: "595597079040",
  appId: "1:595597079040:android:598b0e16a92f0fb2c49ee5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function makeUserAdmin(userEmail) {
  try {
    console.log(`🔍 Looking for user with email: ${userEmail}`);
    
    // Find user by email
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', userEmail)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    
    if (querySnapshot.empty) {
      console.error('❌ User not found. Make sure the user has registered in the app first.');
      process.exit(1);
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const userDocRef = doc(db, 'users', userDoc.id);
    
    console.log(`👤 Found user: ${userData.displayName} (${userData.email})`);
    console.log(`📊 Current role: ${userData.role}`);
    
    if (userData.role === 'admin') {
      console.log('✅ User is already an admin!');
      process.exit(0);
    }
    
    // Update user role to admin
    await updateDoc(userDocRef, {
      role: 'admin',
      updatedAt: serverTimestamp()
    });
    
    console.log(`🎉 Successfully made ${userEmail} an admin!`);
    console.log('👑 They now have full administrative privileges.');
    
  } catch (error) {
    console.error('❌ Error making user admin:', error.message);
    process.exit(1);
  }
}

// Get email from command line arguments
const userEmail = process.argv[2];

if (!userEmail) {
  console.log('📧 Admin Creator Tool');
  console.log('');
  console.log('Usage: node scripts/make-admin.js <user-email>');
  console.log('');
  console.log('Example:');
  console.log('  node scripts/make-admin.js john@example.com');
  console.log('');
  console.log('⚠️  Note: The user must have registered in the app first!');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(userEmail)) {
  console.error('❌ Invalid email format');
  process.exit(1);
}

// Run the function
makeUserAdmin(userEmail);
