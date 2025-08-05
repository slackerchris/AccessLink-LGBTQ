#!/usr/bin/env node

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, deleteField } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBqIXYJU9n3P_W8pIV0jxjHp3_3_3_3_3_3",
  authDomain: "accesslink-lgbtq.firebaseapp.com",
  projectId: "accesslink-lgbtq",
  storageBucket: "accesslink-lgbtq.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanUserProfiles() {
  console.log('🧹 Cleaning user profiles - removing business data...\n');
  
  try {
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      console.log(`🔧 Cleaning user: ${userData.email}`);
      
      // Remove business-related fields, keep only essential user data
      const cleanUpdates = {
        // Remove business-specific fields
        businessInfo: deleteField(),
        businessRole: deleteField(),
        ownedBusinesses: deleteField(),
        managedBusinesses: deleteField(),
        primaryBusiness: deleteField(),
        businessExperience: deleteField(),
        specializations: deleteField()
      };
      
      // Update the user document
      await updateDoc(doc(db, 'users', userDoc.id), cleanUpdates);
      console.log(`✅ Cleaned: ${userData.email}`);
    }
    
    console.log('\n🎉 All user profiles cleaned!');
    console.log('\n📋 Clean User Structure:');
    console.log('   • uid: Firebase Auth ID');
    console.log('   • email: User email');
    console.log('   • displayName: User display name');
    console.log('   • role: admin | business_owner | user');
    console.log('   • isEmailVerified: Email verification status');
    console.log('   • profile: { personal preferences, bio, etc. }');
    console.log('   • lgbtqIdentity: { pronouns, orientation, etc. }');
    console.log('   • createdAt/updatedAt: Timestamps');
    
    console.log('\n🏢 Business relationships moved to: business_relationships collection');
    
  } catch (error) {
    console.error('❌ Error cleaning user profiles:', error);
  }
}

cleanUserProfiles();
