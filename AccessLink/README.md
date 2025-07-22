# AccessLink LGBT## 📝 Changelog

### July 22, 2025
- Fixed ESLint issues across all screen components
  - Corrected style property ordering (alignItems, flex, justifyContent)
  - Added proper Text wrapping in button components
  - Removed unused imports
  - Implemented proper error handling
  - Fixed variable naming and usage in auth and API services
- **Prepared iOS deployment configuration**
  - Created EAS build configuration (eas.json)
  - Configured iOS permissions and settings
  - Added deployment documentation

## 🚀 iOS Deployment

### Prerequisites for iOS Build
- **macOS machine** (required for local iOS builds)
- **Xcode** (latest version)
- **iOS Developer Account** (for App Store deployment)
- **EAS CLI** (installed globally)

### Building for iOS

1. **Install EAS CLI globally:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure EAS project:**
   ```bash
   eas build:configure
   ```

4. **Build for iOS (cloud build):**
   ```bash
   # Development build for testing
   eas build --platform ios --profile development
   
   # Production build for App Store
   eas build --platform ios --profile production
   ```

5. **Local iOS build (macOS only):**
   ```bash
   # Build locally on macOS
   eas build --platform ios --local
   
   # Or use Expo CLI
   npx expo run:ios
   ```

### iOS Simulator Testing

1. **Start development server:**
   ```bash
   npm start
   ```

2. **Press 'i' to open iOS simulator** or run:
   ```bash
   npx expo start --ios
   ```

### App Store Deployment

1. **Create production build:**
   ```bash
   eas build --platform ios --profile production
   ```

2. **Submit to App Store:**
   ```bash
   eas submit --platform ios
   ```

### iOS Configuration Details

The app is configured with:
- **Bundle Identifier:** `com.accesslink.lgbtq`
- **Location permissions** for finding nearby businesses
- **Camera/Photo permissions** for accessibility photos
- **Accessibility features** optimized for VoiceOver
- **Universal links** for deep linking App

An accessibility-first mobile application connecting disabled LGBTQ+ individuals with inclusive, accessible businesses and community events.

## 🌈 Project Overview

AccessLink LGBTQ+ is designed with accessibility as the primary focus, ensuring that disabled LGBTQ+ individuals can easily discover and connect with businesses and events that meet their specific accessibility needs while being affirming of their identities.

## ✨ Key Features

- **Comprehensive Accessibility Filters**: Physical, sensory, and cognitive accessibility features
- **LGBTQ+ Business Verification**: Verified LGBTQ+-owned and friendly businesses
- **Accessibility-First Design**: Built with WCAG 2.2 AA/AAA compliance
- **Community Events**: Accessible events with detailed accommodation information
- **User Reviews**: Both general and accessibility-specific ratings
- **Screen Reader Optimized**: Full VoiceOver and TalkBack support

## � Changelog

### July 22, 2025
- Fixed ESLint issues across all screen components
  - Corrected style property ordering (alignItems, flex, justifyContent)
  - Added proper Text wrapping in button components
  - Removed unused imports
  - Implemented proper error handling
  - Fixed variable naming and usage in auth and API services

## �🛠 Technology Stack

- **Frontend**: React Native with Expo
- **Navigation**: React Navigation v6
- **UI Library**: React Native Paper + Custom Accessible Components
- **State Management**: Zustand + React Query
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Maps**: React Native Maps
- **Accessibility**: Custom accessibility service layer

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd AccessLink
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Expo CLI globally (if not already installed):**
   ```bash
   npm install -g @expo/cli
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Run on device/simulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## 📱 Development

### Project Structure

```
src/
├── accessibility/          # Accessibility utilities and providers
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── navigation/           # Navigation configuration
├── screens/             # Screen components
├── services/           # API services and data layer
├── theme/             # Design system and styling
├── types/            # TypeScript type definitions
└── App.tsx         # Main app component
```

### Accessibility Guidelines

This project follows strict accessibility guidelines:

- **WCAG 2.2 AA minimum**, AAA where possible
- **Minimum touch targets**: 44x44 dp
- **Color contrast**: 4.5:1 for normal text, 3:1 for large text
- **Screen reader support**: All components properly labeled
- **High contrast mode**: Available for low vision users
- **Reduced motion**: Respects user preferences

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## 🎨 Design System

The app uses a comprehensive design system with:

- **LGBTQ+ inclusive color palette** with WCAG compliant contrast ratios
- **Scalable typography** that adapts to user preferences
- **Consistent spacing** and layout patterns
- **Accessible icons** with proper labeling
- **High contrast mode** for enhanced visibility

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

### Firebase Setup

1. Create a Firebase project
2. Enable Authentication, Firestore, and Storage
3. Add your configuration to the environment variables
4. Set up Firestore security rules for accessibility and LGBTQ+ data

## 📊 Data Models

The app uses comprehensive data models for:

- **Users**: With accessibility preferences and LGBTQ+ identity
- **Businesses**: With detailed accessibility features and verification
- **Events**: With accessibility accommodations
- **Reviews**: Both general and accessibility-specific

See `src/types/index.ts` for complete type definitions.

## ♿ Accessibility Testing

To ensure the app meets accessibility standards:

1. **Test with screen readers**: VoiceOver (iOS) and TalkBack (Android)
2. **Verify color contrast**: Use online contrast checkers
3. **Test with assistive touch**: Ensure all interactions work
4. **Check dynamic type**: Test with larger text sizes
5. **Test with reduced motion**: Verify animations respect preferences

### Testing Checklist

- [ ] All images have meaningful alt text
- [ ] All buttons have descriptive labels
- [ ] Color is not the only means of conveying information
- [ ] Text meets contrast requirements
- [ ] Touch targets are at least 44x44 dp
- [ ] Screen reader navigation is logical
- [ ] Focus indicators are visible
- [ ] Error messages are descriptive

## 🌍 Community Guidelines

This project is built for and by the disabled LGBTQ+ community. We are committed to:

- **Inclusive language** in all code and documentation
- **Authentic representation** in design and imagery
- **Community feedback** in development decisions
- **Open source accessibility** improvements

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

We welcome contributions! Please see CONTRIBUTING.md for guidelines on:

- Code standards and accessibility requirements
- Testing procedures
- Community guidelines
- Issue reporting

## 📞 Support

For support or questions:

- Create an issue in this repository
- Contact: [your-contact-email]
- Community Discord: [discord-link]

## 🙏 Acknowledgments

This project is inspired by and developed with the disabled LGBTQ+ community. Special thanks to accessibility advocates and LGBTQ+ organizations who provided guidance and feedback.

---

**Built with ❤️ for the disabled LGBTQ+ community**
