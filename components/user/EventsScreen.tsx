/**
 * Events Screen
 * Shows community events for users
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EventsScreenProps {
  navigation: any;
}

export const EventsScreen: React.FC<EventsScreenProps> = ({ navigation }) => {
  const events = [
    {
      id: 1,
      title: 'Pride Month Celebration',
      date: 'June 15, 2025',
      time: '6:00 PM',
      location: 'Rainbow Park',
      category: 'Community',
      color: '#ec4899'
    },
    {
      id: 2,
      title: 'LGBTQ+ Business Mixer',
      date: 'July 20, 2025',
      time: '7:00 PM',
      location: 'Downtown Convention Center',
      category: 'Networking',
      color: '#6366f1'
    },
    {
      id: 3,
      title: 'Wellness Workshop',
      date: 'August 5, 2025',
      time: '2:00 PM',
      location: 'Pride Health Center',
      category: 'Health',
      color: '#10b981'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Events</Text>
        <Text style={styles.headerSubtitle}>
          Connect with your community at these upcoming events
        </Text>
      </View>

      <View style={styles.content}>
        {events.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => Alert.alert(event.title, `${event.date} at ${event.time}\n${event.location}`)}
          >
            <View style={[styles.eventCategory, { backgroundColor: event.color }]}>
              <Text style={styles.eventCategoryText}>{event.category}</Text>
            </View>
            
            <Text style={styles.eventTitle}>{event.title}</Text>
            
            <View style={styles.eventDetails}>
              <View style={styles.eventDetail}>
                <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                <Text style={styles.eventDetailText}>{event.date}</Text>
              </View>
              
              <View style={styles.eventDetail}>
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text style={styles.eventDetailText}>{event.time}</Text>
              </View>
              
              <View style={styles.eventDetail}>
                <Ionicons name="location-outline" size={16} color="#6b7280" />
                <Text style={styles.eventDetailText}>{event.location}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.comingSoon}>
          <Ionicons name="calendar" size={48} color="#d1d5db" />
          <Text style={styles.comingSoonTitle}>More Events Coming Soon!</Text>
          <Text style={styles.comingSoonText}>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#6366f1',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    lineHeight: 22,
  },
  content: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
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
    color: '#1f2937',
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
    color: '#6b7280',
  },
  comingSoon: {
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
