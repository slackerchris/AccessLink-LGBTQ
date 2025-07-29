/**
 * Jest Setup File
 * Configures global test environment and mocks for React Native
 */

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Keep error and warn for debugging
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};

// Mock setTimeout and setInterval for testing
global.setTimeout = jest.fn((cb) => cb());
global.setInterval = jest.fn((cb) => cb());
global.clearTimeout = jest.fn();
global.clearInterval = jest.fn();

// Mock Date.now for consistent testing
const mockDate = new Date('2025-07-28T00:00:00.000Z');
global.Date.now = jest.fn(() => mockDate.getTime());

// Basic React Native module mocks (only essential ones)
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((options) => options.ios),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock Expo Vector Icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
}));

// Basic Firebase mocks
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

// Mock Firebase Auth
const mockUser = {
  uid: 'mock-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: false,
};

const mockUserCredential = {
  user: mockUser,
  providerId: null,
  operationType: 'signIn'
};

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve(mockUserCredential)),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve(mockUserCredential)),
  signOut: jest.fn(() => Promise.resolve()),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  sendEmailVerification: jest.fn(() => Promise.resolve()),
  updateProfile: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn(),
}));

// Mock Firebase Firestore
const mockServerTimestamp = jest.fn(() => ({ _type: 'server_timestamp' }));
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();
const mockStartAfter = jest.fn();
const mockQuery = jest.fn();
const mockGetDoc = jest.fn(() => Promise.resolve({
  exists: () => false,
  data: () => ({}),
  id: 'mock-id'
}));
const mockGetDocs = jest.fn(() => Promise.resolve({
  empty: true,
  docs: [],
  forEach: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  addDoc: jest.fn(() => Promise.resolve({ id: 'mock-id' })),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  startAfter: mockStartAfter,
  onSnapshot: jest.fn(),
  serverTimestamp: mockServerTimestamp,
}));
