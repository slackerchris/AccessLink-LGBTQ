import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import { EventsScreenNavigationProp } from '../../types/navigation';
import { Event } from '../../types/events';
import { useEvents } from '../../hooks/useEvents';

interface EventsScreenProps {
  navigation: EventsScreenNavigationProp;
}

const EventCard = React.memo(({ item, onPress }: { item: Event, onPress: () => void }) => {
    const { colors, createStyles } = useTheme();
    const styles = createStyles(localStyles);
    return (
        <TouchableOpacity
            style={styles.eventCard}
            onPress={onPress}
        >
            <View style={[styles.eventCategory, { backgroundColor: item.color || colors.primary }]}>
                <Text style={styles.eventCategoryText}>{item.category}</Text>
            </View>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <View style={styles.eventDetails}>
                <View style={styles.eventDetail}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.eventDetailText}>{item.date}</Text>
                </View>
                <View style={styles.eventDetail}>
                    <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.eventDetailText}>{item.time}</Text>
                </View>
                <View style={styles.eventDetail}>
                    <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.eventDetailText} numberOfLines={1}>{item.location}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

const ListHeader = React.memo(() => {
    const { colors, createStyles } = useTheme();
    const styles = createStyles(localStyles);
    return (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Community Events</Text>
            <Text style={styles.headerSubtitle}>
                Connect with your community at these upcoming events
            </Text>
        </View>
    );
});

const ListFooter = React.memo(() => {
    const { colors, createStyles } = useTheme();
    const styles = createStyles(localStyles);
    return (
        <View style={styles.comingSoon}>
            <Ionicons name="calendar" size={48} color={colors.textSecondary} />
            <Text style={styles.comingSoonTitle}>More Events Coming Soon!</Text>
            <Text style={styles.comingSoonText}>
                We're working on adding more community events. Check back regularly for updates.
            </Text>
        </View>
    );
});

export const EventsScreen: React.FC<EventsScreenProps> = ({ navigation }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const { events, handleEventPress } = useEvents();

  return (
    <FlatList
      style={styles.container}
      data={events}
      renderItem={({ item }) => <EventCard item={item} onPress={() => handleEventPress(item)} />}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={<ListHeader />}
      ListFooterComponent={<ListFooter />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    />
  );
};

const localStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.headerText,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.headerText + 'CC',
  },
  content: {
    padding: 20,
  },
  eventCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    shadowColor: colors.shadow,
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
    color: colors.headerText,
    fontSize: 12,
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.text,
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
    color: colors.textSecondary,
    flexShrink: 1,
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
    color: colors.text,
  },
  comingSoonText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: colors.textSecondary,
  },
});