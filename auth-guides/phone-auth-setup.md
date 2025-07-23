# Phone Number Authentication Setup Guide

## Firebase Console Setup

1. **Enable Phone Auth in Firebase Console**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Navigate to Authentication → Sign-in method
   - Find "Phone" in the list of providers and click on it
   - Toggle the "Enable" switch to ON
   - Save your changes

2. **Configure Phone Authentication Settings**:
   - While in the Phone provider section, you can configure:
     - Default country code
     - Test phone numbers (for development)
     - Set quotas and limits

3. **Set Up reCAPTCHA Verification (Web Only)**:
   - For web apps using phone auth, you'll need to set up reCAPTCHA
   - This is handled automatically in React Native/Expo

## Installation and Setup

1. **Install Required Packages**:
   ```bash
   # If using Expo
   expo install @react-native-firebase/app @react-native-firebase/auth
   
   # If using React Native CLI
   npm install @react-native-firebase/app @react-native-firebase/auth
   ```

2. **Android Configuration**:
   - Ensure your `android/app/build.gradle` has Google Play Services:
   ```gradle
   dependencies {
     // ... other dependencies
     implementation 'com.google.android.gms:play-services-base:18.2.0'
     implementation 'com.google.android.gms:play-services-safetynet:18.0.1'
   }
   ```

3. **iOS Configuration**:
   - Make sure you've completed the basic Firebase iOS setup
   - No additional steps needed specifically for phone auth

## Implementation Example

Here's a complete example of implementing phone authentication:

```javascript
import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

const PhoneAuthScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Send verification code
  const sendVerificationCode = async () => {
    try {
      setLoading(true);
      // Format phone number with country code
      const formattedNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+1${phoneNumber}`; // Default to US +1
      
      // Request verification code
      const confirmation = await auth().signInWithPhoneNumber(formattedNumber);
      setConfirm(confirmation);
      Alert.alert('Success', 'Verification code has been sent to your phone');
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error('Phone auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm verification code
  const confirmVerificationCode = async () => {
    try {
      setLoading(true);
      if (!confirm) {
        throw new Error('No confirmation pending');
      }
      
      // Confirm the code
      const userCredential = await confirm.confirm(verificationCode);
      
      // Handle successful authentication
      if (userCredential.user) {
        Alert.alert('Success', 'Phone authentication successful!');
        // Navigate to next screen or update user profile
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid verification code');
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show different UI based on whether confirmation has been sent
  if (!confirm) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Enter your phone number:</Text>
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="+1 (555) 555-5555"
          keyboardType="phone-pad"
          style={{ borderWidth: 1, padding: 10, marginVertical: 15 }}
        />
        <Button
          title={loading ? "Sending..." : "Send Verification Code"}
          onPress={sendVerificationCode}
          disabled={loading || !phoneNumber}
        />
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Enter the verification code sent to {phoneNumber}:</Text>
      <TextInput
        value={verificationCode}
        onChangeText={setVerificationCode}
        placeholder="123456"
        keyboardType="number-pad"
        style={{ borderWidth: 1, padding: 10, marginVertical: 15 }}
      />
      <Button
        title={loading ? "Verifying..." : "Verify Code"}
        onPress={confirmVerificationCode}
        disabled={loading || !verificationCode}
      />
    </View>
  );
};

export default PhoneAuthScreen;
```

## Best Practices

1. **Format Phone Numbers Correctly**:
   - Always include country code (e.g., +1 for US)
   - Remove spaces, dashes, and parentheses

2. **Handle Edge Cases**:
   - Network failures during verification
   - Expired verification codes
   - Users entering wrong numbers

3. **Testing**:
   - Use Firebase test phone numbers during development
   - Test with various country codes

4. **Security Considerations**:
   - Implement rate limiting on your server side
   - Consider adding CAPTCHA for web implementations
   - Be aware of SIM swap fraud risks

5. **User Experience**:
   - Show loading indicators during verification
   - Provide clear error messages
   - Allow users to edit phone numbers
   - Implement auto-detection of SMS codes if possible

## Troubleshooting

1. **Verification Code Not Received**:
   - Check phone number format
   - Verify carrier support
   - Check Firebase quotas and limits

2. **Authentication Failed**:
   - Check if the verification code expired (usually valid for 60 seconds)
   - Verify the code was entered correctly

3. **Configuration Issues**:
   - Make sure Firebase is properly set up in your project
   - Check that Phone Authentication is enabled in Firebase Console
