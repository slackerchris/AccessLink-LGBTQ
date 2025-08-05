#!/usr/bin/env node

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } = require('firebase/firestore');

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

async function createBusinessRelationships() {
  console.log('🔧 Creating separate business relationships collection...\n');
  
  try {
    // Business relationship records - separate from user profiles
    const businessRelationships = [
      {
        id: 'alex-rainbow-owner',
        userId: 'alex-rivera-uid', // This would be the actual Firebase Auth UID
        userEmail: 'alex.rainbow@example.com',
        businessId: 'rainbow-cafe-123',
        businessName: 'Rainbow Café',
        relationshipType: 'owner',
        permissions: ['full_access', 'edit_details', 'manage_staff', 'view_analytics', 'manage_events'],
        isActive: true,
        isPrimary: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        id: 'alex-spectrum-owner',
        userId: 'alex-rivera-uid',
        userEmail: 'alex.rainbow@example.com',
        businessId: 'spectrum-fitness-456',
        businessName: 'Spectrum Fitness',
        relationshipType: 'owner',
        permissions: ['full_access', 'edit_details', 'manage_staff', 'view_analytics', 'manage_events'],
        isActive: true,
        isPrimary: false, // Secondary business
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        id: 'maria-health-owner',
        userId: 'maria-santos-uid',
        userEmail: 'dr.maria.santos@inclusivehealth.com',
        businessId: 'inclusive-health-789',
        businessName: 'Inclusive Health Clinic',
        relationshipType: 'owner',
        permissions: ['full_access', 'edit_details', 'manage_staff', 'view_analytics', 'manage_events'],
        isActive: true,
        isPrimary: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        id: 'jamie-rainbow-manager',
        userId: 'jamie-thompson-uid',
        userEmail: 'jamie.manager@rainbowcafe.com',
        businessId: 'rainbow-cafe-123',
        businessName: 'Rainbow Café',
        relationshipType: 'manager',
        permissions: ['edit_details', 'manage_events', 'view_analytics'],
        isActive: true,
        isPrimary: true,
        delegatedBy: 'alex-rivera-uid',
        delegatedByEmail: 'alex.rainbow@example.com',
        managerTitle: 'General Manager',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        id: 'sam-spectrum-trainer',
        userId: 'sam-rodriguez-uid',
        userEmail: 'sam.trainer@spectrumfitness.com',
        businessId: 'spectrum-fitness-456',
        businessName: 'Spectrum Fitness',
        relationshipType: 'staff',
        permissions: ['edit_details', 'manage_events'],
        isActive: true,
        isPrimary: true,
        delegatedBy: 'alex-rivera-uid',
        delegatedByEmail: 'alex.rainbow@example.com',
        staffTitle: 'Senior Trainer',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // Add each relationship to the business_relationships collection
    for (const relationship of businessRelationships) {
      const { id, ...relationshipData } = relationship;
      await setDoc(doc(db, 'business_relationships', id), relationshipData);
      console.log(`✅ Created relationship: ${relationshipData.userEmail} → ${relationshipData.businessName} (${relationshipData.relationshipType})`);
    }

    console.log('\n🎉 Business relationships collection created successfully!');
    console.log('\n📋 New Structure:');
    console.log('   👥 users collection: Clean, simple user profiles');
    console.log('   🏢 businesses collection: Business information only');
    console.log('   🔗 business_relationships collection: Who can access what');
    
    console.log('\n🔍 Query Examples:');
    console.log('   • Get user\'s businesses: query business_relationships where userId = user.uid');
    console.log('   • Get business staff: query business_relationships where businessId = business.id');
    console.log('   • Check permissions: query business_relationships where userId = user.uid AND businessId = business.id');

  } catch (error) {
    console.error('❌ Error creating business relationships:', error);
  }
}

createBusinessRelationships();
