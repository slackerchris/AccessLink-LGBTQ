# 🏳️‍🌈 AccessLink LGBTQ+

**Connecting the LGBTQ+ community with inclusive businesses and services.**

A React Native mobile application that helps LGBTQ+ individuals discover, review, and connect with businesses that are committed to providing inclusive and welcoming environments.

## 🚀 Features

- **🔐 User Authentication** - Secure login with role-based access (Admin/User)
- **🏢 Business Directory** - Comprehensive listings of LGBTQ+ friendly businesses
- **⭐ Review System** - Community-driven ratings and reviews
- **👑 Admin Dashboard** - Business approval and management workflow
- **🌓 Light/Dark Themes** - Complete theme system with persistent storage
- **🧭 Universal Navigation** - Complete back navigation system across all screens
- **📱 Mobile First** - Native mobile experience with proper touch targets
- **🌐 Cross Platform** - iOS, Android, and Web support

## ✨ Latest Updates (July 29, 2025)

**🌓 Complete Theme System Implementation**
- ✅ App-wide light and dark theme support  
- ✅ Persistent theme storage with AsyncStorage
- ✅ Simple toggle switch in Portal screen
- ✅ Smart color schemes maintaining accessibility

**🧭 Complete Navigation System Overhaul**
- ✅ Universal back navigation on all stack screens
- ✅ Context-aware navigation for multi-use screens
- ✅ Mobile-first design with 40x40px touch targets
- ✅ Professional navigation patterns throughout app

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation with complete back navigation
- **Authentication**: Mock authentication service (ready for Firebase)
- **State Management**: React Hooks
- **Navigation**: React Navigation
- **UI Components**: React Native Paper
- **Development**: Hot reload, TypeScript compilation

## 🔐 Environment Variable Setup

**This is a critical security step.** This project uses a `.env` file to manage secret keys for services like Firebase. You must set this up before running the application.

1.  **Create a `.env` file** in the root of the project. You can do this by copying the example file:
    ```bash
    cp .env.example .env
    ```

2.  **Fill in your credentials** in the newly created `.env` file. The required variables are listed in `.env.example`.

    ```
    EXPO_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY_HERE"
    # ... and other keys
    ```

3.  **The `.env` file is already listed in `.gitignore` and will not be committed to the repository.**

## 🏃‍♂️ Quick Start

```bash
# Clone the repository
git clone https://github.com/slackerchris/AccessLink-LGBTQ.git

# Navigate to project directory
cd AccessLink-LGBTQ

# Install dependencies
npm install

# Start development server
npx expo start
```

**View the app:**
- **Web**: http://localhost:8081
- **Mobile**: Scan QR code with Expo Go app

## 🧪 Demo Accounts

**Admin Access:**
- Username: `admin`
- Password: `accesslink1234`

**User Access:**
- Email: `user@example.com`
- Password: `password123`

## 📚 Documentation

Complete documentation is available in the [`docs/`](docs/) folder:

- [📖 Project Overview](docs/README.md)
- [🔧 Development Setup](docs/development-README.md)
- [📊 Test Results](docs/reports/TEST_RESULTS.md)
- [📁 Full Documentation Index](docs/INDEX.md)

## 🎯 Current Status

✅ **Production Ready**
- Complete authentication system
- Full business directory with search/filter
- Admin dashboard for business management
- Role-based navigation and permissions
- Mobile-responsive design
- Organized documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌈 Mission

AccessLink LGBTQ+ is dedicated to fostering inclusive communities by connecting LGBTQ+ individuals with businesses that celebrate diversity and provide safe, welcoming spaces for everyone.

---

**Made with ❤️ for the LGBTQ+ community**
