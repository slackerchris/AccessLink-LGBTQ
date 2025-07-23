# Email Link (Passwordless) Authentication Setup Guide

## Firebase Console Setup

1. **Enable Email Link Authentication**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Navigate to Authentication → Sign-in method
   - Find "Email/Password" in the list of providers
   - Enable the "Email link (passwordless sign-in)" option
   - Save your changes

2. **Configure Action URL Settings**:
   - In Authentication → Settings → Authorized domains
   - Add your app domains that can handle authentication redirects
   - For mobile apps, you'll need to add your custom URL scheme domains

3. **Customize Email Templates**:
   - Go to Authentication → Templates → Email link for sign-in
   - Customize the email that users will receive with the login link
   - Add your app branding and clear instructions

## Installation and Setup

1. **Install Required Packages**:
   ```bash
   # If using Expo
   expo install @react-native-firebase/app @react-native-firebase/auth expo-linking
   
   # If using React Native CLI
   npm install @react-native-firebase/app @react-native-firebase/auth react-native-linking
   ```

2. **Configure Deep Linking for Your App**:

   For Expo apps, update your `app.json`:
   ```json
   {
     "expo": {
       "scheme": "accesslink",
       "android": {
         "intentFilters": [
           {
             "action": "VIEW",
             "data": [
               {
                 "scheme": "accesslink"
               }
             ],
             "category": [
               "BROWSABLE",
               "DEFAULT"
             ]
           }
         ]
       },
       "ios": {
         "associatedDomains": [
           "applinks:accesslinklgbtq.app"
         ]
       }
     }
   }
   ```

   For React Native CLI apps, refer to the [React Native deep linking documentation](https://reactnative.dev/docs/linking).

## Implementation Example

Here's a complete example of implementing email link authentication:

```javascript
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import * as Linking from 'expo-linking';

const EmailLinkAuthScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  // Handle incoming links when app opens
  useEffect(() => {
    // Handle the app opening from a deep link
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

    // Handle links when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleIncomingLink(url);
    });

    handleInitialURL();

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, []);

  // Process incoming authentication links
  const handleIncomingLink = async (url) => {
    try {
      if (auth().isSignInWithEmailLink(url)) {
        // Get stored email from local storage or state management
        const storedEmail = localStorage.getItem('emailForSignIn') || email;
        
        if (!storedEmail) {
          // If no email found, prompt the user for it
          Alert.alert(
            'Email Required',
            'Please provide the same email you used to request the sign-in link',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Implement flow to collect email
                }
              }
            ]
          );
          return;
        }

        setLoading(true);
        
        // Complete the sign in process
        const result = await auth().signInWithEmailLink(storedEmail, url);
        
        // Clear stored email
        localStorage.removeItem('emailForSignIn');
        
        Alert.alert('Success', 'You have been signed in successfully!');
        // Navigate to home screen or handle successful login
      }
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error('Email link sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send sign-in link to email
  const sendSignInLink = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      
      const actionCodeSettings = {
        // URL you want to redirect to after email is opened
        // Must be whitelisted in Firebase Console
        url: 'https://accesslinklgbtq.app/auth/complete', 
        handleCodeInApp: true,
        iOS: {
          bundleId: 'com.accesslink.lgbtq'
        },
        android: {
          packageName: 'com.accesslink.lgbtq',
          installApp: true
        },
        // Dynamic link parameters if using Firebase Dynamic Links
        dynamicLinkDomain: 'accesslink.page.link'
      };

      await auth().sendSignInLinkToEmail(email, actionCodeSettings);
      
      // Save email to localStorage
      localStorage.setItem('emailForSignIn', email);
      
      setLinkSent(true);
      Alert.alert(
        'Link Sent!',
        `A sign-in link has been sent to ${email}. Please check your email.`
      );
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error('Error sending sign-in link:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        {linkSent ? 'Check Your Email' : 'Sign in with Email Link'}
      </Text>
      
      {!linkSent ? (
        <>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
          />
          <Button
            title={loading ? "Sending..." : "Send Sign-In Link"}
            onPress={sendSignInLink}
            disabled={loading || !email}
          />
        </>
      ) : (
        <View>
          <Text>
            We've sent a sign-in link to {email}.
            Please check your email and click the link to sign in.
          </Text>
          <Button
            title="Send Link Again"
            onPress={sendSignInLink}
            disabled={loading}
          />
        </View>
      )}
    </View>
  );
};

export default EmailLinkAuthScreen;
```

## Handling Email Link Authentication Flow

1. **Send Email Link**:
   - User enters their email
   - App sends authentication link
   - App stores email locally (for completing sign-in)

2. **User Opens Email**:
   - User clicks link in email
   - Link opens your app

3. **Complete Authentication**:
   - App detects incoming link
   - App verifies it's a valid sign-in link
   - App retrieves previously stored email
   - App completes sign-in process

## Best Practices

1. **Security Considerations**:
   - Links expire after a short period (typically 1 hour)
   - Links can only be used once
   - Store email securely for completing the sign-in process
   - Set proper authorized domains in Firebase Console

2. **User Experience**:
   - Provide clear instructions in the UI
   - Handle app not installed cases (for mobile)
   - Implement a fallback mechanism if something goes wrong
   - Consider showing loading states during authentication

3. **Error Handling**:
   - Handle expired links
   - Handle already used links
   - Handle network errors

4. **Testing**:
   - Test on real devices
   - Test with various email providers
   - Test the full authentication flow multiple times

## Troubleshooting

1. **Link Not Opening App**:
   - Verify deep linking configuration
   - Check authorized domains in Firebase Console
   - Ensure the link format matches expected format

2. **Authentication Failed**:
   - Check if the link expired
   - Verify the email matches the one used to request the link
   - Check Firebase Authentication logs in console

3. **Email Not Received**:
   - Check spam folder
   - Verify email address format
   - Check Firebase quotas and limits
   - Test with different email providers
