import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView, Card, Chip } from '../components/AccessibleComponents';

export const EventsScreen = () => {
  const theme = useTheme();

  const mockEvents = [
    {
      id: '1',
      title: 'Pride Community Meetup',
      date: '2024-01-20',
      time: '2:00 PM',
      location: 'Community Center',
      accessibility: ['wheelchair-accessible', 'asl-interpreter'],
    },
    {
      id: '2',
      title: 'Accessible Art Workshop',
      date: '2024-01-25',
      time: '10:00 AM',
      location: 'Art Studio Downtown',
      accessibility: ['wheelchair-accessible', 'sensory-friendly'],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        accessibilityLabel="Events list"
      >
        <Text 
          variant="headlineMedium" 
          style={[styles.title, { color: theme.colors.onBackground }]}
          accessibilityRole="header"
        >
          Community Events
        </Text>

        {mockEvents.map((event) => (
          <Card key={event.id} style={styles.eventCard} accessibilityLabel={`Event: ${event.title}`}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.eventTitle}>
                {event.title}
              </Text>
              
              <Text variant="bodyMedium" style={[styles.eventDetail, { color: theme.colors.onSurfaceVariant }]}>
                📅 {event.date} at {event.time}
              </Text>
              
              <Text variant="bodyMedium" style={[styles.eventDetail, { color: theme.colors.onSurfaceVariant }]}>
                📍 {event.location}
              </Text>

              <View style={styles.accessibilityChips}>
                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Accessibility Features:
                </Text>
                <View style={styles.chipContainer}>
                  {event.accessibility.map((feature) => (
                    <Chip 
                      key={feature} 
                      style={styles.chip}
                      textStyle={{ fontSize: 12 }}
                      accessibilityLabel={`Accessibility feature: ${feature.replace('-', ' ')}`}
                    >
                      {feature.replace('-', ' ')}
                    </Chip>
                  ))}
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  eventCard: {
    marginBottom: 16,
  },
  eventTitle: {
    marginBottom: 8,
  },
  eventDetail: {
    marginBottom: 4,
  },
  accessibilityChips: {
    marginTop: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
});
