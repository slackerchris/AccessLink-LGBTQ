// User and Authentication Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  userType: 'individual' | 'business' | 'admin';
  accessibilityPreferences?: AccessibilityPreferences;
  lgbtqIdentity?: LGBTQIdentity;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessibilityPreferences {
  // Physical accessibility needs
  wheelchairUser: boolean;
  mobilityAid: boolean;
  accessibleParking: boolean;
  
  // Sensory needs
  lowVision: boolean;
  blindness: boolean;
  hardOfHearing: boolean;
  deaf: boolean;
  sensoryProcessing: boolean;
  
  // Cognitive/Neurological needs
  neurodivergent: boolean;
  cognitiveSupport: boolean;
  quietEnvironment: boolean;
  
  // App preferences
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  voiceAnnouncements: boolean;
}

export interface LGBTQIdentity {
  pronouns?: string;
  orientation?: string;
  genderIdentity?: string;
  visibility: 'public' | 'private' | 'community-only';
}

// Business Types
export interface Business {
  id: string;
  name: string;
  description: string;
  category: BusinessCategory;
  subcategory?: string;
  address: Address;
  coordinates: Coordinates;
  contactInfo: ContactInfo;
  hours: BusinessHours[];
  accessibilityFeatures: AccessibilityFeatures;
  lgbtqVerification: LGBTQVerification;
  photos: Photo[];
  rating: Rating;
  reviews: Review[];
  events: Event[];
  verified: boolean;
  featured: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  unit?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
}

export interface BusinessHours {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  openTime: string; // "09:00"
  closeTime: string; // "17:00"
  closed: boolean;
}

export interface AccessibilityFeatures {
  // Physical Access
  wheelchairAccessibleEntrance: boolean;
  accessibleRestroom: boolean;
  wideDoorways: boolean;
  elevatorAccess: boolean;
  accessibleParking: boolean;
  rampAccess: boolean;
  variedSeating: boolean;
  accessiblePayment: boolean;
  
  // Sensory
  quietHours: boolean;
  lowLightingOption: boolean;
  brailleMenus: boolean;
  aslAvailable: boolean;
  sensoryFriendly: boolean;
  inductionLoop: boolean;
  
  // Cognitive/Neurological
  clearSignage: boolean;
  visualSupports: boolean;
  trainedStaff: boolean;
  lowStimulusEnvironment: boolean;
  
  // General
  serviceAnimalsWelcome: boolean;
  digitalAccessibility: boolean;
  accessibilityNotes?: string;
  lastVerified: Date;
  verifiedBy?: string;
}

export interface LGBTQVerification {
  verified: boolean;
  ownedByLGBTQ: boolean;
  lgbtqFriendly: boolean;
  verificationMethod?: 'document' | 'certification' | 'community' | 'self-reported';
  certificationDetails?: string;
  verifiedAt?: Date;
  verifiedBy?: string;
}

export interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  caption?: string;
  type: 'exterior' | 'interior' | 'accessibility' | 'menu' | 'staff' | 'other';
  accessibility: {
    altText: string;
    showsAccessibilityFeature?: string;
  };
  uploadedAt: Date;
  uploadedBy: string;
}

// Reviews and Ratings
export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  reviewText?: string;
  accessibilityRating?: AccessibilityRating;
  photos?: Photo[];
  helpful: number;
  reportedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessibilityRating {
  overall: number; // 1-5
  physicalAccess: number;
  sensoryAccommodations: number;
  cognitiveSupport: number;
  staffHelpfulness: number;
  notes?: string;
}

export interface Rating {
  overall: number;
  count: number;
  accessibility: number;
  lgbtqFriendliness: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Events
export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  businessId?: string;
  venueId?: string;
  venueName: string;
  venueAddress: Address;
  coordinates: Coordinates;
  category: EventCategory;
  accessibilityInfo: EventAccessibility;
  lgbtqFocus: boolean;
  price?: EventPrice;
  ticketUrl?: string;
  maxAttendees?: number;
  currentAttendees: number;
  photos: Photo[];
  tags: string[];
  organizerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventAccessibility {
  aslInterpreter: boolean;
  captioning: boolean;
  wheelchairAccessible: boolean;
  accessibleParking: boolean;
  sensoryFriendly: boolean;
  quietSpace: boolean;
  accessibleTransport: boolean;
  notes?: string;
}

export interface EventPrice {
  free: boolean;
  min?: number;
  max?: number;
  currency: string;
  description?: string;
}

// Enums and Constants
export enum BusinessCategory {
  DINING = 'dining',
  RETAIL = 'retail',
  SERVICES = 'services',
  HEALTHCARE = 'healthcare',
  ARTS_CULTURE = 'arts_culture',
  FITNESS = 'fitness',
  NIGHTLIFE = 'nightlife',
  EDUCATION = 'education',
  GOVERNMENT = 'government',
  NONPROFIT = 'nonprofit',
  OTHER = 'other'
}

export enum EventCategory {
  SOCIAL = 'social',
  EDUCATIONAL = 'educational',
  CULTURAL = 'cultural',
  SUPPORT = 'support',
  BUSINESS = 'business',
  FUNDRAISER = 'fundraiser',
  PROTEST = 'protest',
  CELEBRATION = 'celebration',
  OTHER = 'other'
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  location?: Coordinates;
  radius?: number; // in miles
  category?: BusinessCategory[];
  accessibilityFeatures?: Partial<AccessibilityFeatures>;
  lgbtqOwned?: boolean;
  verified?: boolean;
  openNow?: boolean;
  priceRange?: [number, number];
  rating?: number;
}

export interface SearchResult {
  businesses: Business[];
  events: Event[];
  totalCount: number;
  hasMore: boolean;
}

// Navigation Types
export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Main: undefined;
  BusinessDetail: { businessId: string };
  EventDetail: { eventId: string };
  Search: { query?: string; filters?: SearchFilters };
  Profile: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Map: undefined;
  Events: undefined;
  Discover: undefined;
  Favorites: undefined;
};

// Component Props Types
export interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  accessibilityHint?: string;
  testID?: string;
}

export interface AccessibleTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  accessibilityHint?: string;
  testID?: string;
}
