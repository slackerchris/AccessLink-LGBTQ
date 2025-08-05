/**
 * Add Sample Business Data Script (JavaScript version)
 * Creates sample businesses for testing the new architecture
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, addDoc, collection, serverTimestamp } = require('firebase/firestore');

// Firebase config - using the same config as your app
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

console.log('🔧 Firebase config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleBusinesses = [
  {
    name: "Rainbow Café",
    description: "A cozy coffee shop that celebrates diversity and serves amazing organic coffee. LGBTQ+ owned and operated with a welcoming atmosphere for everyone.",
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
        instagram: "@rainbowcafe_seattle",
        facebook: "RainbowCafeSeattle"
      }
    },
    lgbtqFriendly: {
      verified: true,
      certifications: ["LGBTQ Business Enterprise"],
      inclusivityFeatures: ["Pride flags displayed", "Gender-neutral restrooms", "LGBTQ+ staff training"]
    },
    accessibility: {
      wheelchairAccessible: true,
      brailleMenus: false,
      signLanguageSupport: false,
      quietSpaces: true,
      accessibilityNotes: "Fully wheelchair accessible with wide doors and accessible restroom"
    },
    ownerId: "sample-owner-1",
    status: "approved",
    featured: true,
    images: [],
    tags: ["coffee", "lgbt", "organic", "cozy", "inclusive"],
    averageRating: 4.8,
    totalReviews: 127
  },
  {
    name: "Inclusive Health Center",
    description: "Comprehensive healthcare services with LGBTQ+ affirmative care. Our providers are trained in trans-inclusive care and we welcome all patients.",
    category: "healthcare",
    location: {
      address: "456 Medical Ave",
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
      email: "info@inclusivehealth.org",
      website: "https://inclusivehealth.org"
    },
    lgbtqFriendly: {
      verified: true,
      certifications: ["LGBTQ Healthcare Equality Index", "Trans-Affirming Care Certified"],
      inclusivityFeatures: ["Trans-affirming care", "Hormone therapy", "Mental health support"]
    },
    accessibility: {
      wheelchairAccessible: true,
      brailleMenus: true,
      signLanguageSupport: true,
      quietSpaces: true,
      accessibilityNotes: "Fully accessible facility with ADA compliant features"
    },
    ownerId: "sample-owner-2",
    status: "approved",
    featured: false,
    images: [],
    tags: ["healthcare", "lgbtq", "trans", "affirming", "inclusive"],
    averageRating: 4.9,
    totalReviews: 89
  },
  {
    name: "Spectrum Fitness",
    description: "A welcoming gym and fitness center for the LGBTQ+ community and allies. Body-positive environment with personal trainers who understand diverse needs.",
    category: "fitness",
    location: {
      address: "789 Wellness Way",
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
      email: "join@spectrumfitness.com",
      website: "https://spectrumfitness.com",
      socialMedia: {
        instagram: "@spectrum_fitness_sf",
        facebook: "SpectrumFitnessSF"
      }
    },
    lgbtqFriendly: {
      verified: true,
      certifications: ["LGBTQ+ Inclusive Business"],
      inclusivityFeatures: ["Gender-neutral changing rooms", "LGBTQ+ fitness classes", "Body-positive environment"]
    },
    accessibility: {
      wheelchairAccessible: true,
      brailleMenus: false,
      signLanguageSupport: false,
      quietSpaces: true,
      accessibilityNotes: "Wheelchair accessible equipment and facilities available"
    },
    ownerId: "sample-owner-3",
    status: "approved",
    featured: true,
    images: [],
    tags: ["fitness", "gym", "lgbtq", "inclusive", "bodypositive"],
    averageRating: 4.7,
    totalReviews: 156
  }
];

async function addSampleBusinesses() {
  console.log('🚀 Adding sample business data...');
  
  try {
    let added = 0;
    
    for (const businessData of sampleBusinesses) {
      const business = {
        ...businessData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'businesses'), business);
      console.log(`✅ Added business: ${business.name} (ID: ${docRef.id})`);
      added++;
    }
    
    console.log(`🎉 Successfully added ${added} sample businesses!`);
    console.log('💡 Run the migration script next to populate optimized collections');
    
  } catch (error) {
    console.error('❌ Failed to add sample businesses:', error);
    throw error;
  }
}

// Run the script
addSampleBusinesses()
  .then(() => {
    console.log('✨ Sample data addition complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to add sample data:', error);
    process.exit(1);
  });
