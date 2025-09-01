# AccessLink LGBTQ+ Project: Architecture and Refactoring Summary

**Document Version:** 1.0
**Last Updated:** August 31, 2025

## 1. Project Mission & Overview

AccessLink LGBTQ+ is a React Native mobile application dedicated to connecting the LGBTQ+ community with safe, inclusive, and welcoming businesses and services. The platform allows users to discover, review, and share their experiences, fostering a supportive ecosystem for both consumers and business owners.

## 2. Current Project Status

The project has undergone a significant and comprehensive refactoring initiative aimed at improving code quality, maintainability, performance, and consistency. The codebase is now considered stable, robust, and follows modern best practices.

- **Code Health:** Excellent. The codebase is now highly organized, with a clear separation of concerns.
- **Styling:** Fully refactored to a centralized, theme-aware system.
- **Services:** The backend service layer has been restructured for better organization, error handling, and direct integration with Firebase.
- **Dependencies:** Core dependencies are up-to-date.

## 3. Core Architecture

The application is built on a modern, scalable architecture designed for React Native and Firebase.

### 3.1. Frontend & UI

-   **Framework:** React Native with Expo
-   **Language:** TypeScript
-   **UI Components:** A combination of core React Native components and `react-native-paper` for some UI elements.
-   **Navigation:** React Navigation (`@react-navigation/stack` and `@react-navigation/bottom-tabs`) is used for all screen transitions and navigation logic.

### 3.2. Styling and Theming

A key outcome of the refactoring is a centralized and dynamic styling system.

-   **`useTheme` Hook:** Located in `hooks/useTheme.ts`, this custom hook is the cornerstone of the styling system. It provides access to a `colors` object and a `createStyles` helper function.
-   **Color Palette:** All hardcoded colors (e.g., `#fff`, `#007bff`) have been eliminated and replaced with semantic theme variables (e.g., `colors.primary`, `colors.text`, `colors.background`). The theme supports both light and dark modes, with high-contrast variants for accessibility.
-   **`createStyles` Helper:** This function is used within components to create stylesheets that automatically adapt to the current theme, ensuring a consistent look and feel across the entire application.

### 3.3. State Management

-   **React Hooks & Context API:** The application leverages React's built-in state management tools (`useState`, `useEffect`, `useCallback`, `useContext`) for managing local and global state.
-   **`AuthProvider`:** A central `AuthProvider` (`hooks/useFirebaseAuth.ts`) manages user authentication state, user profiles, and business data for logged-in business owners.

### 3.4. Backend Services (Firebase)

The application is tightly integrated with Firebase for its backend needs.

-   **Authentication:** Firebase Authentication handles user sign-up, sign-in, and session management.
-   **Database:** Firestore is the primary database for storing user profiles, business listings, reviews, and other application data.
-   **Storage:** Firebase Cloud Storage is used for hosting user-uploaded content, such as profile photos.

## 4. Summary of Refactoring Changes

The following is a detailed summary of the major refactoring work completed.

### 4.1. Comprehensive Styling Refactor

-   **Elimination of Hardcoded Styles:** All inline styles and hardcoded color values have been removed from every component across the application.
-   **Implementation of `useTheme`:** Every component now uses the `useTheme` hook to access theme colors and create styles. This ensures that all UI elements respond dynamically to theme changes (Light/Dark mode).
-   **Consistency:** This change has resulted in a visually consistent and professional user interface.

### 4.2. Service Layer Restructuring

The entire `services/` directory was overhauled to improve structure, remove legacy code, and align with modern asynchronous patterns.

-   **Class-Based Services:** Services like `businessResponseService` and `databaseResilienceService` were refactored into classes to encapsulate related logic and state.
-   **Firebase Direct Integration:** Services now interact directly and more efficiently with Firebase services (`firestore`, `auth`, `storage`).
-   **Code Deletion:** Deprecated and unused files, including `databaseService.ts` (legacy SQLite) and `sqliteAuthService.ts`, were deleted to clean up the codebase.
-   **New Services:** `businessRelationshipService.ts` was added to manage relationships between users and businesses (e.g., saved places).
-   **Improved Error Handling:** Services now feature more robust error handling and validation. For example, `databaseResilienceService` provides a retry mechanism for failed database operations.

### 4.3. Hooks Refactoring

The custom hooks in the `hooks/` directory were updated to be more efficient and to work with the newly refactored service layer.

-   **`useAuth`:** The primary authentication hook was streamlined, and a standalone `useAuth.ts` was created to cleanly provide the `AuthContext`.
-   **Data Fetching Hooks:** Hooks like `useAdmin`, `useBusinessHome`, and `useReviewHistory` now call the refactored, more efficient services to fetch data.

### 4.4. Documentation and Code Cleanup

-   **Type Safety:** TypeScript types across the project (especially in `types/`) were refined for better accuracy and consistency.
-   **File Cleanup:** Obsolete test files and documentation were removed.
-   **This Document:** This summary document was created to provide a clear, up-to-date overview of the project's architecture.

## 5. Tech Stack

| Category       | Technology / Library                               |
| -------------- | -------------------------------------------------- |
| **Core**       | React Native, Expo, TypeScript                   |
| **Navigation** | React Navigation                                   |
| **UI**         | React Native Paper, @expo/vector-icons             |
| **Backend**    | Firebase (Auth, Firestore, Storage)                |
| **State Mgmt** | React Hooks & Context API                          |
| **Testing**    | Jest, React Native Testing Library                 |
| **Linting**    | ESLint                                             |

## 6. Getting Started

To run the project locally, follow these steps:

```bash
# Clone the repository
git clone https://github.com/slackerchris/AccessLink-LGBTQ.git

# Navigate to project directory
cd AccessLink-LGBTQ

# Install dependencies
npm install

# Set up your .env file with Firebase credentials
cp .env.example .env

# Start the development server
npx expo start
```

## 7. Future Recommendations

-   **Integration Testing:** While unit tests exist, creating a more comprehensive suite of integration tests for the refactored services would be beneficial.
-   **CI/CD Pipeline:** Implementing a Continuous Integration/Continuous Deployment pipeline (e.g., using GitHub Actions) would automate testing and deployment.
-   **State Management Library:** For more complex features, consider introducing a dedicated state management library like Redux Toolkit or Zustand to manage global state more formally.
