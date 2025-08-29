# Firebase Firestore Indexes Required

## Reviews Collection Composite Index

For the Business Reviews Management feature to work properly, the following Firestore composite index is required:

### Index Configuration
- **Collection**: `reviews`
- **Fields**:
  1. `businessId` (Ascending)
  2. `createdAt` (Descending)
  3. `__name__` (Ascending)

### Creation Links
The Firebase console should automatically prompt you to create this index when the query is first executed. Alternatively, you can create it manually:

1. Go to [Firebase Console](https://console.firebase.google.com/project/acceslink-lgbtq/firestore/indexes)
2. Click "Add Index"
3. Select Collection: `reviews`
4. Add fields as specified above

### Error Message
If you see this error:
```
The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/acceslink-lgbtq/firestore/indexes?create_composite=...
```

Click the provided link to automatically create the required index.

### Current Workaround
The `getBusinessReviews` function has been modified to:
1. Query without `orderBy` to avoid index requirements
2. Sort results client-side
3. Limit results after sorting

This provides the same functionality while the index is being created or in development environments.

## Other Potential Indexes

As the app grows, you may need additional indexes for:
- User review history queries
- Business search with filters
- Admin review management queries

Monitor the Firebase Console for index creation prompts as new features are added.
