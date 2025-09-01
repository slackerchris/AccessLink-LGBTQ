import { TimestampField } from './business';

export interface BusinessResponse {
  id: string;
  reviewId: string;
  businessId: string;
  businessOwnerId: string;
  businessOwnerName: string;
  message: string;
  createdAt: TimestampField;
  updatedAt: TimestampField;
}

export interface Review {
  id: string;
  businessId: string;
  userId?: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt: TimestampField;
  updatedAt: TimestampField;
  businessResponse?: BusinessResponse;
}
