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

## 🔧 Configuration

### Accessibility Features

The app includes several configurable accessibility features:

```typescript
interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  voiceAnnouncements: boolean;
}
```

### LGBTQ+ Verification

Businesses can be verified through multiple methods:
- Document verification
- Certification programs
- Community verification
- Self-reporting

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run accessibility tests
npm run test:a11y
```

### Test Coverage

The app maintains comprehensive test coverage for:
- Accessibility compliance
- User interactions
- Navigation flows
- API integration
- Error handling

## 🚀 Deployment

### Building for Production

```bash
# Build for production
npx expo build:android
npx expo build:ios

# Or using EAS Build
npx eas build --platform all
```

### App Store Guidelines

The app follows accessibility guidelines for both app stores:
- iOS: VoiceOver compatibility and accessibility labels
- Android: TalkBack support and content descriptions

## 🤝 Contributing

We welcome contributions that improve accessibility and inclusivity:

1. **Accessibility First**: All features must meet WCAG 2.2 AA standards
2. **Inclusive Language**: Use inclusive, respectful language
3. **Testing**: Include accessibility tests for new features
4. **Documentation**: Document accessibility considerations

### Code Style

- Use TypeScript for type safety
- Follow React Native and accessibility best practices
- Include comprehensive accessibility labels
- Test with screen readers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support or questions:
- Create an issue in this repository
- Email: support@accesslink.example.com
- Community Discord: [Link]

## 🙏 Acknowledgments

- The LGBTQ+ community for inspiration and feedback
- Accessibility advocates for guidance and best practices
- Contributors who make this project possible

---

**AccessLink** - Building bridges to inclusive communities 🌈✨
