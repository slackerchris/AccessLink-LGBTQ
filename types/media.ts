import { Timestamp } from 'firebase/firestore';

export type MediaCategory = 'accessibility' | 'interior' | 'exterior' | 'menu' | 'staff' | 'event' | 'other';

export interface MediaItem {
  id: string;
  uri: string;
  title: string;
  description: string;
  category: MediaCategory;
  featured: boolean;
  uploadedAt: Timestamp;
}
