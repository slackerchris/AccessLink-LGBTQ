# Domain Configuration for AccessLink LGBTQ+

## 🌐 Primary Domain
**https://accesslink.app/**

## 📂 Configuration Files Updated

### 1. `/package.json`
- Added `homepage: "https://accesslink.app/"`
- Added repository links
- Added author and licensing information

### 2. `/app.json` (Expo Configuration)
- Updated bundle identifiers to match domain
- Added scheme configuration for deep linking
- Configured web settings

### 3. `/config/domain.ts`
New domain configuration file containing:
- **Base URL**: `https://accesslink.app`
- **API Base URL**: `https://api.accesslink.app`
- **Deep Link Scheme**: `accesslink://`
- **Universal Links**: `accesslink.app`
- **Support Email**: `support@accesslink.app`
- **Contact Email**: `contact@accesslink.app`
- **Legal Pages**: Privacy policy and Terms of Service URLs

## 🔗 Integration Features

### Deep Linking Support
- Custom scheme: `accesslink://`
- Universal links for iOS: `https://accesslink.app/app/*`
- App Links for Android: `https://accesslink.app/app/*`

### Email Integration
- Support email integrated into app
- Contact forms can use configured endpoints

### SEO & Social Sharing
- Meta tags configured for social sharing
- Keywords optimized for LGBTQ+ and accessibility focus

### API Endpoints Ready
- Base API URL configured for future backend integration
- Consistent domain structure across all services

## 🚀 Next Steps

1. **DNS Configuration**: Point `accesslink.app` to your hosting provider
2. **SSL Certificate**: Ensure HTTPS is properly configured
3. **API Setup**: Configure `api.accesslink.app` subdomain for backend services
4. **App Store**: Update app store listings with the correct domain
5. **Universal Links**: Set up `.well-known/apple-app-site-association` file
6. **Analytics**: Add Google Analytics ID when ready

## 📱 Mobile App Integration

The app now includes:
- **Visit Website** button that opens `https://accesslink.app/`
- **Contact Support** button that opens email to `support@accesslink.app`
- Proper branding and domain display
- Ready for app store deployment with correct bundle identifiers

---

*Domain configured on July 25, 2025*
