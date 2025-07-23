# AccessLink LGBTQ+ Server-Side Setup Guide

This comprehensive guide walks you through setting up all the server-side infrastructure needed for the AccessLink LGBTQ+ app.

## 📋 Overview

The AccessLink app uses the following server-side services:
- **Firebase**: Authentication, Firestore database, Cloud Storage
- **Google Maps API**: Location services and mapping
- **Expo Services**: Push notifications and over-the-air updates
- **Optional Services**: Analytics, crash reporting, monitoring

---

## 🔥 Firebase Setup

Firebase is the primary backend service for AccessLink, providing authentication, database, and file storage.

### Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**
   ```
   Project Name: AccessLink LGBTQ+
   Project ID: accesslinklgbtq-prod (or your preferred ID)
   ```
   - Enable Google Analytics (recommended)
   - Choose or create a Google Analytics account

### Step 2: Configure Firebase Services

#### Authentication Setup

1. **Enable Authentication**
   - Go to Authentication → Sign-in method
   - Enable the following providers:
     ```
     ✅ Email/Password
     ✅ Google (optional, for social login)
     ✅ Apple (iOS only, optional)
     ✅ Phone Number (optional, for SMS verification)
     ```
   - For Email/Password:
     - Enable "Email link (passwordless sign-in)" if you want passwordless login
     - Set minimum password length (recommended: 8+ characters)
   
2. **Configure Email Templates**
   - Go to Authentication → Templates
   - Customize email verification template
     - Set up custom logo and brand colors
     - Use friendly, inclusive language
     - Include support contact information
   - Set up password reset email template
     - Personalize with user's name if possible
     - Include clear reset instructions
   - Configure sender name: "AccessLink LGBTQ+"
   - Set sender email (recommended: noreply@yourdomain.com)

3. **Configure Authentication Settings**
   - Go to Authentication → Settings
   - User actions:
     - Enable email verification (recommended)
     - Set password policy (special characters, numbers, etc.)
   - Security:
     - Set session duration (default: 1 hour)
     - Enable "block functions on security rules" (recommended)

4. **Setup Multi-Factor Authentication (MFA)**
   - Go to Authentication → MFA
   - Enable SMS verification as second factor
   - Configure MFA settings for admin accounts

5. **Social Authentication Configuration**
   - For Google Auth:
     - Create OAuth Client ID in Google Cloud Console
     - Configure authorized domains
     - Add your app's bundle ID/package name
   - For Apple Auth:
     - Create App ID in Apple Developer Portal
     - Configure Sign in with Apple capability
     - Generate and configure Service ID

6. **Firebase Auth SDK Implementation**
   ```javascript
   // Example code for React Native implementation
   import auth from '@react-native-firebase/auth';

   // Email/Password Sign Up
   const signUp = async (email, password) => {
     try {
       const userCredential = await auth().createUserWithEmailAndPassword(email, password);
       await userCredential.user.sendEmailVerification();
       return userCredential.user;
     } catch (error) {
       console.error('Error signing up:', error.message);
       throw error;
     }
   };

   // Email/Password Sign In
   const signIn = async (email, password) => {
     try {
       const userCredential = await auth().signInWithEmailAndPassword(email, password);
       return userCredential.user;
     } catch (error) {
       console.error('Error signing in:', error.message);
       throw error;
     }
   };

   // Google Sign In
   const googleSignIn = async () => {
     // Implementation depends on Expo or React Native setup
   };
   ```

7. **User Profile and Permissions**
   - Create a "users" collection in Firestore
   - Store extended user profile information
   - Set up custom claims for role-based access:
     ```javascript
     // Admin function example
     const setAdminRole = async (uid) => {
       await admin.auth().setCustomUserClaims(uid, { admin: true });
     };
     ```

#### Firestore Database Setup

