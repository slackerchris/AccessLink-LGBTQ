# AccessLink LGBTQ+ - Mobile App

AccessLink is an accessibility-first mobile application designed to connect disabled LGBTQ+ individuals with inclusive businesses and community events. The app prioritizes universal design principles and ensures that accessibility is built into every feature from the ground up.

## 🌈 Mission

To create an inclusive digital space where disabled LGBTQ+ individuals can easily discover, connect with, and support businesses and events that welcome and accommodate their diverse needs.

## ✨ Key Features

### Accessibility-First Design
- **WCAG 2.2 AA/AAA compliance** throughout the application
- **Screen reader optimization** with comprehensive accessibility labels
- **High contrast mode** for users with visual impairments
- **Large text options** and scalable typography
- **Reduced motion** settings for users with vestibular sensitivities
- **Voice announcements** for navigation and important updates

### Business Directory
- Verified LGBTQ+ friendly businesses
- Detailed accessibility feature listings
- Community ratings and reviews
- Photo galleries showing accessibility features
- Contact information and hours of operation

### Community Events
- Accessible LGBTQ+ events and gatherings
- Detailed accessibility accommodations
- Registration and ticketing integration
- Community calendar and reminders

### User Features
- Personalized accessibility preferences
- Favorites and bookmarks
- Community reviews and ratings
- Event RSVP and management

## 🛠 Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **UI Components**: React Native Paper + Custom Accessible Components
- **Backend**: Firebase (Auth, Firestore, Storage)
- **State Management**: Zustand + React Query
- **Language**: TypeScript
- **Testing**: Jest + React Native Testing Library
- **Linting**: ESLint with accessibility rules

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- For iOS development: Xcode
- For Android development: Android Studio

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AccessLink
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

4. **Configure Firebase**
   - Create a Firebase project at https://console.firebase.google.com/
   - Add your React Native app to the project
   - Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
   - Update `src/services/firebase.ts` with your configuration

5. **Start the development server**
   ```bash
   npx expo start
   ```

6. **Run on device/emulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## 📱 Development

### Project Structure

```
src/
├── accessibility/          # Accessibility services and providers
├── components/             # Reusable UI components
├── navigation/             # Navigation configuration
├── screens/               # Screen components
├── services/              # API and Firebase services
├── theme/                 # Design system and theming
├── types/                 # TypeScript type definitions
└── App.tsx               # Main application component
```

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Start on Android emulator
- `npm run ios` - Start on iOS simulator
- `npm run web` - Start web version
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run build` - Build for production

### Accessibility Testing

This app includes comprehensive accessibility testing tools:

- **Screen Reader Testing**: Test with TalkBack (Android) and VoiceOver (iOS)
- **Accessibility Scanner**: Use Google's Accessibility Scanner on Android
- **Color Contrast**: All colors meet WCAG contrast requirements
- **Focus Management**: Proper focus order and keyboard navigation
- **Voice Announcements**: Test voice feedback for all interactions

## 🎨 Design System

The app uses a carefully crafted design system that prioritizes accessibility:

- **Colors**: High contrast ratios, colorblind-friendly palette
- **Typography**: Scalable text with large text support
- **Spacing**: Touch-friendly spacing (minimum 44px touch targets)
- **Icons**: Clear, recognizable icons with text labels
- **Motion**: Respectful of reduced motion preferences

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
