#!/usr/bin/env node

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function checkStatus() {
  console.log('🔍 CHECKING CURRENT STATUS...\n');
  
  try {
    // Check users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    // Check businesses
    const businessesSnapshot = await getDocs(collection(db, 'businesses'));
    const businesses = [];
    businessesSnapshot.forEach(doc => {
      businesses.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`👥 USERS: ${users.length} total`);
    users.forEach(user => {
      console.log(`  📧 ${user.email} - Role: ${user.role || 'NOT SET'}`);
      if (user.businessInfo?.ownedBusinesses?.length > 0) {
        console.log(`    🏢 Owns: ${user.businessInfo.ownedBusinesses.map(b => b.businessName).join(', ')}`);
      }
    });
    
    console.log(`\n🏢 BUSINESSES: ${businesses.length} total`);
    businesses.forEach(business => {
      console.log(`  🏪 ${business.name} - Owner ID: ${business.ownerId || 'NOT SET'}`);
    });
    
    console.log('\n🔗 WHAT WE\'RE WAITING ON:');
    
    // Check if Firebase Auth accounts exist for business users
    const businessEmails = [
      'alex.rainbow@example.com',
      'dr.maria.santos@inclusivehealth.com', 
      'jamie.manager@rainbowcafe.com',
      'sam.trainer@spectrumfitness.com'
    ];
    
    const existingBusinessUsers = users.filter(user => businessEmails.includes(user.email));
    
    console.log(`✅ Business user data exists: ${existingBusinessUsers.length}/${businessEmails.length}`);
    existingBusinessUsers.forEach(user => {
      console.log(`  ✓ ${user.email} (${user.role})`);
    });
    
    const missingUsers = businessEmails.filter(email => !users.some(user => user.email === email));
    if (missingUsers.length > 0) {
      console.log(`❌ Missing Firebase Auth accounts for:`);
      missingUsers.forEach(email => {
        console.log(`  ✗ ${email}`);
      });
      console.log('\n🚀 NEXT STEP: Create Firebase Auth accounts manually:');
      console.log('   1. Open your app and use Sign Up screen');
      console.log('   2. Or use Firebase Console → Authentication → Add User');
      console.log('   3. Then run: node scripts/link-auth-to-business.js');
    } else {
      console.log('\n🎉 ALL BUSINESS ACCOUNTS READY TO TEST!');
      console.log('   You can now use the login buttons in your app');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 LIKELY ISSUE: Firebase configuration or connection');
    console.log('   Check your Firebase project settings');
  }
}

checkStatus();