1. **Create Firestore Database**
   - Go to Firestore Database → Create database
   - Start in **production mode** (we'll configure rules later)
   - Choose location closest to your users (e.g., us-central1)

2. **Set Up Database Structure**
   ```
   /businesses/{businessId}
   /users/{userId}
   /reviews/{reviewId}
   /events/{eventId}
   /categories/{categoryId}
   /accessibility_features/{featureId}
   ```

3. **Configure Security Rules** (Basic example)
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Anyone can read businesses and reviews
       match /businesses/{document=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       
       match /reviews/{document=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

#### Cloud Storage Setup

1. **Create Storage Bucket**
   - Go to Storage → Get started
   - Use default security rules for now
   - Create folders:
     ```
     /business_images/
     /user_avatars/
     /event_images/
     ```

2. **Configure Storage Rules**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /business_images/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       match /user_avatars/{userId}/{allPaths=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

### Step 3: Add App to Firebase Project

#### For React Native/Expo

1. **Add Web App**
   - Click "Add app" → Web (</>) icon
   - App nickname: "AccessLink LGBTQ+ App"
   - Copy the Firebase configuration object

2. **Get Configuration Values**
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

#### For iOS (if building standalone)

1. **Add iOS App**
   - Bundle ID: `com.yourcompany.accesslinklgbtq`
   - Download `GoogleService-Info.plist`
   - Add to your iOS project

#### for Android (if building standalone)

1. **Add Android App**
   - Package name: `com.yourcompany.accesslinklgbtq`
   - Download `google-services.json`
   - Add to your Android project

---

## 🗺️ Google Maps API Setup

Required for location services, maps, and geocoding.

### Step 1: Enable Google Cloud APIs

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing Firebase project

2. **Enable Required APIs**
   - Go to APIs & Services → Library
   - Enable these APIs:
     ```
     ✅ Maps JavaScript API
     ✅ Places API
     ✅ Geocoding API
     ✅ Geolocation API
     ```

### Step 2: Create API Keys

1. **Create API Key**
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → API Key
   - Copy the API key

2. **Restrict API Key (Security)**
   ```
   Application restrictions:
   - HTTP referrers (for web)
   - Add your domain: https://yourdomain.com/*
   
   API restrictions:
   - Restrict to selected APIs
   - Select: Maps JavaScript API, Places API, Geocoding API
   ```

3. **Create Mobile API Keys** (if needed)
   - Create separate keys for iOS/Android
   - Restrict by bundle ID/package name

---

## 📱 Expo Services Setup

For push notifications and over-the-air updates.

### Step 1: Expo Account

1. **Create Expo Account**
   - Visit [Expo.dev](https://expo.dev/)
   - Sign up or sign in
   - Create organization (optional)

2. **Install Expo CLI**
   ```bash
   npm install -g @expo/cli
   expo login
   ```

### Step 2: Configure Project

1. **Initialize Expo Project**
   ```bash
   cd AccessLink
   expo init --template blank-typescript
   ```

2. **Configure app.json**
   ```json
   {
     "expo": {
       "name": "AccessLink LGBTQ+",
       "slug": "accesslink-lgbtq",
       "version": "1.0.0",
       "orientation": "portrait",
       "icon": "./assets/icon.png",
       "userInterfaceStyle": "automatic",
       "splash": {
         "image": "./assets/splash.png",
         "resizeMode": "contain",
         "backgroundColor": "#ffffff"
       },
       "assetBundlePatterns": [
         "**/*"
       ],
       "ios": {
         "supportsTablet": true,
         "bundleIdentifier": "com.yourcompany.accesslinklgbtq"
       },
       "android": {
         "package": "com.yourcompany.accesslinklgbtq"
       }
     }
   }
   ```

### Step 3: Push Notifications

1. **Configure Push Notifications**
   ```bash
   expo install expo-notifications
   ```

2. **Get Push Token**
   - Expo handles push token generation
   - No additional server setup required for development

---

## 🔧 Environment Configuration

### Step 1: Create Environment Files

Create `.env` file in the AccessLink directory:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# App Configuration
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_API_URL=https://your-api-domain.com

# Optional Services
EXPO_PUBLIC_ANALYTICS_ID=your-analytics-id
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### Step 2: Environment-Specific Configs

Create multiple environment files:
```
.env.development
.env.staging
.env.production
```

---

## 🛡️ Security Configuration

### Firebase Security Rules

#### Firestore Security Rules (Advanced)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isValidEmail() {
      return request.auth.token.email_verified;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (isOwner(userId) || resource.data.privacy.profileVisible == true);
      allow write: if isAuthenticated() && isOwner(userId) && isValidEmail();
    }
    
    // Businesses collection
    match /businesses/{businessId} {
      allow read: if true; // Public read access
      allow create: if isAuthenticated() && isValidEmail();
      allow update: if isAuthenticated() && 
        (isOwner(resource.data.ownerId) || request.auth.uid in resource.data.editors);
      allow delete: if isAuthenticated() && isOwner(resource.data.ownerId);
    }
    
    // Reviews collection
    match /reviews/{reviewId} {
      allow read: if true; // Public read access
      allow create: if isAuthenticated() && isValidEmail() && 
        request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && isOwner(resource.data.userId);
    }
    
    // Events collection
    match /events/{eventId} {
      allow read: if true; // Public read access
      allow write: if isAuthenticated() && isValidEmail();
    }
  }
}
```

#### Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isValidFileType() {
      return request.resource.contentType.matches('image/.*');
    }
    
    function isValidSize() {
      return request.resource.size < 5 * 1024 * 1024; // 5MB limit
    }
    
    match /business_images/{businessId}/{fileName} {
      allow read: if true;
      allow write: if isAuthenticated() && isValidFileType() && isValidSize();
    }
    
    match /user_avatars/{userId}/{fileName} {
      allow read, write: if isAuthenticated() && isOwner(userId) && 
        isValidFileType() && isValidSize();
    }
    
    match /event_images/{eventId}/{fileName} {
      allow read: if true;
      allow write: if isAuthenticated() && isValidFileType() && isValidSize();
    }
  }
}
```

---

## 📊 Database Schema Setup

### Initial Collections and Documents

Use Firebase Console or create a setup script:

```javascript
// collections/categories.js
const categories = [
  {
    id: 'restaurants',
    name: 'Restaurants & Cafes',
    icon: 'restaurant',
    description: 'Dining establishments'
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: 'medical',
    description: 'Medical and wellness services'
  },
  {
    id: 'retail',
    name: 'Retail & Shopping',
    icon: 'shopping',
    description: 'Stores and shopping centers'
  },
  {
    id: 'services',
    name: 'Professional Services',
    icon: 'business',
    description: 'Legal, financial, and other services'
  }
];

// collections/accessibility_features.js
const accessibilityFeatures = [
  {
    id: 'wheelchair_accessible',
    name: 'Wheelchair Accessible',
    icon: 'wheelchair',
    category: 'mobility'
  },
  {
    id: 'braille_menus',
    name: 'Braille Menus',
    icon: 'braille',
    category: 'vision'
  },
  {
    id: 'sign_language',
    name: 'Sign Language Services',
    icon: 'sign-language',
    category: 'hearing'
  },
  {
    id: 'quiet_spaces',
    name: 'Quiet Spaces Available',
    icon: 'volume-off',
    category: 'sensory'
  }
];
```

---

## 🔄 Deployment & CI/CD

### Option 1: Expo Application Services (EAS)

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   eas login
   ```

2. **Configure EAS**
   ```bash
   cd AccessLink
   eas build:configure
   ```

3. **Create eas.json**
   ```json
   {
     "cli": {
       "version": ">= 3.0.0"
     },
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal"
       },
       "production": {}
     },
     "submit": {
       "production": {}
     }
   }
   ```

### Option 2: Firebase Hosting (Web)

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Hosting**
   ```bash
   firebase init hosting
   ```

3. **Deploy**
   ```bash
   npm run build:web
   firebase deploy --only hosting
   ```

---

## 📈 Monitoring & Analytics

### Firebase Analytics

1. **Enable Analytics**
   - Already enabled during Firebase project creation
   - No additional setup required

### Crashlytics (Optional)

1. **Enable Crashlytics**
   ```bash
   expo install expo-firebase-crashlytics
   ```

2. **Configure in Firebase Console**
   - Go to Crashlytics → Enable

### Performance Monitoring (Optional)

1. **Enable Performance**
   - Go to Performance → Get started
   - Add SDK to your app

---

## ✅ Verification Checklist

Before launching, verify all services:

### Firebase Checklist
- [ ] Authentication working (signup/login)
- [ ] Firestore reads/writes working
- [ ] Storage uploads working
- [ ] Security rules properly configured
- [ ] Email templates configured

### Google Maps Checklist
- [ ] Maps displaying correctly
- [ ] Places API working (search)
- [ ] Geocoding working (addresses)
- [ ] API keys properly restricted

### Expo Checklist
- [ ] App builds successfully
- [ ] Push notifications working
- [ ] Environment variables set
- [ ] Production build tested

### Security Checklist
- [ ] API keys restricted
- [ ] Environment variables secured
- [ ] Database rules tested
- [ ] Storage rules tested

---

## 🆘 Troubleshooting

### Common Issues

1. **Firebase Connection Issues**
   ```
   Error: Default Firebase app not initialized
   Solution: Check environment variables and Firebase config
   ```

2. **Google Maps Not Loading**
   ```
   Error: API key invalid
   Solution: Verify API key and restrictions in Google Cloud Console
   ```

3. **Authentication Errors**
   ```
   Error: Email not verified
   Solution: Check email verification flow in Firebase Console
   ```

### Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [Google Maps Platform](https://developers.google.com/maps)
- [React Native Firebase](https://rnfirebase.io/)

---

## 📞 Next Steps

After completing this setup:

1. **Test all services** in development environment
2. **Create staging environment** with separate Firebase project
3. **Set up monitoring and alerts**
4. **Configure automated backups**
5. **Plan for scaling** (Firestore limits, storage costs)

This setup provides a robust, scalable backend for the AccessLink LGBTQ+ app with proper security, monitoring, and deployment practices.
