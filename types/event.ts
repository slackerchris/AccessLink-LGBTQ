import { Timestamp } from 'firebase/firestore';

export type EventCategory =
  | 'social'
  | 'educational'
  | 'health'
  | 'advocacy'
  | 'entertainment'
  | 'support'
  | 'community'
  | 'fundraising'
  | 'other';

export interface BusinessEvent {
  id: string;
  businessId: string;
  title: string;
  description: string;
  date: Timestamp;
  startTime: string;
  endTime: string;
  location: string;
  category: EventCategory;
  isPublic: boolean;
  registrationRequired: boolean;
  registrationLink?: string;
  registrationDeadline?: Timestamp;
  isAccessible: boolean;
  accessibilityFeatures: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type EventFormData = Omit<BusinessEvent, 'id' | 'createdAt' | 'updatedAt' | 'businessId'>;

