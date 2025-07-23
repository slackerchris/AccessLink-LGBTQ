# AccessLink LGBTQ+ - Developer Guide

This document provides technical information for developers working on the AccessLink LGBTQ+ mobile application. For general project information, see the main [README.md](./README.md).

## 🛠️ Development Setup

### Prerequisites

1. **Development Environment**
   - Node.js v18+ 
   - npm or yarn
   - Git

2. **IDE Setup**
   - VSCode recommended with these extensions:
     - ESLint
     - Prettier
     - React Native Tools
     - TypeScript React code snippets

3. **Mobile Development Tools**
   - Expo CLI: `npm install -g expo-cli`
   - For iOS: Xcode (Mac only)
   - For Android: Android Studio with emulator configured

### First-Time Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/AccessLink-LGBTQ.git
   cd AccessLink-LGBTQ
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase configuration
   ```

4. **Firebase setup**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication (email/password)
   - Create Firestore database
   - Add your Firebase config to .env file

### Development Workflow

1. **Running the App**
   ```bash
   npm start
   ```
   Then press:
   - `i` for iOS simulator
   - `a` for Android emulator
   - `w` for web browser
   - Scan QR code with Expo Go for physical device testing

2. **Development Process**
   - Create feature branches from `main`
   - Follow TypeScript best practices
   - Ensure accessibility for all components
   - Write tests for new functionality
   - Submit PR with detailed description

## 🛠 Architecture

### Technology Stack
- **Frontend**: React Native with Expo
- **Type System**: TypeScript for type safety
- **Navigation**: React Navigation with accessibility optimizations
- **UI Components**: Custom accessible components
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Maps**: React Native Maps integration
- **Testing**: Jest + React Native Testing Library
- **Linting**: ESLint with accessibility rules

### Directory Structure
```
/
├── assets/                # App assets (images, fonts)
├── src/                   # Source code
│   ├── accessibility/     # Accessibility utilities
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── navigation/        # Navigation configuration
│   ├── screens/           # Screen components
│   ├── services/          # API services and data layer
│   ├── theme/             # Design system and styling
│   └── types/             # TypeScript type definitions
├── App.tsx                # Main app component
├── app.json               # Expo configuration
└── index.js               # Entry point
```

## � Core Development Concepts

### State Management

The app uses a combination of React's Context API and local state:

1. **AuthContext**: Manages user authentication state
2. **AccessibilityContext**: Manages accessibility preferences
3. **Local Screen State**: Component-specific state using hooks

### Navigation Structure

```
AppNavigator (Main container)
├── AuthStack (When not authenticated)
│   ├── WelcomeScreen
│   ├── LoginScreen
│   └── RegistrationScreen
└── MainTabs (When authenticated)
    ├── HomeStack
    │   ├── HomeScreen
    │   └── BusinessDetailScreen
    ├── DiscoverStack
    │   ├── DiscoverScreen
    │   └── SearchResultsScreen
    └── ProfileStack
        ├── ProfileScreen
        └── SettingsScreen
