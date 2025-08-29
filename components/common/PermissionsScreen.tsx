import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Calendar from 'expo-calendar';

type Props = { onDone: () => void };

const PermissionsScreen: React.FC<Props> = ({ onDone }) => {
  const [requesting, setRequesting] = useState(false);

  const requestAll = useCallback(async () => {
    if (requesting) return;
    setRequesting(true);
    try {
      if (Platform.OS !== 'web') {
        // Location (foreground)
        try {
          await Location.requestForegroundPermissionsAsync();
        } catch {}

        // Calendar
        try {
          await Calendar.requestCalendarPermissionsAsync();
        } catch {}
      }
    } finally {
      setRequesting(false);
      onDone();
    }
  }, [onDone, requesting]);

  return (
    <View style={styles.container}>
      <Ionicons name="shield-checkmark" size={64} color="#6366f1" />
      <Text style={styles.title}>Enable app permissions</Text>
      <Text style={styles.subtitle}>
        We use a few permissions to power key features:
        {'\n'}- Location for nearby businesses and directions
        {'\n'}- Calendar to save events you choose
      </Text>
      <TouchableOpacity style={[styles.button, requesting && { opacity: 0.6 }]} disabled={requesting} onPress={requestAll}>
        <Ionicons name="checkmark-circle" size={22} color="#fff" />
        <Text style={styles.buttonText}>{requesting ? 'Requesting…' : 'Enable & continue'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkBtn} onPress={onDone}>
        <Text style={styles.linkText}>Not now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginTop: 16, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#4b5563', marginTop: 8, textAlign: 'center', lineHeight: 20 },
  button: { marginTop: 24, backgroundColor: '#6366f1', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 10, flexDirection: 'row', gap: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkBtn: { marginTop: 12, padding: 8 },
  linkText: { color: '#6366f1', fontWeight: '600' },
});

export default PermissionsScreen;
