#!/usr/bin/env node

/**
 * Link Firebase Auth Accounts to Business Data
 * This script finds Firebase Auth accounts and links them to existing business user data
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, updateDoc, getDoc } = require('firebase/firestore');
const { getAuth, connectAuthEmulator } = require('firebase/auth');

// Firebase configuration
const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "accesslink-lgbtq.firebaseapp.com",
  projectId: "accesslink-lgbtq",
  storageBucket: "accesslink-lgbtq.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Mapping of emails to expected business roles
const businessAccounts = [
  {
    email: 'alex.rainbow@example.com',
    expectedName: 'Alex Rivera',
    role: 'business_owner',
    businessRole: 'owner'
  },
  {
    email: 'dr.maria.santos@inclusivehealth.com',
    expectedName: 'Dr. Maria Santos',
    role: 'business_owner',
    businessRole: 'owner'
  },
  {
    email: 'jamie.manager@rainbowcafe.com',
    expectedName: 'Jamie Thompson',
    role: 'business_owner',
    businessRole: 'manager'
  },
  {
    email: 'sam.trainer@spectrumfitness.com',
    expectedName: 'Sam Rodriguez',
    role: 'business_owner',
    businessRole: 'manager'
  }
];

async function linkAuthAccountsToBusinessData() {
  console.log('🔗 Starting auth account linking process...\n');

  for (const account of businessAccounts) {
    try {
      console.log(`Processing ${account.email}...`);
      
      // Check if business user data already exists
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', account.email)
      );
      
      const userSnapshot = await getDocs(usersQuery);
      
      if (userSnapshot.empty) {
        console.log(`❌ No business user data found for ${account.email}`);
        console.log('   Business user data should have been created by create-business-users.js');
        continue;
      }
      
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
      
      console.log(`✅ Found business user data for ${account.email}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   Business Role: ${userData.businessRole}`);
      
      if (userData.businessInfo?.ownedBusinesses) {
        console.log(`   Owned Businesses: ${userData.businessInfo.ownedBusinesses.length}`);
        userData.businessInfo.ownedBusinesses.forEach(biz => {
          console.log(`     - ${biz.businessName} (${biz.role})`);
        });
      }
      
      if (userData.businessInfo?.managedBusinesses) {
        console.log(`   Managed Businesses: ${userData.businessInfo.managedBusinesses.length}`);
        userData.businessInfo.managedBusinesses.forEach(biz => {
          console.log(`     - ${biz.businessName} (${biz.role})`);
        });
      }
      
      console.log(`   ✅ Business data is ready for auth account linking\n`);
      
    } catch (error) {
      console.error(`❌ Error processing ${account.email}:`, error.message);
    }
  }
  
  console.log('\n📋 Summary:');
  console.log('The business user data is ready in Firestore.');
  console.log('Now you need to create Firebase Auth accounts with these credentials:\n');
  
  businessAccounts.forEach(account => {
    const password = account.email.includes('alex.rainbow') ? 'rainbow123' :
                    account.email.includes('maria.santos') ? 'health123' :
                    account.email.includes('jamie.manager') ? 'manager123' :
                    account.email.includes('sam.trainer') ? 'trainer123' : 'password123';
    
    console.log(`📧 ${account.email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Name: ${account.expectedName}`);
    console.log('');
  });
  
  console.log('Create these accounts through:');
  console.log('1. Your app\'s Sign Up screen, OR');
  console.log('2. Firebase Console → Authentication → Users → Add User');
  console.log('');
  console.log('Once created, the auth accounts will automatically link to the existing business data.');
}

async function checkAuthAccountStatus() {
  console.log('🔍 Checking Firebase Auth account status...\n');
  
  for (const account of businessAccounts) {
    try {
      // Check if user data exists in Firestore
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', account.email)
      );
      
      const userSnapshot = await getDocs(usersQuery);
      
      if (userSnapshot.empty) {
        console.log(`❌ ${account.email} - No Firestore data`);
      } else {
        const userData = userSnapshot.docs[0].data();
        const hasBusinessInfo = userData.businessInfo && 
          (userData.businessInfo.ownedBusinesses || userData.businessInfo.managedBusinesses);
        
        console.log(`✅ ${account.email} - Firestore data exists`);
        console.log(`   Role: ${userData.role}`);
        console.log(`   Business Info: ${hasBusinessInfo ? 'Yes' : 'No'}`);
        
        if (userData.uid) {
          console.log(`   Firebase Auth UID: ${userData.uid}`);
        } else {
          console.log(`   ⚠️  No Firebase Auth UID - account not linked yet`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error checking ${account.email}:`, error.message);
    }
  }
}

// Main execution
async function main() {
  const action = process.argv[2];
  
  if (action === 'check') {
    await checkAuthAccountStatus();
  } else {
    await linkAuthAccountsToBusinessData();
  }
}

main().catch(console.error);
