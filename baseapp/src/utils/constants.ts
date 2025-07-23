/**
 * App-wide constant values
 */

// App information
export const APP_INFO = {
  NAME: 'AccessLink',
  VERSION: '1.0.0',
  DESCRIPTION: 'Supporting the LGBTQ+ Community',
};

// Screen names
export const SCREENS = {
  HOME: 'Home',
  DISCOVER: 'Discover',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  LOGIN: 'Login',
  REGISTER: 'Register',
  RESOURCE_DETAIL: 'ResourceDetail',
  EVENT_DETAIL: 'EventDetail',
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@AccessLink:AuthToken',
  USER_DATA: '@AccessLink:UserData',
  SETTINGS: '@AccessLink:Settings',
  FAVORITES: '@AccessLink:Favorites',
};

// Resource categories
export const CATEGORIES = [
  'All',
  'Events',
  'Community',
  'Health',
  'Legal',
  'Youth',
  'Education',
  'Support',
];

// Emergency contact information
export const EMERGENCY_CONTACTS = {
  CRISIS_HOTLINE: '1-866-488-7386', // The Trevor Project
  TEXT_LINE: '678-678', // Trevor Project text line
};

// External links
export const EXTERNAL_LINKS = {
  PRIVACY_POLICY: 'https://accesslink.example.com/privacy',
  TERMS_OF_SERVICE: 'https://accesslink.example.com/terms',
  SUPPORT: 'https://accesslink.example.com/support',
};

export default {
  APP_INFO,
  SCREENS,
  STORAGE_KEYS,
  CATEGORIES,
  EMERGENCY_CONTACTS,
  EXTERNAL_LINKS,
};
