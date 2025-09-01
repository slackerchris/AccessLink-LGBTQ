import { BusinessListing } from '../services/businessService';
import { Event } from './events';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  EventDetails: { event: Event };
  Portal: undefined;
  EditProfile: undefined;
  SavedPlaces: undefined;
  ReviewHistory: undefined;
  AccessibilityPreferences: undefined;
  LGBTQIdentity: undefined;
  Home: undefined;
  Directory: { screen: string, params: { business: BusinessListing, searchQuery?: string } } | { searchQuery: string } | undefined;
  CreateReview: { businessId: string, businessName: string };
  AdminDashboard: undefined;
  UserManagement: undefined;
  DebugDashboard: undefined;
  BusinessManagement: undefined;
  AddBusiness: undefined;
  BusinessDetails: { businessId: string, business?: BusinessListing };
  BusinessProfilesList: undefined;
  MediaGallery: undefined;
  EventsManagement: undefined;
  ServicesManagement: undefined;
  Reviews: undefined;
  BusinessProfileEdit: { businessId: string };
  Events: undefined;
  ComingSoon: { featureName: string };
};

export type EventsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Events'>;