# Integrating Authentication Methods into AccessLink

This guide shows how to integrate both Phone Number authentication and Email Link (passwordless) authentication into your AccessLink LGBTQ+ app.

## Integrating Both Authentication Methods

To provide multiple sign-in options to your users, you'll want to integrate both authentication methods into a cohesive flow.

### 1. Create an Authentication Service

First, let's create an authentication service that handles all authentication methods in one place:

```javascript
// src/services/auth/AuthService.ts
import auth from '@react-native-firebase/auth';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AuthService {
  // Store the current user
  private static currentUser = auth().currentUser;

  // Email/Password Sign Up
  static async signUpWithEmail(email: string, password: string) {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      await userCredential.user.sendEmailVerification();
      return userCredential.user;
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  }

  // Email/Password Sign In
  static async signInWithEmail(email: string, password: string) {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  }

  // Phone Authentication - Request Verification Code
  static async requestPhoneVerification(phoneNumber: string) {
    try {
      const formattedNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+1${phoneNumber}`; // Default to US +1
      
      const confirmation = await auth().signInWithPhoneNumber(formattedNumber);
      return confirmation;
    } catch (error) {
      console.error('Phone auth error:', error);
      throw error;
    }
  }

  // Phone Authentication - Verify Code
  static async verifyPhoneCode(confirmation, verificationCode: string) {
    try {
      const userCredential = await confirmation.confirm(verificationCode);
      return userCredential.user;
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    }
  }

  // Email Link Authentication - Send Link
  static async sendSignInLink(email: string) {
    try {
      const actionCodeSettings = {
        url: Linking.createURL('auth/complete'),
        handleCodeInApp: true,
        iOS: {
          bundleId: 'com.accesslink.lgbtq'
        },
        android: {
          packageName: 'com.accesslink.lgbtq',
          installApp: true
        },
        dynamicLinkDomain: 'accesslink.page.link'
      };

      await auth().sendSignInLinkToEmail(email, actionCodeSettings);
      await AsyncStorage.setItem('emailForSignIn', email);
      return true;
    } catch (error) {
      console.error('Error sending sign-in link:', error);
      throw error;
    }
  }

  // Email Link Authentication - Complete Sign In
  static async completeSignInWithLink(url: string, email?: string) {
    try {
      if (auth().isSignInWithEmailLink(url)) {
        // Get stored email from AsyncStorage
        const storedEmail = email || await AsyncStorage.getItem('emailForSignIn');
        
        if (!storedEmail) {
          throw new Error('No email found for authentication');
        }

        // Complete the sign in process
        const result = await auth().signInWithEmailLink(storedEmail, url);
        
        // Clear stored email
        await AsyncStorage.removeItem('emailForSignIn');
        
        return result.user;
      }
      return null;
    } catch (error) {
      console.error('Email link sign in error:', error);
      throw error;
    }
  }

  // Sign Out
  static async signOut() {
    try {
      await auth().signOut();
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Get Current User
  static getCurrentUser() {
    return auth().currentUser;
  }

  // Set up auth state listener
  static onAuthStateChanged(callback) {
    return auth().onAuthStateChanged(callback);
  }
}

export default AuthService;
```

### 2. Create an Auth Provider Component

Next, create an Auth Provider that uses React Context to manage authentication state:

```javascript
// src/services/auth/AuthProvider.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Linking from 'expo-linking';
import AuthService from './AuthService';

// Create context
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phoneConfirmation, setPhoneConfirmation] = useState(null);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Set up deep linking listener for email link auth
    const handleInitialURL = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          handleIncomingLink(url);
        }
      } catch (error) {
        console.error('Error getting initial URL', error);
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleIncomingLink(url);
    });

    handleInitialURL();

    // Cleanup
    return () => {
      unsubscribe();
      subscription.remove();
    };
  }, []);

  // Handle incoming email link
  const handleIncomingLink = async (url) => {
    try {
      if (AuthService.isSignInWithEmailLink(url)) {
        setLoading(true);
        await AuthService.completeSignInWithLink(url);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error handling incoming link:', error);
      setLoading(false);
    }
  };

  // Auth methods
  const authMethods = {
    // Email password auth
    signUp: async (email, password) => {
      setLoading(true);
      try {
        const user = await AuthService.signUpWithEmail(email, password);
        setLoading(false);
        return user;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },

    signIn: async (email, password) => {
      setLoading(true);
      try {
        const user = await AuthService.signInWithEmail(email, password);
        setLoading(false);
        return user;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },

    // Phone auth
    requestPhoneVerification: async (phoneNumber) => {
      setLoading(true);
      try {
        const confirmation = await AuthService.requestPhoneVerification(phoneNumber);
        setPhoneConfirmation(confirmation);
        setLoading(false);
        return confirmation;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },

    verifyPhoneCode: async (verificationCode) => {
      if (!phoneConfirmation) throw new Error('No confirmation pending');
      
      setLoading(true);
      try {
        const user = await AuthService.verifyPhoneCode(phoneConfirmation, verificationCode);
        setPhoneConfirmation(null);
        setLoading(false);
        return user;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },

    // Email link auth
    sendSignInLink: async (email) => {
      setLoading(true);
      try {
        await AuthService.sendSignInLink(email);
        setLoading(false);
        return true;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },

    // Sign out
    signOut: async () => {
      setLoading(true);
      try {
        await AuthService.signOut();
        setLoading(false);
        return true;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        ...authMethods,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
```

### 3. Create Authentication Screens

Now, create the UI screens for your authentication methods:

#### Main Authentication Screen

```javascript
// src/screens/AuthScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AuthScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to AccessLink LGBTQ+</Text>
      <Text style={styles.subtitle}>Choose a sign-in method:</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('EmailPasswordAuth')}
      >
        <Text style={styles.buttonText}>Email & Password</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('PhoneAuth')}
      >
        <Text style={styles.buttonText}>Phone Number</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('EmailLinkAuth')}
      >
        <Text style={styles.buttonText}>Email Link (No Password)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AuthScreen;
```

### 4. Set Up Navigation

Create a navigation structure that includes all authentication methods:

```javascript
// src/navigation/AuthNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import AuthScreen from '../screens/AuthScreen';
import EmailPasswordAuthScreen from '../screens/EmailPasswordAuthScreen';
import PhoneAuthScreen from '../screens/PhoneAuthScreen';
import EmailLinkAuthScreen from '../screens/EmailLinkAuthScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="EmailPasswordAuth" component={EmailPasswordAuthScreen} />
      <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
      <Stack.Screen name="EmailLinkAuth" component={EmailLinkAuthScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
```

### 5. Wrap Your App with the Auth Provider

Finally, wrap your entire app with the AuthProvider:

```javascript
// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/services/auth/AuthProvider';
import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
```

## Managing User Profiles Across Authentication Methods

When users can sign in through multiple methods, you'll want to maintain a consistent user profile:

```javascript
// src/services/userProfile.js
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const createOrUpdateUserProfile = async (user, additionalData = {}) => {
  if (!user) return;

  // Reference to user document
  const userRef = firestore().collection('users').doc(user.uid);

  try {
    // Check if user document exists
    const snapshot = await userRef.get();
    
    if (!snapshot.exists) {
      // Create new user profile
      const { email, phoneNumber, displayName, photoURL } = user;
      
      const userData = {
        email,
        phoneNumber,
        displayName: displayName || additionalData.displayName || null,
        photoURL: photoURL || null,
        createdAt: firestore.FieldValue.serverTimestamp(),
        // User preferences and settings
        preferences: {
          notifications: true,
          emailUpdates: true,
          accessibility: {
            // Default accessibility settings
            largeText: false,
            highContrast: false,
          },
        },
        // Track which auth methods this user has used
        authMethods: {
          email: !!email,
          phone: !!phoneNumber,
          emailLink: additionalData.usedEmailLink || false,
        },
        // Add any additional data passed in
        ...additionalData,
      };
      
      await userRef.set(userData);
      return userData;
    } else {
      // Update existing user data
      const updateData = {
        lastLogin: firestore.FieldValue.serverTimestamp(),
      };
      
      // Update auth methods
      if (user.email) {
        updateData['authMethods.email'] = true;
      }
      if (user.phoneNumber) {
        updateData['authMethods.phone'] = true;
      }
      if (additionalData.usedEmailLink) {
        updateData['authMethods.emailLink'] = true;
      }
      
      // Add any additional data passed in
      Object.keys(additionalData).forEach(key => {
        updateData[key] = additionalData[key];
      });
      
      await userRef.update(updateData);
      
      // Return the updated user data
      const updatedUser = await userRef.get();
      return updatedUser.data();
    }
  } catch (error) {
    console.error('Error creating or updating user profile:', error);
    throw error;
  }
};

export const linkPhoneToExistingAccount = async (phoneCredential) => {
  try {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }
    
    // Link the phone credential to the current user
    await currentUser.linkWithCredential(phoneCredential);
    
    // Update the user profile
    await createOrUpdateUserProfile(auth().currentUser, {
      'authMethods.phone': true
    });
    
    return auth().currentUser;
  } catch (error) {
    console.error('Error linking phone to existing account:', error);
    throw error;
  }
};

export const linkEmailToExistingAccount = async (email, password) => {
  try {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }
    
    const emailCredential = auth.EmailAuthProvider.credential(email, password);
    
    // Link the email credential to the current user
    await currentUser.linkWithCredential(emailCredential);
    
    // Update the user profile
    await createOrUpdateUserProfile(auth().currentUser, {
      'authMethods.email': true
    });
    
    return auth().currentUser;
  } catch (error) {
    console.error('Error linking email to existing account:', error);
    throw error;
  }
};
```

## Testing the Authentication Flow

Once implemented, test your authentication flow thoroughly:

1. **Install and Set Up the App**:
   - Install the app on a test device
   - Clear any existing authentication state

2. **Test Phone Authentication**:
   - Enter a valid phone number
   - Verify the verification code is received
   - Enter the code and confirm successful authentication
   - Check that the user profile is created correctly

3. **Test Email Link Authentication**:
   - Enter a valid email address
   - Check that the email with the link is received
   - Click the link and confirm it opens the app
   - Verify successful authentication
   - Check that the user profile is updated correctly

4. **Test Multiple Authentication Methods**:
   - Sign in with one method
   - Link a different authentication method to the same account
   - Sign out and sign back in with the second method
   - Confirm it accesses the same user account

Remember to test edge cases and error scenarios as well, such as:
- Invalid phone numbers or verification codes
- Expired email links
- Network errors during authentication
- Attempting to use email that's already registered with a different phone number
