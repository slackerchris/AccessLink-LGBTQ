/**
 * Mock Business Service for Development
 * Provides business listing interface without requiring Firebase setup
 */

export type BusinessCategory = 
  | 'restaurant' 
  | 'healthcare' 
  | 'legal' 
  | 'retail' 
  | 'entertainment' 
  | 'fitness' 
  | 'beauty' 
  | 'education' 
  | 'nonprofit' 
  | 'other';

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price?: string;
  duration?: string;
  category?: string;
  available: boolean;
}

export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  uri: string;
  thumbnail?: string;
  title: string;
  description?: string;
  category: 'interior' | 'exterior' | 'accessibility' | 'events' | 'menu' | 'staff' | 'other';
  uploadedAt: Date;
  featured: boolean;
}

export interface BusinessEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  category: 'social' | 'educational' | 'health' | 'advocacy' | 'entertainment' | 'support' | 'community' | 'fundraising' | 'other';
  isAccessible: boolean;
  accessibilityFeatures: string[];
  maxAttendees?: number;
  currentAttendees: number;
  isPublic: boolean;
  registrationRequired: boolean;
  registrationDeadline?: Date;
  ticketPrice?: number;
  contactEmail?: string;
  contactPhone?: string;
  imageUri?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessListing {
  id?: string;
  name: string;
  description: string;
  category: BusinessCategory;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  accessibility: {
    wheelchairAccessible: boolean;
    visuallyImpairedFriendly: boolean;
    hearingImpairedFriendly: boolean;
    notes?: string;
  };
  lgbtqInfo: {
    safeSpaceCertified: boolean;
    lgbtqOwned: boolean;
    supportsPrideEvents: boolean;
    lgbtqStaffTraining: boolean;
    genderNeutralBathrooms: boolean;
    notes?: string;
  };
  hours?: {
    [key: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
  tags?: string[];
  images?: string[];
  services?: ServiceItem[];
  mediaGallery?: MediaItem[];
  events?: BusinessEvent[];
  ownerId: string;
  approved: boolean;
  featured: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessFilters {
  category?: BusinessCategory;
  city?: string;
  state?: string;
  safeSpaceCertified?: boolean;
  lgbtqOwned?: boolean;
  wheelchairAccessible?: boolean;
}

// Mock business data
const mockBusinesses: BusinessListing[] = [
  {
    id: 'rainbow-cafe-001',
    name: 'Rainbow Café',
    description: 'A welcoming café serving organic coffee and pastries. LGBTQ+ owned and operated with a focus on community building.',
    category: 'restaurant',
    location: {
      address: '123 Pride Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102'
    },
    contact: {
      phone: '(555) 123-4567',
      email: 'hello@rainbowcafe.com',
      website: 'https://rainbowcafe.com'
    },
    accessibility: {
      wheelchairAccessible: true,
      visuallyImpairedFriendly: true,
      hearingImpairedFriendly: false,
      notes: 'Wheelchair ramp available, braille menus provided'
    },
    lgbtqInfo: {
      safeSpaceCertified: true,
      lgbtqOwned: true,
      supportsPrideEvents: true,
      lgbtqStaffTraining: true,
      genderNeutralBathrooms: true,
      notes: 'Hosts weekly LGBTQ+ community events'
    },
    tags: ['coffee', 'organic', 'community', 'safe-space'],
    services: [
      {
        id: 'service-1',
        name: 'Specialty Coffee',
        description: 'Organic, fair-trade coffee blends including our signature Rainbow Latte',
        price: '$4.50 - $6.00',
        category: 'Beverages',
        available: true
      },
      {
        id: 'service-2',
        name: 'Fresh Pastries',
        description: 'Daily baked pastries, croissants, and muffins made with organic ingredients',
        price: '$3.00 - $5.50',
        category: 'Food',
        available: true
      },
      {
        id: 'service-3',
        name: 'Community Event Hosting',
        description: 'Private space rental for LGBTQ+ community events and meetings',
        price: '$50/hour',
        duration: '1-4 hours',
        category: 'Events',
        available: true
      },
      {
        id: 'service-4',
        name: 'Catering Services',
        description: 'Coffee and pastry catering for local events and offices',
        price: 'Starting at $150',
        category: 'Catering',
        available: true
      }
    ],
    mediaGallery: [
      {
        id: 'media-1',
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
        title: 'Main Dining Area',
        description: 'Our spacious and accessible main dining area with wide aisles and comfortable seating',
        category: 'interior',
        uploadedAt: new Date('2024-12-15'),
        featured: true
      },
      {
        id: 'media-2',
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400',
        title: 'Accessible Entrance',
        description: 'Our wheelchair-accessible entrance with automatic doors and ramp access',
        category: 'accessibility',
        uploadedAt: new Date('2024-12-10'),
        featured: false
      },
      {
        id: 'media-3',
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
        title: 'Pride Month Celebration',
        description: 'Our special Pride Month setup with rainbow decorations and community gathering space',
        category: 'events',
        uploadedAt: new Date('2024-12-08'),
        featured: false
      },
      {
        id: 'media-4',
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
        title: 'Barista at Work',
        description: 'Our skilled baristas crafting the perfect cup with fair-trade, organic beans',
        category: 'staff',
        uploadedAt: new Date('2024-12-05'),
        featured: false
      }
    ],
    events: [
      {
        id: 'event-1',
        title: 'Pride Month Celebration',
        description: 'Join us for a special Pride Month celebration with live music, food, and community connections. This is a welcoming space for all members of the LGBTQ+ community and allies.',
        date: new Date('2025-06-15'),
        startTime: '18:00',
        endTime: '22:00',
        location: 'Main Dining Area',
        category: 'social',
        isAccessible: true,
        accessibilityFeatures: ['Wheelchair Accessible', 'Sign Language Interpreter', 'Gender-Neutral Restrooms'],
        maxAttendees: 50,
        currentAttendees: 32,
        isPublic: true,
        registrationRequired: true,
        registrationDeadline: new Date('2025-06-10'),
        contactEmail: 'events@rainbowcafe.com',
        contactPhone: '(555) 123-4567',
        tags: ['pride', 'community', 'celebration', 'music'],
        createdAt: new Date('2025-05-01'),
        updatedAt: new Date('2025-05-15')
      },
      {
        id: 'event-2',
        title: 'Coffee & Community: Trans Support Meet-up',
        description: 'A monthly gathering for transgender individuals and allies. Safe space to connect, share experiences, and build community over great coffee.',
        date: new Date('2025-08-10'),
        startTime: '10:00',
        endTime: '12:00',
        location: 'Private Back Room',
        category: 'support',
        isAccessible: true,
        accessibilityFeatures: ['Wheelchair Accessible', 'Quiet Space Available', 'Gender-Neutral Restrooms'],
        maxAttendees: 15,
        currentAttendees: 8,
        isPublic: true,
        registrationRequired: false,
        contactEmail: 'community@rainbowcafe.com',
        tags: ['transgender', 'support', 'community', 'monthly'],
        createdAt: new Date('2025-07-01'),
        updatedAt: new Date('2025-07-01')
      }
    ],
    ownerId: 'mock-business-001',
    approved: true,
    featured: true,
    averageRating: 4.8,
    reviewCount: 24,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: 'pride-health-center-002',
    name: 'Pride Health Center',
    description: 'Comprehensive healthcare services with LGBTQ+ specialization. Trans-friendly care and hormone therapy available.',
    category: 'healthcare',
    location: {
      address: '456 Wellness Ave',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201'
    },
    contact: {
      phone: '(555) 987-6543',
      email: 'care@pridehealthcenter.org',
      website: 'https://pridehealthcenter.org'
    },
    accessibility: {
      wheelchairAccessible: true,
      visuallyImpairedFriendly: true,
      hearingImpairedFriendly: true,
      notes: 'Full accessibility features available'
    },
    lgbtqInfo: {
      safeSpaceCertified: true,
      lgbtqOwned: false,
      supportsPrideEvents: true,
      lgbtqStaffTraining: true,
      genderNeutralBathrooms: true,
      notes: 'Specialized LGBTQ+ healthcare providers on staff'
    },
    tags: ['healthcare', 'trans-friendly', 'hormone-therapy', 'mental-health'],
    services: [
      {
        id: 'health-service-1',
        name: 'Primary Care Consultation',
        description: 'Comprehensive primary care with LGBTQ+ affirming approach',
        price: '$120 - $180',
        duration: '30-60 minutes',
        category: 'Medical',
        available: true
      },
      {
        id: 'health-service-2',
        name: 'Hormone Replacement Therapy',
        description: 'HRT consultation and ongoing care for transgender patients',
        price: '$200 - $350',
        duration: '45-90 minutes',
        category: 'Specialized',
        available: true
      },
      {
        id: 'health-service-3',
        name: 'Mental Health Counseling',
        description: 'LGBTQ+ specialized therapy and counseling services',
        price: '$100 - $150',
        duration: '50 minutes',
        category: 'Mental Health',
        available: true
      },
      {
        id: 'health-service-4',
        name: 'Sexual Health Services',
        description: 'Comprehensive sexual health care and STI testing',
        price: '$80 - $120',
        duration: '30 minutes',
        category: 'Sexual Health',
        available: true
      }
    ],
    mediaGallery: [
      {
        id: 'health-media-1',
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
        title: 'Modern Reception Area',
        description: 'Our welcoming, accessible reception area designed for all patients',
        category: 'interior',
        uploadedAt: new Date('2024-12-12'),
        featured: true
      },
      {
        id: 'health-media-2',
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
        title: 'Accessible Examination Room',
        description: 'Fully accessible examination room with adjustable equipment',
        category: 'accessibility',
        uploadedAt: new Date('2024-12-09'),
        featured: false
      },
      {
        id: 'health-media-3',
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400',
        title: 'Medical Team',
        description: 'Our diverse, LGBTQ+-affirming medical team committed to inclusive healthcare',
        category: 'staff',
        uploadedAt: new Date('2024-12-07'),
        featured: false
      }
    ],
    ownerId: 'mock-business-002',
    approved: true,
    featured: false,
    averageRating: 4.9,
    reviewCount: 18,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-11-15')
  },
  {
    id: 'mock-business-1',
    name: 'Rainbow Café (Legacy)',
    description: 'A welcoming café serving organic coffee and pastries. LGBTQ+ owned and operated with a focus on community building.',
    category: 'restaurant',
    location: {
      address: '123 Pride Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102'
    },
    contact: {
      phone: '(555) 123-4567',
      email: 'hello@rainbowcafe.com',
      website: 'https://rainbowcafe.com'
    },
    accessibility: {
      wheelchairAccessible: true,
      visuallyImpairedFriendly: true,
      hearingImpairedFriendly: false,
      notes: 'Wheelchair ramp available, braille menus provided'
    },
    lgbtqInfo: {
      safeSpaceCertified: true,
      lgbtqOwned: true,
      supportsPrideEvents: true,
      lgbtqStaffTraining: true,
      genderNeutralBathrooms: true,
      notes: 'Hosts weekly LGBTQ+ community events'
    },
    tags: ['coffee', 'organic', 'community', 'safe-space'],
    ownerId: 'mock-user-456',
    approved: true,
    featured: false,
    averageRating: 4.8,
    reviewCount: 24,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: 'mock-business-2',
    name: 'Inclusive Health Clinic',
    description: 'Comprehensive healthcare services with LGBTQ+ specialization. Trans-friendly care and hormone therapy available.',
    category: 'healthcare',
    location: {
      address: '456 Wellness Ave',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201'
    },
    contact: {
      phone: '(555) 987-6543',
      email: 'care@inclusivehealth.org'
    },
    accessibility: {
      wheelchairAccessible: true,
      visuallyImpairedFriendly: true,
      hearingImpairedFriendly: true,
      notes: 'Full accessibility features available'
    },
    lgbtqInfo: {
      safeSpaceCertified: true,
      lgbtqOwned: false,
      supportsPrideEvents: true,
      lgbtqStaffTraining: true,
      genderNeutralBathrooms: true,
      notes: 'Specialized LGBTQ+ healthcare providers on staff'
    },
    tags: ['healthcare', 'trans-friendly', 'hormone-therapy', 'mental-health'],
    ownerId: 'mock-user-789',
    approved: true,
    featured: false,
    averageRating: 4.9,
    reviewCount: 18,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-11-15')
  },
  {
    id: 'mock-business-3',
    name: 'Pride Fitness Studio',
    description: 'Body-positive fitness studio welcoming all body types and fitness levels. Group classes and personal training available.',
    category: 'fitness',
    location: {
      address: '789 Strength Blvd',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701'
    },
    contact: {
      phone: '(555) 456-7890',
      website: 'https://pridefitness.com'
    },
    accessibility: {
      wheelchairAccessible: true,
      visuallyImpairedFriendly: false,
      hearingImpairedFriendly: false,
      notes: 'Accessible equipment available'
    },
    lgbtqInfo: {
      safeSpaceCertified: true,
      lgbtqOwned: true,
      supportsPrideEvents: true,
      lgbtqStaffTraining: true,
      genderNeutralBathrooms: true,
      notes: 'Trans-inclusive changing rooms and policies'
    },
    tags: ['fitness', 'body-positive', 'inclusive', 'group-classes'],
    ownerId: 'mock-user-101',
    approved: false, // Pending approval
    featured: false,
    averageRating: 0,
    reviewCount: 0,
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date('2024-12-20')
  },
  {
    id: 'inclusive-bookstore-003',
    name: 'Inclusive Bookstore',
    description: 'Community bookstore featuring LGBTQ+ literature, diverse authors, and regular community events. Safe space for all.',
    category: 'retail',
    location: {
      address: '321 Literary Lane',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101'
    },
    contact: {
      phone: '(555) 234-5678',
      email: 'hello@inclusivebooks.com',
      website: 'https://inclusivebooks.com'
    },
    accessibility: {
      wheelchairAccessible: true,
      visuallyImpairedFriendly: true,
      hearingImpairedFriendly: false,
      notes: 'Wheelchair accessible, large print books available'
    },
    lgbtqInfo: {
      safeSpaceCertified: true,
      lgbtqOwned: true,
      supportsPrideEvents: true,
      lgbtqStaffTraining: true,
      genderNeutralBathrooms: true,
      notes: 'Extensive LGBTQ+ literature collection and community events'
    },
    tags: ['bookstore', 'literature', 'community', 'events'],
    ownerId: 'mock-user-bookstore',
    approved: true,
    featured: true,
    averageRating: 4.9,
    reviewCount: 15,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-11-20')
  }
];

class MockBusinessService {
  async getBusinesses(filters: BusinessFilters = {}, limit: number = 20): Promise<{ businesses: BusinessListing[], lastDoc: any }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredBusinesses = mockBusinesses.filter(business => business.approved);

    // Apply filters
    if (filters.category) {
      filteredBusinesses = filteredBusinesses.filter(b => b.category === filters.category);
    }
    if (filters.city) {
      filteredBusinesses = filteredBusinesses.filter(b => 
        b.location.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }
    if (filters.safeSpaceCertified) {
      filteredBusinesses = filteredBusinesses.filter(b => b.lgbtqInfo.safeSpaceCertified);
    }
    if (filters.lgbtqOwned) {
      filteredBusinesses = filteredBusinesses.filter(b => b.lgbtqInfo.lgbtqOwned);
    }
    if (filters.wheelchairAccessible) {
      filteredBusinesses = filteredBusinesses.filter(b => b.accessibility.wheelchairAccessible);
    }

    return {
      businesses: filteredBusinesses.slice(0, limit),
      lastDoc: null
    };
  }

  async getBusiness(businessId: string): Promise<BusinessListing | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockBusinesses.find(b => b.id === businessId) || null;
  }

  async searchBusinesses(searchQuery: string, filters: BusinessFilters = {}, pageLimit: number = 20): Promise<{ businesses: BusinessListing[], lastDoc: any }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    let results = mockBusinesses.filter(business => {
      const searchLower = searchQuery.toLowerCase();
      return business.approved && (
        business.name.toLowerCase().includes(searchLower) ||
        business.description.toLowerCase().includes(searchLower) ||
        business.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    });

    return {
      businesses: results.slice(0, pageLimit),
      lastDoc: null
    };
  }

  async getBusinessesByCategory(category: BusinessCategory, pageLimit: number = 20): Promise<{ businesses: BusinessListing[], lastDoc: any }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const results = mockBusinesses.filter(b => b.approved && b.category === category);

    return {
      businesses: results.slice(0, pageLimit),
      lastDoc: null
    };
  }

  async getPendingBusinesses(): Promise<BusinessListing[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockBusinesses.filter(b => !b.approved);
  }

  async approveBusiness(businessId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const business = mockBusinesses.find(b => b.id === businessId);
    if (business) {
      business.approved = true;
      business.updatedAt = new Date();
    }
  }

  async rejectBusiness(businessId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real implementation, this might soft-delete or mark as rejected
    const index = mockBusinesses.findIndex(b => b.id === businessId);
    if (index !== -1) {
      mockBusinesses.splice(index, 1);
    }
  }

  async createBusiness(businessData: Omit<BusinessListing, 'id' | 'createdAt' | 'updatedAt' | 'averageRating' | 'reviewCount'>): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const newBusiness: BusinessListing = {
      ...businessData,
      id: `mock-business-${Date.now()}`,
      averageRating: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockBusinesses.push(newBusiness);
    return newBusiness.id!;
  }

  async updateBusinessServices(businessId: string, services: ServiceItem[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const business = mockBusinesses.find(b => b.id === businessId);
    if (business) {
      business.services = services;
      business.updatedAt = new Date();
    }
  }

  async getBusinessServices(businessId: string): Promise<ServiceItem[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const business = mockBusinesses.find(b => b.id === businessId);
    return business?.services || [];
  }

  async addBusinessService(businessId: string, service: Omit<ServiceItem, 'id'>): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const business = mockBusinesses.find(b => b.id === businessId);
    if (business) {
      const newService: ServiceItem = {
        ...service,
        id: `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      if (!business.services) {
        business.services = [];
      }
      business.services.push(newService);
      business.updatedAt = new Date();
      return newService.id;
    }
    throw new Error('Business not found');
  }

  async updateBusinessService(businessId: string, serviceId: string, serviceData: Partial<ServiceItem>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const business = mockBusinesses.find(b => b.id === businessId);
    if (business && business.services) {
      const serviceIndex = business.services.findIndex(s => s.id === serviceId);
      if (serviceIndex !== -1) {
        business.services[serviceIndex] = { ...business.services[serviceIndex], ...serviceData };
        business.updatedAt = new Date();
      }
    }
  }

  async deleteBusinessService(businessId: string, serviceId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const business = mockBusinesses.find(b => b.id === businessId);
    if (business && business.services) {
      business.services = business.services.filter(s => s.id !== serviceId);
      business.updatedAt = new Date();
    }
  }

  // Media Gallery Management Methods
  async getBusinessMedia(businessId: string): Promise<MediaItem[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const business = mockBusinesses.find(b => b.id === businessId);
    return business?.mediaGallery || [];
  }

  async addBusinessMedia(businessId: string, mediaData: Omit<MediaItem, 'id' | 'uploadedAt'>): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const business = mockBusinesses.find(b => b.id === businessId);
    if (business) {
      const newMedia: MediaItem = {
        ...mediaData,
        id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        uploadedAt: new Date()
      };
      
      if (!business.mediaGallery) {
        business.mediaGallery = [];
      }
      business.mediaGallery.unshift(newMedia); // Add at beginning
      business.updatedAt = new Date();
      return newMedia.id;
    }
    throw new Error('Business not found');
  }

  async updateBusinessMedia(businessId: string, mediaId: string, mediaData: Partial<MediaItem>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const business = mockBusinesses.find(b => b.id === businessId);
    if (business && business.mediaGallery) {
      const mediaIndex = business.mediaGallery.findIndex(m => m.id === mediaId);
      if (mediaIndex !== -1) {
        business.mediaGallery[mediaIndex] = { ...business.mediaGallery[mediaIndex], ...mediaData };
        business.updatedAt = new Date();
      }
    }
  }

  async deleteBusinessMedia(businessId: string, mediaId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const business = mockBusinesses.find(b => b.id === businessId);
    if (business && business.mediaGallery) {
      business.mediaGallery = business.mediaGallery.filter(m => m.id !== mediaId);
      business.updatedAt = new Date();
    }
  }

  async setFeaturedMedia(businessId: string, mediaId: string, featured: boolean): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const business = mockBusinesses.find(b => b.id === businessId);
    if (business && business.mediaGallery) {
      const mediaIndex = business.mediaGallery.findIndex(m => m.id === mediaId);
      if (mediaIndex !== -1) {
        business.mediaGallery[mediaIndex].featured = featured;
        business.updatedAt = new Date();
      }
    }
  }

  // Event Management Methods
  async getBusinessEvents(businessId: string): Promise<BusinessEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const business = mockBusinesses.find(b => b.id === businessId);
    return business?.events || [];
  }

  async addBusinessEvent(businessId: string, event: BusinessEvent): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const business = mockBusinesses.find(b => b.id === businessId);
    if (business) {
      if (!business.events) {
        business.events = [];
      }
      business.events.unshift(event);
      business.updatedAt = new Date();
    }
  }

  async updateBusinessEvent(businessId: string, eventId: string, updates: Partial<BusinessEvent>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const business = mockBusinesses.find(b => b.id === businessId);
    if (business && business.events) {
      const eventIndex = business.events.findIndex(e => e.id === eventId);
      if (eventIndex !== -1) {
        business.events[eventIndex] = { 
          ...business.events[eventIndex], 
          ...updates,
          updatedAt: new Date()
        };
        business.updatedAt = new Date();
      }
    }
  }

  async deleteBusinessEvent(businessId: string, eventId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const business = mockBusinesses.find(b => b.id === businessId);
    if (business && business.events) {
      business.events = business.events.filter(e => e.id !== eventId);
      business.updatedAt = new Date();
    }
  }

  async getPublicEvents(limit?: number): Promise<BusinessEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const allEvents: BusinessEvent[] = [];
    
    mockBusinesses.forEach(business => {
      if (business.events) {
        const publicEvents = business.events.filter(event => event.isPublic);
        allEvents.push(...publicEvents);
      }
    });

    // Sort by date (upcoming first)
    allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return limit ? allEvents.slice(0, limit) : allEvents;
  }

  async searchEvents(query: string, filters?: { category?: string; startDate?: Date; endDate?: Date }): Promise<BusinessEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const allEvents = await this.getPublicEvents();
    
    let filteredEvents = allEvents.filter(event => 
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.description.toLowerCase().includes(query.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );

    if (filters) {
      if (filters.category) {
        filteredEvents = filteredEvents.filter(event => event.category === filters.category);
      }
      if (filters.startDate) {
        filteredEvents = filteredEvents.filter(event => event.date >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredEvents = filteredEvents.filter(event => event.date <= filters.endDate!);
      }
    }

    return filteredEvents;
  }
}

export const businessService = new MockBusinessService();
export default businessService;
