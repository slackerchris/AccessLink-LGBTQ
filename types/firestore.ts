/**
 * Firestore Type Definitions
 * Common types used across the database layer
 */

import { Timestamp, FieldValue, serverTimestamp } from 'firebase/firestore';

// Timestamp type for Firestore documents
export type FirestoreTimestamp = Timestamp | FieldValue;

// Document tracking fields
export interface DocumentMetadata {
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  schemaVersion?: number; // Used for schema migrations
}

// Document with ID
export interface WithId {
  id: string;
}

// Base interface for all document types
export interface BaseDocument extends DocumentMetadata {
  id?: string;
}

// Pagination result interface
export interface PaginatedResult<T> {
  items: T[];
  lastDoc: any | null;
  hasMore: boolean;
  totalCount?: number;
}

// Geolocation coordinates
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

// Search result highlighting
export interface SearchHighlight {
  field: string;
  matches: string[];
}

// Basic permission levels
export type PermissionLevel = 'read' | 'write' | 'admin';

// Access control
export interface AccessControl {
  ownerId: string;
  readers?: string[];
  writers?: string[];
  isPublic: boolean;
  modifiedBy?: string;
  modifiedAt?: FirestoreTimestamp;
}

/**
 * Database operation result
 */
export interface DbResult<T = any> {
  success: boolean;
  data?: T;
  error?: Error;
  code?: string;
}

/**
 * Helper to create timestamps
 */
export const createTimestamps = () => ({
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});

/**
 * Helper to update timestamps
 */
export const updateTimestamp = () => ({
  updatedAt: serverTimestamp()
});
