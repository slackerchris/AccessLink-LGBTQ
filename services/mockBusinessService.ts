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
}

export const businessService = new MockBusinessService();
export default businessService;
