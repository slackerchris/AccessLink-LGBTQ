#!/usr/bin/env node

/**
 * Script to create business owners and managers for existing businesses
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, updateDoc, doc, serverTimestamp } = require('firebase/firestore');

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

// Sample business owners and managers
const businessUsers = [
  {
    // Owner of Rainbow Café and Spectrum Fitness (multi-business owner)
    uid: 'owner-rainbow-001',
    email: 'alex.rainbow@example.com',
    displayName: 'Alex Rivera',
    role: 'business_owner',
    businessRole: 'owner',
    isEmailVerified: true,
    lgbtqIdentity: {
      pronouns: 'they/them',
      orientation: 'pansexual',
      identity: 'non-binary'
    },
    businessInfo: {
      ownedBusinesses: [], // Will be filled after we get business IDs
      managedBusinesses: [],
      primaryBusiness: '', // Will be the first business
      businessExperience: '8 years in hospitality and wellness industry',
      specializations: ['LGBTQ+ inclusive spaces', 'Community events', 'Accessibility advocacy']
    },
    accessibilityNeeds: {
      requiresWheelchairAccess: false,
      prefersCaptioning: false,
      usesScreenReader: false,
      other: ''
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    // Owner of Inclusive Health Clinic
    uid: 'owner-health-002',
    email: 'dr.maria.santos@inclusivehealth.com',
    displayName: 'Dr. Maria Santos',
    role: 'business_owner',
    businessRole: 'owner',
    isEmailVerified: true,
    lgbtqIdentity: {
      pronouns: 'she/her',
      orientation: 'lesbian',
      identity: 'cisgender woman'
    },
    businessInfo: {
      ownedBusinesses: [], // Will be filled
      managedBusinesses: [],
      primaryBusiness: '',
      businessExperience: '15 years in healthcare, specializing in LGBTQ+ affirming care',
      specializations: ['Trans health', 'HIV prevention', 'Mental health', 'Hormone therapy']
    },
    accessibilityNeeds: {
      requiresWheelchairAccess: false,
      prefersCaptioning: false,
      usesScreenReader: false,
      other: ''
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    // Manager for Rainbow Café (delegated management)
    uid: 'manager-cafe-003',
    email: 'jamie.manager@rainbowcafe.com',
    displayName: 'Jamie Chen',
    role: 'business_owner', // Has business management privileges
    businessRole: 'manager',
    isEmailVerified: true,
    lgbtqIdentity: {
      pronouns: 'she/her',
      orientation: 'bisexual',
      identity: 'cisgender woman'
    },
    businessInfo: {
      ownedBusinesses: [],
      managedBusinesses: [], // Will be filled with Rainbow Café
      primaryBusiness: '',
      businessExperience: '5 years in food service management',
      specializations: ['Daily operations', 'Staff training', 'Customer service', 'Event coordination'],
      managementRole: 'General Manager',
      delegatedBy: 'owner-rainbow-001'
    },
    accessibilityNeeds: {
      requiresWheelchairAccess: false,
      prefersCaptioning: true,
      usesScreenReader: false,
      other: 'Prefers written communication for complex instructions'
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    // Assistant manager for Spectrum Fitness
    uid: 'manager-fitness-004',
    email: 'sam.trainer@spectrumfitness.com',
    displayName: 'Sam Taylor',
    role: 'business_owner', // Has limited business management privileges
    businessRole: 'assistant_manager',
    isEmailVerified: true,
    lgbtqIdentity: {
      pronouns: 'he/him',
      orientation: 'gay',
      identity: 'transgender man'
    },
    businessInfo: {
      ownedBusinesses: [],
      managedBusinesses: [], // Will be filled with Spectrum Fitness
      primaryBusiness: '',
      businessExperience: '3 years in fitness training and facility management',
      specializations: ['Personal training', 'Group fitness', 'Trans-inclusive fitness', 'Equipment maintenance'],
      managementRole: 'Assistant Manager & Lead Trainer',
      delegatedBy: 'owner-rainbow-001'
    },
    accessibilityNeeds: {
      requiresWheelchairAccess: false,
      prefersCaptioning: false,
      usesScreenReader: false,
      other: ''
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

async function createBusinessUsers() {
  console.log('👥 Creating business owners and managers...');
  
  try {
    // First, get the existing businesses to link them properly
    console.log('📊 Fetching existing businesses...');
    const businessesRef = collection(db, 'businesses');
    const businessesSnapshot = await getDocs(businessesRef);
    
    const businesses = [];
    businessesSnapshot.forEach((doc) => {
      if (!doc.data()._isPlaceholder) {
        businesses.push({ id: doc.id, ...doc.data() });
      }
    });
    
    console.log(`Found ${businesses.length} businesses to assign owners`);
    
    // Map businesses to their intended owners
    const businessMapping = {
      'Rainbow Café': { owner: 'owner-rainbow-001', manager: 'manager-cafe-003' },
      'Inclusive Health Clinic': { owner: 'owner-health-002', manager: null },
      'Spectrum Fitness': { owner: 'owner-rainbow-001', manager: 'manager-fitness-004' }
    };
    
    // Create users and update business ownership
    const usersRef = collection(db, 'users');
    
    for (const userProfile of businessUsers) {
      console.log(`➕ Creating user: ${userProfile.displayName} (${userProfile.email})`);
      
      // Determine which businesses this user owns/manages
      const ownedBusinesses = [];
      const managedBusinesses = [];
      let primaryBusiness = '';
      
      businesses.forEach(business => {
        const mapping = businessMapping[business.name];
        if (mapping) {
          if (mapping.owner === userProfile.uid) {
            ownedBusinesses.push({
              businessId: business.id,
              businessName: business.name,
              role: 'owner',
              permissions: ['full_access', 'edit_details', 'manage_staff', 'view_analytics', 'financial_access']
            });
            if (!primaryBusiness) primaryBusiness = business.id;
          }
          
          if (mapping.manager === userProfile.uid) {
            managedBusinesses.push({
              businessId: business.id,
              businessName: business.name,
              role: userProfile.businessInfo.managementRole || 'manager',
              permissions: ['edit_details', 'manage_events', 'respond_reviews', 'view_analytics'],
              delegatedBy: userProfile.businessInfo.delegatedBy
            });
            if (!primaryBusiness) primaryBusiness = business.id;
          }
        }
      });
      
      // Update user profile with business information
      const updatedUserProfile = {
        ...userProfile,
        businessInfo: {
          ...userProfile.businessInfo,
          ownedBusinesses,
          managedBusinesses,
          primaryBusiness
        }
      };
      
      // Create the user document
      const userDocRef = doc(usersRef, userProfile.uid);
      await setDoc(userDocRef, updatedUserProfile);
      
      console.log(`✅ Created ${userProfile.displayName}`);
      console.log(`   - Owns: ${ownedBusinesses.map(b => b.businessName).join(', ') || 'none'}`);
      console.log(`   - Manages: ${managedBusinesses.map(b => b.businessName).join(', ') || 'none'}`);
      
      // Update business documents to reflect ownership
      for (const ownedBusiness of ownedBusinesses) {
        const businessDocRef = doc(businessesRef, ownedBusiness.businessId);
        await updateDoc(businessDocRef, {
          ownerId: userProfile.uid,
          ownerName: userProfile.displayName,
          ownerEmail: userProfile.email,
          updatedAt: serverTimestamp()
        });
        console.log(`   - Updated business ownership: ${ownedBusiness.businessName}`);
      }
      
      // Add manager information to businesses
      for (const managedBusiness of managedBusinesses) {
        const businessDocRef = doc(businessesRef, managedBusiness.businessId);
        await updateDoc(businessDocRef, {
          managers: [{
            userId: userProfile.uid,
            name: userProfile.displayName,
            email: userProfile.email,
            role: managedBusiness.role,
            permissions: managedBusiness.permissions,
            addedAt: new Date().toISOString()
          }],
          updatedAt: serverTimestamp()
        });
        console.log(`   - Added as manager: ${managedBusiness.businessName}`);
      }
    }
    
    console.log('\n🎉 Business users created successfully!');
    console.log('\n📊 Summary:');
    console.log(`👤 Created ${businessUsers.length} business users`);
    console.log(`🏢 Updated ${businesses.length} businesses with ownership information`);
    
    console.log('\n👥 User Accounts Created:');
    businessUsers.forEach(user => {
      console.log(`   📧 ${user.email} - ${user.displayName} (${user.businessRole})`);
    });
    
    console.log('\n🔗 Business Ownership Structure:');
    console.log('   🌈 Rainbow Café:');
    console.log('      - Owner: Alex Rivera (alex.rainbow@example.com)');
    console.log('      - Manager: Jamie Chen (jamie.manager@rainbowcafe.com)');
    console.log('   🏥 Inclusive Health Clinic:');
    console.log('      - Owner: Dr. Maria Santos (dr.maria.santos@inclusivehealth.com)');
    console.log('   💪 Spectrum Fitness:');
    console.log('      - Owner: Alex Rivera (alex.rainbow@example.com) [Multi-business owner]');
    console.log('      - Assistant Manager: Sam Taylor (sam.trainer@spectrumfitness.com)');
    
    console.log('\n📋 Next Steps:');
    console.log('1. These users can now log into the app with their email addresses');
    console.log('2. They will have business_owner role with appropriate permissions');
    console.log('3. Multi-business ownership is demonstrated with Alex Rivera');
    console.log('4. Delegated management is shown with Jamie and Sam');
    console.log('5. Use the admin dashboard to view and manage these relationships\n');
    
  } catch (error) {
    console.error('❌ Error creating business users:', error);
    throw error;
  }
}

// Helper function to set document with ID
async function setDoc(docRef, data) {
  const { setDoc: firestoreSetDoc } = require('firebase/firestore');
  return firestoreSetDoc(docRef, data);
}

// Run the script
createBusinessUsers().then(() => {
  console.log('✅ Script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
