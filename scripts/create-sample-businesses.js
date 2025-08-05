#!/usr/bin/env node

/**
 * Script to create sample business data for testing
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

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

const sampleBusinesses = [
  {
    name: "Rainbow Café",
    description: "A welcoming coffee shop that celebrates diversity and serves excellent coffee, pastries, and light meals. LGBTQ+ owned and operated.",
    category: "restaurant",
    location: {
      address: "123 Pride Street",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      coordinates: {
        latitude: 47.6062,
        longitude: -122.3321
      }
    },
    contact: {
      phone: "(206) 555-0123",
      email: "hello@rainbowcafe.com",
      website: "https://rainbowcafe.com",
      socialMedia: {
        instagram: "@rainbowcafeseattle",
        facebook: "RainbowCafeSeattle"
      }
    },
    hours: {
      monday: { open: "07:00", close: "19:00", closed: false },
      tuesday: { open: "07:00", close: "19:00", closed: false },
      wednesday: { open: "07:00", close: "19:00", closed: false },
      thursday: { open: "07:00", close: "19:00", closed: false },
      friday: { open: "07:00", close: "21:00", closed: false },
      saturday: { open: "08:00", close: "21:00", closed: false },
      sunday: { open: "08:00", close: "18:00", closed: false }
    },
    lgbtqFriendly: {
      verified: true,
      certifications: ["LGBTQ+ Business Enterprise", "Pride Chamber Member"],
      inclusivityFeatures: ["Gender-neutral restrooms", "Pride flags displayed", "Safe space policy"]
    },
    accessibility: {
      wheelchairAccessible: true,
      brailleMenus: false,
      signLanguageSupport: false,
      quietSpaces: true,
      accessibilityNotes: "Fully wheelchair accessible with wide doorways and accessible seating"
    },
    ownerId: "sample-owner-1",
    status: "approved",
    featured: true,
    images: [],
    tags: ["coffee", "breakfast", "lgbtq-owned", "vegan-options", "wifi"],
    averageRating: 4.8,
    totalReviews: 23,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "Inclusive Health Clinic",
    description: "Comprehensive healthcare services with LGBTQ+ affirming care. Specializing in transgender health, HIV prevention, and general medical services.",
    category: "healthcare",
    location: {
      address: "456 Wellness Avenue",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      coordinates: {
        latitude: 45.5152,
        longitude: -122.6784
      }
    },
    contact: {
      phone: "(503) 555-0456",
      email: "info@inclusivehealthpdx.com",
      website: "https://inclusivehealthpdx.com"
    },
    hours: {
      monday: { open: "08:00", close: "17:00", closed: false },
      tuesday: { open: "08:00", close: "17:00", closed: false },
      wednesday: { open: "08:00", close: "17:00", closed: false },
      thursday: { open: "08:00", close: "17:00", closed: false },
      friday: { open: "08:00", close: "17:00", closed: false },
      saturday: { open: "09:00", close: "13:00", closed: false },
      sunday: { open: "", close: "", closed: true }
    },
    lgbtqFriendly: {
      verified: true,
      certifications: ["LGBTQ+ Healthcare Equality Index", "Trans-affirming care certified"],
      inclusivityFeatures: ["Trans-affirming care", "PrEP services", "Hormone therapy", "Gender-neutral forms"]
    },
    accessibility: {
      wheelchairAccessible: true,
      brailleMenus: true,
      signLanguageSupport: true,
      quietSpaces: true,
      accessibilityNotes: "Fully accessible facility with ASL interpreters available by appointment"
    },
    ownerId: "sample-owner-2",
    status: "approved",
    featured: false,
    images: [],
    tags: ["healthcare", "lgbtq-affirming", "transgender-care", "prep", "hiv-prevention"],
    averageRating: 4.9,
    totalReviews: 41,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "Spectrum Fitness",
    description: "An inclusive gym and fitness center welcoming all bodies and identities. Personal training, group classes, and a supportive community.",
    category: "fitness",
    location: {
      address: "789 Equality Boulevard",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      coordinates: {
        latitude: 37.7749,
        longitude: -122.4194
      }
    },
    contact: {
      phone: "(415) 555-0789",
      email: "info@spectrumfitnesssf.com",
      website: "https://spectrumfitnesssf.com",
      socialMedia: {
        instagram: "@spectrumfitnesssf",
        facebook: "SpectrumFitnessSF"
      }
    },
    hours: {
      monday: { open: "05:00", close: "23:00", closed: false },
      tuesday: { open: "05:00", close: "23:00", closed: false },
      wednesday: { open: "05:00", close: "23:00", closed: false },
      thursday: { open: "05:00", close: "23:00", closed: false },
      friday: { open: "05:00", close: "23:00", closed: false },
      saturday: { open: "06:00", close: "22:00", closed: false },
      sunday: { open: "06:00", close: "22:00", closed: false }
    },
    lgbtqFriendly: {
      verified: true,
      certifications: ["LGBTQ+ Business Alliance Member"],
      inclusivityFeatures: ["Gender-neutral changing rooms", "Trans-inclusive policies", "Body-positive environment"]
    },
    accessibility: {
      wheelchairAccessible: true,
      brailleMenus: false,
      signLanguageSupport: false,
      quietSpaces: false,
      accessibilityNotes: "Wheelchair accessible equipment and facilities available"
    },
    ownerId: "sample-owner-3",
    status: "pending",
    featured: false,
    images: [],
    tags: ["fitness", "gym", "personal-training", "group-classes", "inclusive"],
    averageRating: 4.6,
    totalReviews: 15,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

async function createSampleBusinesses() {
  console.log('🏢 Creating sample businesses...');
  
  try {
    const businessesRef = collection(db, 'businesses');
    
    for (const business of sampleBusinesses) {
      console.log(`➕ Adding ${business.name}...`);
      const docRef = await addDoc(businessesRef, business);
      console.log(`✅ Created ${business.name} with ID: ${docRef.id}`);
    }
    
    console.log('\n🎉 Sample businesses created successfully!');
    console.log(`📊 Created ${sampleBusinesses.length} businesses`);
    console.log('\nYou can now:');
    console.log('1. View them in the admin debug dashboard');
    console.log('2. Test the business listing features');
    console.log('3. Practice admin approval workflows\n');
    
  } catch (error) {
    console.error('❌ Error creating sample businesses:', error);
  }
}

// Run the script
createSampleBusinesses().then(() => {
  console.log('✅ Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