```

### Firebase Integration

1. **Authentication**: User sign-up, login, and profile management
2. **Firestore**: Database for businesses, events, and user data
3. **Storage**: Image storage for business photos and accessibility features

### Accessibility Implementation

1. **AccessibilityProvider**: Context for app-wide accessibility preferences
2. **Accessible Components**: Enhanced with proper ARIA roles and attributes
3. **Screen Reader Support**: All elements properly labeled for VoiceOver/TalkBack

## � Development Guidelines

### Code Style

1. **TypeScript Best Practices**
   - Use explicit types rather than `any`
   - Prefer interfaces for object shapes
   - Use type guards for runtime type checking

2. **Component Structure**
   ```tsx
   // Component template
   import React from 'react';
   import { View, Text } from 'react-native';
   
   interface MyComponentProps {
     title: string;
     accessibilityLabel?: string;
   }
   
   export const MyComponent: React.FC<MyComponentProps> = ({ 
     title, 
     accessibilityLabel 
   }) => {
     return (
       <View>
         <Text accessibilityLabel={accessibilityLabel || title}>
           {title}
         </Text>
       </View>
     );
   };
   ```

3. **File Naming Conventions**
   - React components: `PascalCase.tsx`
   - Utility functions: `camelCase.ts`
   - Test files: `ComponentName.test.tsx`

### Accessibility Requirements

1. **All interactive elements must have**:
   - `accessibilityLabel`
   - `accessibilityRole`
   - Minimum touch target of 44×44dp

2. **All images must have**:
   - `accessibilityLabel` describing the image content
   - Decorative images marked appropriately

## 🧪 Testing Guidelines

### Automated Testing

1. **Component Tests**
   ```tsx
   import React from 'react';
   import { render, fireEvent } from '@testing-library/react-native';
   import { MyButton } from './MyButton';
   
   describe('MyButton', () => {
     it('renders correctly', () => {
       const { getByText } = render(<MyButton title="Press Me" />);
       expect(getByText("Press Me")).toBeTruthy();
     });
     
     it('handles press events', () => {
       const onPressMock = jest.fn();
       const { getByText } = render(
         <MyButton title="Press Me" onPress={onPressMock} />
       );
       
       fireEvent.press(getByText("Press Me"));
       expect(onPressMock).toHaveBeenCalledTimes(1);
     });
   });
   ```

2. **Accessibility Testing**
   ```tsx
   import { axe } from 'jest-axe';
   
   it('has no accessibility violations', async () => {
     const { container } = render(<MyComponent />);
     const results = await axe(container);
     expect(results).toHaveNoViolations();
   });
   ```

### Manual Testing

1. **Screen Reader Testing**:
   - Test all screens with VoiceOver (iOS) and TalkBack (Android)
   - Verify proper reading order and descriptions

2. **Visual Testing**:
   - Test with font scaling (up to 200%)
   - Test with device color inversion
   - Test with reduced motion settings enabled

## � API Services

### Firebase Services

The app uses Firebase for its backend services:

1. **Authentication**
   ```typescript
   // Example of authentication usage
   import { auth } from '../services/firebase';
   
   const signIn = async (email: string, password: string) => {
     try {
       const userCredential = await auth.signInWithEmailAndPassword(email, password);
       return userCredential.user;
     } catch (error) {
       console.error('Authentication error:', error);
       throw error;
     }
   };
   ```

2. **Firestore**
   ```typescript
   // Example of Firestore usage
   import { firestore } from '../services/firebase';
   
   const getBusinesses = async () => {
     try {
       const snapshot = await firestore.collection('businesses').get();
       return snapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data()
       }));
     } catch (error) {
       console.error('Firestore error:', error);
       throw error;
     }
   };
   ```

### API Service Layer

The app includes an API service layer that abstracts backend operations:

```typescript
// src/services/api/ApiService.ts
export class ApiService {
  static async getBusinesses(filters?: BusinessFilters) {
    // Implementation using Firebase or other backend
  }
  
  static async getBusinessById(id: string) {
    // Implementation
  }
  
  static async updateUserProfile(userId: string, data: UserProfile) {
    // Implementation
  }
}
```

## 🚀 Deployment Guide

### Environment Configuration

The app uses environment-specific configuration:

1. **Development**
   - Local Firebase emulators
   - Mock data for testing
   - Debug logging enabled

2. **Staging**
   - Test Firebase project
   - Sample data for QA
   - Limited logging

3. **Production**
   - Production Firebase instance
   - No debug features
   - Performance optimization

### Build Process

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure EAS Build
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

## 🔍 Performance Considerations

1. **Image Optimization**
   - Use appropriate image resolutions
   - Implement lazy loading for images
   - Consider using WebP format

2. **State Management**
   - Avoid unnecessary re-renders
   - Memoize expensive calculations
   - Use proper React hooks dependencies

3. **Firebase Usage**
   - Implement pagination for large data sets
   - Use efficient queries with proper indexes
   - Cache data when appropriate

## 📚 Learning Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [WCAG 2.2 Guidelines](https://www.w3.org/TR/WCAG22/)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)

---

**AccessLink LGBTQ+** - Creating accessible connections for all 🏳️‍🌈♿
