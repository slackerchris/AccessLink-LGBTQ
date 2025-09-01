
import { useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { debouncedNavigate } from '../utils/navigationHelpers';
import { Event } from '../types/events';
import { EventsScreenNavigationProp } from '../types/navigation';
import { useTheme } from './useTheme';

export const useEvents = () => {
  const navigation = useNavigation<EventsScreenNavigationProp>();
  const { colors } = useTheme();

  const events: Event[] = useMemo(() => [
    {
      id: 1,
      title: 'Pride Month Celebration',
      date: 'June 15, 2025',
      time: '6:00 PM',
      location: 'Rainbow Park',
      category: 'Community',
      color: '#ec4899',
      ownerId: 'business-owner-123',
      description: 'Celebrate Pride Month with live music, speakers, and community booths.',
      contact: { phone: '(555) 111-2222', website: 'pride.example.org' }
    },
    {
      id: 2,
      title: 'LGBTQ+ Business Mixer',
      date: 'July 20, 2025',
      time: '7:00 PM',
      location: 'Downtown Convention Center',
      category: 'Networking',
      color: colors.primary,
      ownerId: 'business-owner-123',
      description: 'Meet local LGBTQ+ entrepreneurs and allies. Snacks and refreshments provided.',
      contact: { phone: '(555) 222-3333', website: 'mixers.example.com' }
    },
    {
      id: 3,
      title: 'Wellness Workshop',
      date: 'August 5, 2025',
      time: '2:00 PM',
      location: 'Pride Health Center',
      category: 'Health',
      color: '#10b981',
      ownerId: 'org-abc',
      description: 'Mindfulness and self-care techniques to support mental wellness.',
      contact: { phone: '(555) 333-4444', website: 'wellness.example.net' }
    }
  ], [colors.primary]);

  const handleEventPress = useCallback((event: Event) => {
    console.log('📅 EventsScreen: Event pressed:', event.title);
    debouncedNavigate(navigation, 'EventDetails', { event });
  }, [navigation]);

  return {
    events,
    handleEventPress,
  };
};
