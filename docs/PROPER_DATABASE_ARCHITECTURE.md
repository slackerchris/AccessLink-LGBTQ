# Proper Database Architecture for AccessLink LGBTQ+

## Current Problem
- Complex queries requiring multiple composite indexes
- Performance issues (5-10 second load times)
- Scalability concerns with client-side filtering

## Proposed Solution: Denormalized Collections Strategy

### 1. Core Collections

#### `businesses` (Master Data)
```
{
  id: string,
  name: string,
  description: string,
  ownerId: string,
  status: 'pending' | 'approved' | 'rejected',
  location: { address, city, state, zipCode, coordinates },
  contact: { phone, email, website },
  category: BusinessCategory,
  lgbtqFriendly: { verified, certifications },
  accessibility: { wheelchairAccessible, features },
  images: string[],
  tags: string[],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `approved_businesses` (Read-Optimized)
- Auto-populated via Cloud Functions when business is approved
- Pre-filtered for status = 'approved'
- Optimized for fast reads
```
{
  id: string,
  name: string,
  description: string,
  location: { city, state },
  category: BusinessCategory,
  featured: boolean,
  averageRating: number,
  totalReviews: number,
  tags: string[],
  searchTerms: string[], // pre-computed for search
  createdAt: timestamp,
  lastActive: timestamp
}
```

#### `businesses_by_location` (Geographic Queries)
```
{
  businessId: string,
  name: string,
  city: string,
  state: string,
  coordinates: GeoPoint,
  category: BusinessCategory,
  featured: boolean,
  rating: number
}
```

#### `featured_businesses` (Homepage/Priority Listings)
```
{
  businessId: string,
  name: string,
  description: string,
  category: BusinessCategory,
  location: { city, state },
  rating: number,
  featuredUntil: timestamp,
  priority: number
}
```

### 2. Query Patterns

#### Initial Directory Load (Fast)
```typescript
// Simple query on optimized collection
query(
  collection(db, 'approved_businesses'),
  orderBy('lastActive', 'desc'),
  limit(20)
)
```

#### Category Filter
```typescript
query(
  collection(db, 'approved_businesses'),
  where('category', '==', category),
  orderBy('featured', 'desc'),
  orderBy('averageRating', 'desc'),
  limit(20)
)
```

#### Location Filter
```typescript
query(
  collection(db, 'businesses_by_location'),
  where('city', '==', city),
  orderBy('rating', 'desc'),
  limit(20)
)
```

#### Text Search
- Use Algolia or similar search service
- Or pre-compute search terms in `searchTerms` array

### 3. Cloud Functions for Data Consistency

#### `onBusinessApproved`
```typescript
// When business status changes to 'approved'
exports.onBusinessApproved = functions.firestore
  .document('businesses/{businessId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    if (before.status !== 'approved' && after.status === 'approved') {
      // Add to approved_businesses collection
      // Add to businesses_by_location collection
      // Update search index
    }
  });
```

#### `onBusinessUpdated`
```typescript
// Keep denormalized collections in sync
exports.onBusinessUpdated = functions.firestore
  .document('businesses/{businessId}')
  .onUpdate(async (change, context) => {
    // Update approved_businesses
    // Update businesses_by_location
    // Update search index
  });
```

### 4. Search Strategy

#### Option A: Firestore Array Queries (Simple)
```typescript
// Pre-compute search terms
searchTerms: [
  'coffee', 'shop', 'lgbt', 'friendly', 
  'seattle', 'capitol', 'hill'
]

// Query
where('searchTerms', 'array-contains-any', searchKeywords)
```

#### Option B: Algolia Integration (Advanced)
- Real-time search with typo tolerance
- Faceted search (category + location + features)
- Analytics and search insights

### 5. Performance Benefits

1. **Initial Load**: Under 500ms (simple orderBy query)
2. **Filtered Queries**: Under 1 second (single collection, minimal constraints)
3. **Scalability**: Handles 10k+ businesses efficiently
4. **Consistency**: Cloud Functions maintain data integrity

### 6. Implementation Plan

#### Phase 1: Core Collections Setup
1. Create new collection schemas
2. Migrate existing data
3. Update business service queries

#### Phase 2: Cloud Functions
1. Auto-population functions
2. Data sync functions
3. Search index maintenance

#### Phase 3: Search Enhancement
1. Implement search service (Algolia or custom)
2. Advanced filtering UI
3. Performance monitoring

### 7. Migration Strategy

1. **Parallel Implementation**: Build new system alongside old
2. **Data Migration**: Populate new collections from existing data
3. **Gradual Rollout**: Feature flags to switch between systems
4. **Cleanup**: Remove old complex queries after verification

This architecture eliminates the need for complex composite indexes and provides sub-second performance for all query patterns.
