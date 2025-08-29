import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Platform, ScrollView } from 'react-native';
import * as Calendar from 'expo-calendar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useFirebaseAuth';

type EventItem = {
  id: number | string;
  title: string;
  date: string;
  time: string;
  location?: string; // human-readable (address, venue)
  category?: string;
  color?: string;
  ownerId?: string; // uid of owner
  description?: string;
  contact?: {
    phone?: string;
    website?: string;
    email?: string;
  };
};

interface Props {
  navigation: any;
  route: { params: { event: EventItem } };
}

const EventDetailsScreen: React.FC<Props> = ({ route }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const event = route.params?.event;

  const isOwner = !!(user && event?.ownerId && user.uid === event.ownerId);

  const openInMaps = async () => {
    if (!event?.location) return;
    const query = encodeURIComponent(event.location);
    // Prefer geo: on Android, maps: on iOS; always fall back to Google Maps URL
    const androidGeo = `geo:0,0?q=${query}`;
    const iosMaps = `maps://?q=${query}`;
    const webGmaps = `https://www.google.com/maps/search/?api=1&query=${query}`;

    try {
      const url = Platform.select({ android: androidGeo, ios: iosMaps, default: webGmaps }) || webGmaps;
      const can = await Linking.canOpenURL(url);
      await Linking.openURL(can ? url : webGmaps);
    } catch (e) {
      Alert.alert('Unable to open maps', 'Please open your maps app and search for the location.');
    }
  };

  const emailEvent = async () => {
    // Allow owner to compose an email with event details
    const subject = encodeURIComponent(`Event: ${event.title}`);
    const body = encodeURIComponent(
      [
        `Title: ${event.title}`,
        event.date ? `Date: ${event.date}` : undefined,
        event.time ? `Time: ${event.time}` : undefined,
        event.location ? `Location: ${event.location}` : undefined,
        event.description ? `\n${event.description}` : undefined,
      ]
        .filter(Boolean)
        .join('\n')
    );
    const mailto = `mailto:?subject=${subject}&body=${body}`;
    try {
      const can = await Linking.canOpenURL(mailto);
      await Linking.openURL(can ? mailto : `mailto:`);
    } catch (e) {
      Alert.alert('No email app found', 'Copy and paste the details into your preferred email app.');
    }
  };

  const handleCall = () => {
    const phone = event?.contact?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleWebsite = () => {
    const site = event?.contact?.website;
    if (site) {
      const url = site.startsWith('http') ? site : `https://${site}`;
      Linking.openURL(url);
    }
  };

  const parseDateTime = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return null;

    // Normalize and attempt specific formats to avoid Date(string) inconsistencies on Hermes
    const s = dateStr.trim();
    let year: number | null = null;
    let monthIndex: number | null = null; // 0-11
    let day: number | null = null;

    // Format 1: YYYY-MM-DD
    const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (iso) {
      year = parseInt(iso[1], 10);
      monthIndex = parseInt(iso[2], 10) - 1;
      day = parseInt(iso[3], 10);
    }

    // Format 2: Month D, YYYY (accept full or 3-letter month)
    if (year === null) {
      const mdY = s.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
      if (mdY) {
        const monthName = mdY[1].toLowerCase().slice(0, 3);
        const map: Record<string, number> = {
          jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
          jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
        };
        if (monthName in map) {
          monthIndex = map[monthName];
          day = parseInt(mdY[2], 10);
          year = parseInt(mdY[3], 10);
        }
      }
    }

    if (year === null || monthIndex === null || day === null) return null;

    const base = new Date(year, monthIndex, day);

    // Time parsing: supports "6", "6:30", "6 PM", "6:30 pm"
    if (timeStr) {
      const t = timeStr.trim();
      const match = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = match[2] ? parseInt(match[2], 10) : 0;
        const ampm = match[3]?.toUpperCase();
        if (ampm) {
          if (ampm === 'PM' && h < 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
        }
        base.setHours(h, m, 0, 0);
      }
    } else {
      // default to 9 AM if time missing
      base.setHours(9, 0, 0, 0);
    }

    const end = new Date(base.getTime() + 60 * 60 * 1000); // 1-hour default duration
    return { start: base, end };
  };

  const ensureCalendarAsync = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Calendar access is required to save events.');
      return null;
    }
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    // Prefer a writable local calendar
    const writable = calendars.find((c) => c.allowsModifications);
    if (writable) return writable.id;
    // Create a new calendar if none writable
    let defaultSource: any = null;
    if (Platform.OS === 'ios') {
      const defaultCal = await Calendar.getDefaultCalendarAsync();
      defaultSource = defaultCal?.source;
    } else {
      defaultSource = calendars.find((c) => c.source?.isLocalAccount)?.source || calendars[0]?.source;
    }
    try {
      const id = await Calendar.createCalendarAsync({
        title: 'AccessLink Events',
        color: '#6c5ce7',
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultSource?.id,
        source: defaultSource || undefined,
        name: 'AccessLink',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
        ownerAccount: 'personal',
      });
      return id;
    } catch (e) {
      // Fallback to first calendar when creation fails
      return calendars[0]?.id || null;
    }
  };

  const addToCalendar = async () => {
    const parsed = parseDateTime(event?.date, event?.time);
    if (!parsed) {
      Alert.alert('Missing date', 'This event is missing a valid date.');
      return;
    }
    const calendarId = await ensureCalendarAsync();
    if (!calendarId) return;
    try {
      const details: any = {
        title: event.title,
        startDate: parsed.start,
        endDate: parsed.end,
        location: event.location,
        notes: event.description,
        alarms: [{ relativeOffset: -30 }], // 30 min before
      };
      const createdId = await Calendar.createEventAsync(calendarId, details);
      Alert.alert('Saved to calendar', 'Event added. Check your device calendar.');
      // Optionally open the created event (Android supports opening by ID via URL is not standard; skipping)
    } catch (e) {
      Alert.alert('Could not add', 'There was a problem saving the event.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
      <View style={[styles.header, { backgroundColor: colors.header }] }>
        {event.category ? (
          <View style={[styles.categoryPill, { backgroundColor: event.color || colors.primary }]}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        ) : null}
        <Text style={[styles.title, { color: colors.headerText }]}>{event.title}</Text>
        {(event.date || event.time) && (
          <View style={styles.row}>
            {event.date ? (
              <View style={styles.detail}>
                <Ionicons name="calendar-outline" size={18} color={colors.headerText} />
                <Text style={[styles.detailText, { color: colors.headerText }]}>{event.date}</Text>
              </View>
            ) : null}
            {event.time ? (
              <View style={styles.detail}>
                <Ionicons name="time-outline" size={18} color={colors.headerText} />
                <Text style={[styles.detailText, { color: colors.headerText }]}>{event.time}</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>

      {/* Quick Actions (mirror Business Details pattern) */}
  {(event.location || isOwner || event?.contact?.phone || event?.contact?.website) && (
        <View style={[styles.quickActions, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {event?.contact?.phone ? (
            <TouchableOpacity style={styles.quickActionButton} onPress={handleCall}>
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="call" size={22} color={colors.primary} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Call</Text>
            </TouchableOpacity>
          ) : null}

          {event.location ? (
            <TouchableOpacity style={styles.quickActionButton} onPress={openInMaps}>
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="navigate" size={22} color={colors.primary} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Directions</Text>
            </TouchableOpacity>
          ) : null}

          {event?.contact?.website ? (
            <TouchableOpacity style={styles.quickActionButton} onPress={handleWebsite}>
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="globe" size={22} color={colors.primary} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Website</Text>
            </TouchableOpacity>
          ) : null}

          {/* Add to Calendar */}
          {(event?.date && Platform.OS !== 'web') ? (
            <TouchableOpacity style={styles.quickActionButton} onPress={addToCalendar}>
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="calendar" size={22} color={colors.primary} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Add</Text>
            </TouchableOpacity>
          ) : null}

          {isOwner ? (
            <TouchableOpacity style={styles.quickActionButton} onPress={emailEvent}>
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="mail" size={22} color={colors.primary} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Email</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        {/* Location section */}
        {event.location ? (
          <View style={[styles.section, { borderBottomColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={22} color={colors.primary} style={styles.sectionIcon} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
            </View>
            <Text style={[styles.address, { color: colors.textSecondary }]}>{event.location}</Text>
          </View>
        ) : null}

        {/* About section */}
        {event.description ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>About this event</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>{event.description}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  row: { flexDirection: 'row', gap: 16, marginTop: 8 },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 14 },
  categoryPill: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  categoryText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  content: { padding: 20, gap: 16 },
  // Quick actions (like Business Details)
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'white',
    shadowColor: '#000',
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
  },
  quickActionText: { fontSize: 12, fontWeight: '500' },

  // Cards and sections
  card: { padding: 16, borderRadius: 12, borderWidth: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  section: { paddingVertical: 16, borderBottomWidth: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionIcon: { marginRight: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  address: { fontSize: 16, lineHeight: 24 },
  paragraph: { fontSize: 14, lineHeight: 20 },
  // removed primary button in favor of quick actions
});

export default EventDetailsScreen;
