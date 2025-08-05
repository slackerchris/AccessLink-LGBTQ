#!/usr/bin/env node

/**
 * Script to create Firebase Authentication accounts for business users
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

// Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);

// Business users to create auth accounts for
const authAccounts = [
  {
    email: 'alex.rainbow@example.com',
    password: 'rainbow123',
    displayName: 'Alex Rivera',
    firestoreUid: 'owner-rainbow-001'
  },
  {
    email: 'dr.maria.santos@inclusivehealth.com', 
    password: 'health123',
    displayName: 'Dr. Maria Santos',
    firestoreUid: 'owner-health-002'
  },
  {
    email: 'jamie.manager@rainbowcafe.com',
    password: 'manager123', 
    displayName: 'Jamie Chen',
    firestoreUid: 'manager-cafe-003'
  },
  {
    email: 'sam.trainer@spectrumfitness.com',
    password: 'trainer123',
    displayName: 'Sam Taylor', 
    firestoreUid: 'manager-fitness-004'
  }
];

async function createAuthAccounts() {
  console.log('🔐 Creating Firebase Authentication accounts...');
  
  try {
    for (const account of authAccounts) {
      console.log(`\n➕ Creating auth account: ${account.email}`);
      
      try {
        // Create the authentication account
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          account.email, 
          account.password
        );
        
        const authUser = userCredential.user;
        console.log(`✅ Created auth account with UID: ${authUser.uid}`);
        
        // Update the Firestore document to use the real auth UID
        const userDocRef = doc(db, 'users', authUser.uid);
        await updateDoc(userDocRef, {
          uid: authUser.uid,
          authUid: authUser.uid,
          isEmailVerified: authUser.emailVerified,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`✅ Updated Firestore document for ${account.displayName}`);
        console.log(`📧 Login credentials: ${account.email} / ${account.password}`);
        
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`⚠️  Account already exists: ${account.email}`);
        } else {
          console.error(`❌ Error creating ${account.email}:`, error.message);
        }
      }
    }
    
    console.log('\n🎉 Authentication accounts setup complete!');
    console.log('\n🔑 Login Credentials:');
    authAccounts.forEach(account => {
      console.log(`   📧 ${account.email}`);
      console.log(`   🔒 ${account.password}`);
      console.log(`   👤 ${account.displayName}`);
      console.log('');
    });
    
    console.log('🌈 To log in as Rainbow Café owner:');
    console.log('   Email: alex.rainbow@example.com');
    console.log('   Password: rainbow123');
    console.log('');
    console.log('📱 Open your app and use these credentials to log in!');
    
  } catch (error) {
    console.error('❌ Error creating auth accounts:', error);
    throw error;
  }
}

// Run the script
createAuthAccounts().then(() => {
  console.log('✅ Script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
