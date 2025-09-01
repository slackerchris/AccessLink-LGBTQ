import { useCallback } from 'react';
import { Linking, Alert, Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import { useAuth } from './useFirebaseAuth';
import { Event } from '../types/events';

export const useEventDetails = (event?: Event) => {
  const { user } = useAuth();
  const isOwner = !!(user && event?.ownerId && user.uid === event.ownerId);

  const openInMaps = useCallback(async () => {
    if (!event?.location) return;
    const query = encodeURIComponent(event.location);
    const androidGeo = `geo:0,0?q=${query}`;
    const iosMaps = `maps://?q=${query}`;
    const webGmaps = `https://www.google.com/maps/search/?api=1&query=${query}`;

    try {
      const mapUrl = Platform.select({ android: androidGeo, ios: iosMaps, default: webGmaps }) || webGmaps;
      const canOpen = await Linking.canOpenURL(mapUrl);
      await Linking.openURL(canOpen ? mapUrl : webGmaps);
    } catch (e) {
      Alert.alert('Unable to open maps', 'Please open your maps app and search for the location.');
    }
  }, [event?.location]);

  const emailEvent = useCallback(async () => {
    if (!event) return;
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
      const canOpen = await Linking.canOpenURL(mailto);
      await Linking.openURL(canOpen ? mailto : `mailto:`);
    } catch (e) {
      Alert.alert('No email app found', 'Copy and paste the details into your preferred email app.');
    }
  }, [event]);

  const handleCall = useCallback(() => {
    const phone = event?.contact?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  }, [event?.contact?.phone]);

  const handleWebsite = useCallback(() => {
    const site = event?.contact?.website;
    if (site) {
      const websiteUrl = site.startsWith('http') ? site : `https://${site}`;
      Linking.openURL(websiteUrl);
    }
  }, [event?.contact?.website]);

  const parseDateTime = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return null;
    const s = dateStr.trim();
    let year: number | null = null, monthIndex: number | null = null, day: number | null = null;

    const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (iso) {
      [year, monthIndex, day] = [parseInt(iso[1], 10), parseInt(iso[2], 10) - 1, parseInt(iso[3], 10)];
    } else {
      const mdY = s.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
      if (mdY) {
        const monthName = mdY[1].toLowerCase().slice(0, 3);
        const map: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
        if (monthName in map) {
          [monthIndex, day, year] = [map[monthName], parseInt(mdY[2], 10), parseInt(mdY[3], 10)];
        }
      }
    }

    if (year === null || monthIndex === null || day === null) return null;
    const base = new Date(year, monthIndex, day);

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
      base.setHours(9, 0, 0, 0);
    }

    const end = new Date(base.getTime() + 60 * 60 * 1000);
    return { start: base, end };
  };

  const ensureCalendarAsync = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Calendar access is required to save events.');
      return null;
    }
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const writable = calendars.find((c) => c.allowsModifications);
    if (writable) return writable.id;

    let defaultSource: Calendar.Source | null = null;
    if (Platform.OS === 'ios') {
      const defaultCal = await Calendar.getDefaultCalendarAsync();
      defaultSource = defaultCal?.source ?? null;
    } else {
      defaultSource = calendars.find((c) => c.source?.isLocalAccount)?.source || calendars[0]?.source || null;
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
      return calendars[0]?.id || null;
    }
  };

  const addToCalendar = useCallback(async () => {
    if (!event) return;
    const parsed = parseDateTime(event?.date, event?.time);
    if (!parsed) {
      Alert.alert('Missing date', 'This event is missing a valid date.');
      return;
    }
    const calendarId = await ensureCalendarAsync();
    if (!calendarId) return;
    try {
      await Calendar.createEventAsync(calendarId, {
        title: event.title,
        startDate: parsed.start,
        endDate: parsed.end,
        location: event.location,
        notes: event.description,
        alarms: [{ relativeOffset: -30 }],
      });
      Alert.alert('Saved to calendar', 'Event added. Check your device calendar.');
    } catch (e) {
      Alert.alert('Could not add', 'There was a problem saving the event.');
    }
  }, [event]);

  return {
    isOwner,
    openInMaps,
    emailEvent,
    handleCall,
    handleWebsite,
    addToCalendar,
  };
};
