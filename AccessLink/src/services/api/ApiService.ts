// API service for business and event data
import { Business, Event, User, BusinessCategory, EventCategory, Address, Coordinates } from '../../types';

// Mock data for development - replace with actual API calls
const mockBusinesses: Business[] = [
  {
    id: '1',
    name: 'Rainbow Café',
    description: 'LGBTQ+ friendly café with accessible seating and braille menus',
    category: BusinessCategory.DINING,
    address: {
      street: '123 Pride Street',
      city: 'Rainbow City',
      state: 'RC',
      zipCode: '12345',
      country: 'USA',
    },
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060,
    },
    contactInfo: {
      phone: '(555) 123-4567',
      website: 'https://rainbowcafe.example.com',
    },
    hours: [
      { dayOfWeek: 1, openTime: '08:00', closeTime: '18:00', closed: false },
      { dayOfWeek: 2, openTime: '08:00', closeTime: '18:00', closed: false },
      { dayOfWeek: 3, openTime: '08:00', closeTime: '18:00', closed: false },
      { dayOfWeek: 4, openTime: '08:00', closeTime: '18:00', closed: false },
      { dayOfWeek: 5, openTime: '08:00', closeTime: '20:00', closed: false },
      { dayOfWeek: 6, openTime: '09:00', closeTime: '20:00', closed: false },
      { dayOfWeek: 0, openTime: '10:00', closeTime: '17:00', closed: false },
    ],
    accessibilityFeatures: {
      wheelchairAccessibleEntrance: true,
      accessibleRestroom: true,
      wideDoorways: true,
      elevatorAccess: false,
      accessibleParking: true,
      rampAccess: true,
      variedSeating: true,
      accessiblePayment: true,
      quietHours: false,
      lowLightingOption: false,
      brailleMenus: true,
      aslAvailable: false,
      sensoryFriendly: true,
      inductionLoop: false,
      clearSignage: true,
      visualSupports: false,
      trainedStaff: true,
      lowStimulusEnvironment: false,
      serviceAnimalsWelcome: true,
      digitalAccessibility: true,
      lastVerified: new Date(),
    },
    lgbtqVerification: {
      verified: true,
      ownedByLGBTQ: true,
      lgbtqFriendly: true,
      verificationMethod: 'document',
      verifiedAt: new Date(),
    },
    photos: [],
    rating: {
      overall: 4.8,
      count: 127,
      accessibility: 4.9,
      lgbtqFriendliness: 5.0,
      distribution: { 1: 0, 2: 2, 3: 8, 4: 45, 5: 72 },
    },
    reviews: [],
    events: [],
    verified: true,
    featured: false,
    ownerId: 'owner1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Accessible Pride Parade Planning',
    description: 'Join us to plan an inclusive Pride parade that welcomes everyone',
    startDate: new Date('2024-02-15T18:00:00'),
    endDate: new Date('2024-02-15T20:00:00'),
    venueName: 'Community Center',
    venueAddress: {
      street: '456 Unity Avenue',
      city: 'Rainbow City',
      state: 'RC',
      zipCode: '12345',
      country: 'USA',
    },
    coordinates: {
      latitude: 40.7589,
      longitude: -73.9851,
    },
    category: EventCategory.SOCIAL,
    accessibilityInfo: {
      aslInterpreter: true,
      captioning: false,
      wheelchairAccessible: true,
      accessibleParking: true,
      sensoryFriendly: true,
      quietSpace: true,
      accessibleTransport: false,
    },
    lgbtqFocus: true,
    price: {
      free: true,
      currency: 'USD',
    },
    maxAttendees: 50,
    currentAttendees: 23,
    photos: [],
    tags: ['pride', 'planning', 'accessibility', 'community'],
    organizerId: 'org1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export class ApiService {
  // Business-related methods
  static async getBusinesses(): Promise<Business[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockBusinesses;
  }

  static async getBusinessById(id: string): Promise<Business | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockBusinesses.find(business => business.id === id) || null;
  }

  static async searchBusinesses(query: string, category?: string): Promise<Business[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockBusinesses.filter(business => 
      business.name.toLowerCase().includes(query.toLowerCase()) ||
      business.description.toLowerCase().includes(query.toLowerCase()) ||
      (category && business.category === category)
    );
  }

  // Event-related methods
  static async getEvents(): Promise<Event[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockEvents;
  }

  static async getEventById(id: string): Promise<Event | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockEvents.find(event => event.id === id) || null;
  }

  static async searchEvents(query: string, category?: string): Promise<Event[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockEvents.filter(event => 
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.description.toLowerCase().includes(query.toLowerCase()) ||
      (category && event.category === category)
    );
  }

  // User-related methods (for future implementation)
  static async getUserProfile(userId: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return mock user or implement actual API call
    return null;
  }

  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 800));
    // Implement actual API call
    return null;
  }
}
