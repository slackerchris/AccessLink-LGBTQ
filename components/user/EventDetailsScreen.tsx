import React from 'react';
import { View, Text, TouchableOpacity, Platform, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import { useEventDetails } from '../../hooks/useEventDetails';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Event } from '../../types/events';

type EventDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EventDetails'>;
type EventDetailsScreenRouteProp = RouteProp<RootStackParamList, 'EventDetails'>;

interface Props {
  navigation: EventDetailsScreenNavigationProp;
  route: EventDetailsScreenRouteProp;
}

const EventHeader = React.memo(({ event }: { event: Event }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      {event.category && (
        <View style={[styles.categoryPill, { backgroundColor: event.color || colors.primary }]}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>
      )}
      <Text style={styles.title}>{event.title}</Text>
      {(event.date || event.time) && (
        <View style={styles.row}>
          {event.date && (
            <View style={styles.detail}>
              <Ionicons name="calendar-outline" size={18} color={colors.headerText} />
              <Text style={styles.detailText}>{event.date}</Text>
            </View>
          )}
          {event.time && (
            <View style={styles.detail}>
              <Ionicons name="time-outline" size={18} color={colors.headerText} />
              <Text style={styles.detailText}>{event.time}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
});

const QuickActionButton = React.memo(({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap, label: string, onPress: () => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.quickActionText}>{label}</Text>
    </TouchableOpacity>
  );
});

const QuickActionsBar = React.memo(({ event, handlers }: { event: Event, handlers: ReturnType<typeof useEventDetails> }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const { isOwner, openInMaps, emailEvent, handleCall, handleWebsite, addToCalendar } = handlers;

  return (
    <View style={styles.quickActions}>
      {event?.contact?.phone && <QuickActionButton icon="call" label="Call" onPress={handleCall} />}
      {event.location && <QuickActionButton icon="navigate" label="Directions" onPress={openInMaps} />}
      {event?.contact?.website && <QuickActionButton icon="globe" label="Website" onPress={handleWebsite} />}
      {event?.date && Platform.OS !== 'web' && <QuickActionButton icon="calendar" label="Add" onPress={addToCalendar} />}
      {isOwner && <QuickActionButton icon="mail" label="Email" onPress={emailEvent} />}
    </View>
  );
});

const InfoSection = React.memo(({ icon, title, children }: { icon: keyof typeof Ionicons.glyphMap, title: string, children: React.ReactNode }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={22} color={colors.primary} style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
});

const EventBody = React.memo(({ event }: { event: Event }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
      {event.location && (
        <InfoSection icon="location" title="Location">
          <Text style={styles.address}>{event.location}</Text>
        </InfoSection>
      )}

      {event.description && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About this event</Text>
          <Text style={styles.paragraph}>{event.description}</Text>
        </View>
      )}
    </ScrollView>
  );
});

const EventDetailsScreen: React.FC<Props> = ({ route }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const event = route.params?.event;
  const eventHandlers = useEventDetails(event);

  if (!event) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>Event not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EventHeader event={event} />
      <QuickActionsBar event={event} handlers={eventHandlers} />
      <EventBody event={event} />
    </View>
  );
};

const localStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  errorText: { color: colors.text, fontSize: 16 },
  header: { backgroundColor: colors.header, padding: 20, paddingTop: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 8, color: colors.headerText },
  row: { flexDirection: 'row', gap: 16, marginTop: 8 },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 14, color: colors.headerText },
  categoryPill: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  categoryText: { color: colors.headerText, fontSize: 12, fontWeight: '600' },
  content: { padding: 20, gap: 16 },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quickActionButton: { alignItems: 'center', padding: 8 },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: colors.primaryMuted,
  },
  quickActionText: { fontSize: 12, fontWeight: '500', color: colors.text },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, backgroundColor: colors.card, borderColor: colors.border },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: colors.text },
  section: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionIcon: { marginRight: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  address: { fontSize: 16, lineHeight: 24, color: colors.textSecondary },
  paragraph: { fontSize: 14, lineHeight: 20, color: colors.textSecondary },
});

export default EventDetailsScreen;