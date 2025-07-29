# 🛠️ Development Setup Guide

This guide provides detailed instructions for setting up and running the AccessLink LGBTQ+ application in a development environment.

## Prerequisites
- Node.js (LTS version recommended)
- npm or yarn
- Git
- Expo Go app on your mobile device (optional, for mobile testing)

## 1. Clone the Repository
```bash
git clone https://github.com/slackerchris/AccessLink-LGBTQ.git
cd AccessLink-LGBTQ
```

## 2. Install Dependencies
```bash
npm install
```

## 3. Environment Variable Configuration (CRITICAL)
This project uses environment variables to handle sensitive keys for services like Firebase. You must configure these before running the app.

1.  **Create a `.env` file**: Copy the example file to create your local configuration.
    ```bash
    cp .env.example .env
    ```

2.  **Add Your Credentials**: Open the `.env` file and fill in the values for your Firebase project.
    ```
    EXPO_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY_HERE"
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN_HERE"
    # ... and so on for all keys
    ```
    **Note**: The `.env` file is included in `.gitignore` and will not be committed.

## 4. Start the Development Server
```bash
npx expo start
```
This will start the Metro bundler. You can then run the app in a variety of ways:
- Press `w` to open in your web browser.
- Press `a` to open in an Android emulator (if configured).
- Press `i` to open in an iOS simulator (macOS only).
- Scan the QR code with the Expo Go app on your phone.

## 5. Mock Services
For ease of development, the application uses a mock authentication service by default. This service bypasses actual Firebase calls and uses a predefined set of users.

- **Mock Users**: Defined in `services/mockAuthService.ts`.
- **Password Check**: The mock service bypasses password checks. Any password will work for a known user.

To switch to the real Firebase service, you will need to modify the import in the relevant files (e.g., in `useAuth.ts` hook).

## 6. Code Quality & Linting
This project is set up with ESLint and Prettier to maintain code quality. It is highly recommended to use a code editor with ESLint integration to get real-time feedback.

To run the linter manually:
```bash
npm run lint
```

## 7. Running Tests
The project uses Jest for testing. To run the test suite:
```bash
npm test
```
To see test coverage:
```bash
npm test -- --coverage
```

This setup ensures a secure and efficient development workflow.
