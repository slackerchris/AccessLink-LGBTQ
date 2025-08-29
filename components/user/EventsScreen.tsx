/**
 * Events Screen
 * Shows community events for users
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface EventsScreenProps {
  navigation: any;
}

export const EventsScreen: React.FC<EventsScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const events = [
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
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>Community Events</Text>
        <Text style={[styles.headerSubtitle, { color: colors.headerText + 'CC' }]}>
          Connect with your community at these upcoming events
        </Text>
      </View>

      <View style={styles.content}>
        {events.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('EventDetails', { event })}
          >
            <View style={[styles.eventCategory, { backgroundColor: event.color }]}>
              <Text style={styles.eventCategoryText}>{event.category}</Text>
            </View>
            
            <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
            
            <View style={styles.eventDetails}>
              <View style={styles.eventDetail}>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>{event.date}</Text>
              </View>
              
              <View style={styles.eventDetail}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>{event.time}</Text>
              </View>
              
              <View style={styles.eventDetail}>
                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>{event.location}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.comingSoon}>
          <Ionicons name="calendar" size={48} color={colors.textSecondary} />
          <Text style={[styles.comingSoonTitle, { color: colors.text }]}>More Events Coming Soon!</Text>
          <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
            We're working on adding more community events. Check back regularly for updates.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  content: {
    padding: 20,
  },
  eventCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventCategory: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 12,
  },
  eventCategoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
  },
  comingSoon: {
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
