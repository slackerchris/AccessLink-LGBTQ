import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth, useBusiness } from './useFirebaseAuth';
import { useBusinessEvents } from './useBusinessEvents';
import { BusinessEvent, EventCategory } from '../types/event';
import { normalizeTimestampToDate } from '../utils/dateUtils';
import { Timestamp } from 'firebase/firestore';
import { RootStackParamList } from '../types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';

type EventsManagementNavigationProp = StackNavigationProp<
  RootStackParamList,
  'EventsManagement'
>;

const categories: Array<{
  key: EventCategory;
  label: string;
  icon: string;
}> = [
  { key: 'social', label: 'Social Gathering', icon: '🎉' },
  { key: 'educational', label: 'Educational', icon: '📚' },
  { key: 'health', label: 'Health & Wellness', icon: '🏥' },
  { key: 'advocacy', label: 'Advocacy', icon: '✊' },
  { key: 'entertainment', label: 'Entertainment', icon: '🎭' },
  { key: 'support', label: 'Support Group', icon: '🤝' },
  { key: 'community', label: 'Community Event', icon: '🏳️‍🌈' },
  { key: 'fundraising', label: 'Fundraising', icon: '💰' },
  { key: 'other', label: 'Other', icon: '📅' },
];

const accessibilityFeatureOptions = [
    'Wheelchair Accessible',
    'Sign Language Interpreter',
    'Audio Description',
    'Large Print Materials',
    'Sensory-Friendly Environment',
    'Service Animal Friendly',
    'Accessible Parking',
    'Gender-Neutral Restrooms',
    'Quiet Space Available',
    'Live Captioning'
];

export const useEventsManagement = (navigation: EventsManagementNavigationProp) => {
  const { userProfile } = useAuth();
  const { getMyBusinesses } = useBusiness();
  const [userBusinessId, setUserBusinessId] = useState<string | null>(null);
  const { 
    events, 
    loading: eventsLoading, 
    error: eventsError, 
    refreshEvents, 
    addEvent, 
    updateEvent, 
    deleteEvent 
  } = useBusinessEvents(userBusinessId);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BusinessEvent | null>(null);
  const [viewMode, setViewMode] = useState<'upcoming' | 'past' | 'draft'>('upcoming');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<BusinessEvent | null>(null);
  const [formData, setFormData] = useState<Partial<BusinessEvent>>({});

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!userProfile?.uid) return;
      try {
        const businesses = await getMyBusinesses();
        if (businesses.length > 0) {
          setUserBusinessId(businesses[0].id);
        } else {
          setUserBusinessId(null);
          Alert.alert("No Business Found", "You need to create a business profile to manage events.");
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error loading business:', error);
        Alert.alert("Error", "Could not load your business information.");
      }
    };
    fetchBusiness();
  }, [userProfile, getMyBusinesses, navigation]);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = normalizeTimestampToDate(event.date);
      if (!eventDate) return false;

      switch (viewMode) {
        case 'upcoming':
          return eventDate >= now;
        case 'past':
          return eventDate < now;
        case 'draft':
          return !event.isPublic;
        default:
          return true;
      }
    });
  }, [events, viewMode]);

  const handleCreateEvent = useCallback(() => {
    setEditingEvent(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    setFormData({
      title: '',
      description: '',
      date: Timestamp.fromDate(tomorrow),
      startTime: '09:00',
      endTime: '17:00',
      location: '',
      category: 'community',
      isAccessible: true,
      accessibilityFeatures: [],
      isPublic: true,
      registrationRequired: false,
    });
    setIsModalVisible(true);
  }, []);

  const handleEditEvent = useCallback((event: BusinessEvent) => {
    setEditingEvent(event);
    setFormData({ ...event });
    setIsModalVisible(true);
  }, []);

  const handleSaveEvent = async () => {
    if (!formData.title?.trim() || !formData.description?.trim()) {
      Alert.alert('Error', 'Title and description are required.');
      return;
    }
    if (!userBusinessId) {
        Alert.alert('Error', 'No business associated with this account.');
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = normalizeTimestampToDate(formData.date);

    if (eventDate && eventDate < today) {
      Alert.alert('Error', 'Event date cannot be in the past.');
      return;
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      Alert.alert('Error', 'Start time must be before end time.');
      return;
    }

    const registrationDeadline = normalizeTimestampToDate(formData.registrationDeadline);
    if (formData.registrationRequired && registrationDeadline && eventDate && registrationDeadline > eventDate) {
      Alert.alert('Error', 'Registration deadline cannot be after the event date.');
      return;
    }

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, formData);
      } else {
        await addEvent(formData as Omit<BusinessEvent, 'id' | 'createdAt' | 'updatedAt' | 'businessId'>);
      }
      setIsModalVisible(false);
      Alert.alert('Success', `Event ${editingEvent ? 'updated' : 'created'} successfully!`);
      refreshEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', 'Failed to save event. Please try again.');
    }
  };

  const handleDeletePress = useCallback((event: BusinessEvent) => {
    setEventToDelete(event);
    setShowDeleteConfirmation(true);
  }, []);

  const handleConfirmDelete = async (eventId: string) => {
    if (!userBusinessId) return;
    try {
      await deleteEvent(eventId);
      if (editingEvent?.id === eventId) {
        setIsModalVisible(false);
        setEditingEvent(null);
      }
      Alert.alert('Success', 'Event deleted successfully.');
    } catch (error) {
      console.error('Error deleting event:', error);
      Alert.alert('Error', 'Failed to delete event.');
    } finally {
      setShowDeleteConfirmation(false);
      setEventToDelete(null);
    }
  };

  const toggleAccessibilityFeature = useCallback((feature: string) => {
    setFormData(prev => ({
      ...prev,
      accessibilityFeatures: prev.accessibilityFeatures?.includes(feature)
        ? prev.accessibilityFeatures.filter(f => f !== feature)
        : [...(prev.accessibilityFeatures || []), feature],
    }));
  }, []);

  return {
    navigation,
    events,
    eventsLoading,
    eventsError,
    filteredEvents,
    isModalVisible,
    setIsModalVisible,
    editingEvent,
    formData,
    setFormData,
    viewMode,
    setViewMode,
    showDeleteConfirmation,
    setShowDeleteConfirmation,
    eventToDelete,
    handleCreateEvent,
    handleEditEvent,
    handleSaveEvent,
    handleDeletePress,
    handleConfirmDelete,
    toggleAccessibilityFeature,
    refreshEvents,
    categories,
    accessibilityFeatureOptions,
  };
};
