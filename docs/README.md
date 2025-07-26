# 🏳️‍🌈 AccessLink LGBTQ+ Documentation

Welcome to the comprehensive documentation for the AccessLink LGBTQ+ Community Directory application.

## 📱 Application Overview

AccessLink LGBTQ+ is a React Native mobile application that connects the LGBTQ+ community with inclusive, accessible businesses and services. The app features role-based authentication, comprehensive business directory, and user portal functionality.

**Current Status**: ✅ **Production Ready** with full Portal system implementation

## 🚀 Quick Start

### Development Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/slackerchris/AccessLink-LGBTQ.git
   cd AccessLink-LGBTQ
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npx expo start
   ```

4. **Access the application**
   - **Web**: http://localhost:8081
   - **Mobile**: Scan QR code with Expo Go app

### Test Credentials
- **Admin**: `admin` / `accesslink1234`
- **User**: `user@example.com` / `password123`
- **Business Owner**: `business@example.com` / `password123`

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: React Native with Expo SDK 52.0.0
- **Navigation**: React Navigation (Stack + Tab navigators)
- **Authentication**: Mock service (development) / Firebase (production)
- **State Management**: React hooks and context
- **UI Components**: Native React Native components with Ionicons

### Application Structure
```
AccessLink-LGBTQ/
├── components/           # React Native components
│   ├── admin/           # Admin dashboard components
│   ├── auth/            # Authentication screens
│   ├── business/        # Business owner features
│   ├── common/          # Shared components
│   └── user/            # User portal and features
├── services/            # Authentication & business services
├── hooks/               # Custom React hooks
├── docs/                # Documentation (you are here)
├── App.tsx              # Main application entry point
└── package.json         # Project dependencies
```

## 🎯 Key Features

### ✅ User Portal System (Fully Implemented)
Complete self-service portal for community members:

- **👤 Profile Management**: Edit personal information and preferences
- **📍 Saved Places**: Bookmark and manage favorite businesses
- **⭐ Review System**: Write, edit, and manage business reviews
- **♿ Accessibility Preferences**: Configure accessibility needs and filters
- **🏳️‍🌈 Identity Settings**: Manage LGBTQ+ identity visibility and pronouns
- **📊 Account Information**: View account details and member status

### 🏢 Business Directory
- Comprehensive LGBTQ+ inclusive business listings
- Accessibility feature filtering
- Business profile pages with detailed information
- Photo galleries and contact information

### 👨‍💼 Role-Based Access Control
- **Community Members**: Full portal access and business discovery
- **Business Owners**: Business profile management and customer interaction
- **Administrators**: Platform management and business verification

### 🔐 Authentication System
- Secure login/signup with email verification
- Password strength requirements
- Role-based dashboard routing
- Session management with secure logout

## 📋 Navigation Structure

### Bottom Tab Navigation
```
Home Tab → User dashboard and featured businesses
Directory Tab → Business listing and search
Saved Tab → User's saved/bookmarked businesses
Events Tab → Community events and activities
Portal Tab → User portal with all self-service features
```

### Portal Stack Navigation
```
Portal Main → Overview with feature cards
├── My Profile → EditProfileScreen
├── Saved Places → SavedPlacesScreen
├── My Reviews → ReviewHistoryScreen
├── Accessibility → AccessibilityPreferencesScreen
├── Identity Settings → LGBTQIdentityScreen
└── Sign Out → Confirmation dialog
```

## 🧪 Testing

### Current Test Coverage
- ✅ **Navigation**: All routes and transitions functional
- ✅ **Authentication**: Login/logout with proper state management
- ✅ **Portal Features**: All user portal functionality tested
- ✅ **Business Directory**: Search and filtering working
- ✅ **Admin Dashboard**: Business management and approval workflow

### Testing Credentials
Use the test credentials provided above to explore different user roles and functionalities.

## 📚 Documentation Index

### Core Documentation
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Detailed technical implementation status
- **[Future Features](FUTURE_FEATURES.md)** - Roadmap and planned enhancements
- **[Development README](development-README.md)** - Development setup and guidelines

### Specialized Guides
- **[Authentication Setup](auth/)** - Authentication configuration guides
- **[Build Guides](guides/)** - Platform-specific build instructions
- **[Domain Configuration](DOMAIN_CONFIG.md)** - Domain and hosting setup

### Reports and Analysis
- **[Test Results](reports/TEST_RESULTS.md)** - Latest testing outcomes
- **[Bug Reports](reports/BUG_REPORT.md)** - Known issues and resolutions
- **[Code Review](reports/CODE_REVIEW_REPORT.md)** - Code quality assessments

## 🚀 Recent Updates (July 2025)

### Major Features Added
- ✅ **Complete User Portal System** with dedicated navigation
- ✅ **Accessibility Preferences** with 6 customizable categories
- ✅ **LGBTQ+ Identity Management** with privacy controls
- ✅ **Review History Dashboard** with statistics and management
- ✅ **Saved Places Management** with business cards and ratings

### Technical Improvements
- ✅ **Navigation Restructuring** with dedicated Portal tab
- ✅ **Enhanced Data Models** with comprehensive user profiles
- ✅ **Improved Code Organization** with feature-specific screens
- ✅ **Better Error Handling** with user-friendly messages

## 🛠️ Development Status

**Current Build**: ✅ Stable - No compilation errors  
**Development Server**: ✅ Running on http://localhost:8081  
**Mobile Testing**: ✅ Available via Expo QR code  
**Web Testing**: ✅ Accessible via browser

## 📞 Support

For technical questions, feature requests, or bug reports:
1. Check the [Bug Report](reports/BUG_REPORT.md) for known issues
2. Review the [Implementation Summary](IMPLEMENTATION_SUMMARY.md) for current status
3. Consult the [Future Features](FUTURE_FEATURES.md) for planned enhancements

---

**Last Updated**: July 26, 2025  
**Version**: Development Build with Portal System v1.0
