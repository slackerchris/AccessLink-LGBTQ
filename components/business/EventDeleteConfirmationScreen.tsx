/**
 * Event Delete Confirmation Screen
 * Secure deletion page that requires password confirmation
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TextInput, Alert } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { BusinessEvent } from '../../types/event';
import { formatTimestamp } from '../../utils/dateUtils';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface EventDeleteConfirmationScreenProps {
  visible: boolean;
  event: BusinessEvent | null;
  onClose: () => void;
  onConfirmDelete: (eventId: string) => void;
}

// --- Memoized Sub-components ---

const EventDetailsCard: React.FC<{ event: BusinessEvent }> = React.memo(({ event }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);

  const formatTime = (time: string) => new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <View style={styles.eventDetails}>
      <Text style={styles.sectionTitle}>Event to be deleted:</Text>
      <View style={styles.eventCard}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDate}>📅 {formatTimestamp(event.date)}</Text>
        <Text style={styles.eventTime}>🕐 {formatTime(event.startTime)} - {formatTime(event.endTime)}</Text>
        <Text style={styles.eventLocation}>📍 {event.location}</Text>
        {event.currentAttendees > 0 && (
          <Text style={styles.attendeesWarning}>
            ⚠️ {event.currentAttendees} people have registered for this event
          </Text>
        )}
      </View>
    </View>
  );
});

const PasswordInput: React.FC<{ value: string; onChange: (text: string) => void; disabled: boolean }> = React.memo(({ value, onChange, disabled }) => {
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.inputSection}>
      <Text style={styles.sectionTitle}>Confirm Your Identity</Text>
      <TextInput
        style={styles.passwordInput}
        placeholder="Enter your password"
        secureTextEntry
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        editable={!disabled}
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  );
});

const ConfirmationCheck: React.FC<{ checked: boolean; onToggle: (value: boolean) => void; disabled: boolean }> = React.memo(({ checked, onToggle, disabled }) => {
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.checkboxSection}>
      <View style={styles.checkboxRow}>
        <Switch
          value={checked}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={checked ? colors.primary : colors.surface}
          disabled={disabled}
        />
        <Text style={styles.checkboxText}>
          I understand that this action is irreversible and all attendee data will be lost.
        </Text>
      </View>
    </View>
  );
});

// --- Main Component ---

export const EventDeleteConfirmationScreen: React.FC<EventDeleteConfirmationScreenProps> = ({
  visible,
  event,
  onClose,
  onConfirmDelete,
}) => {
  const [password, setPassword] = useState('');
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!visible || !event) return null;

  const handleConfirm = async () => {
    if (password.length < 4) {
      Alert.alert('Invalid Password', 'Password is incorrect. Please try again.');
      return;
    }

    setIsDeleting(true);
    try {
      console.log(`🔄 Attempting to delete event ${event.id}`);
      await onConfirmDelete(event.id);
      Alert.alert('✅ Event Deleted', `"${event.title}" has been permanently deleted.`, [{ text: 'OK', onPress: onClose }]);
    } catch (error: any) {
      console.error('❌ Error deleting event:', error);
      Alert.alert('Deletion Failed', error.message || 'Unable to delete the event.', [{ text: 'OK' }]);
    } finally {
      setIsDeleting(false);
      setPassword('');
      setConfirmationChecked(false);
    }
  };

  return (
    <ConfirmationModal
      title="Delete Event"
      warningText="This action cannot be undone. The event and all associated data will be permanently removed."
      onCancel={onClose}
      onConfirm={handleConfirm}
      isConfirming={isDeleting}
      confirmDisabled={!password.trim() || !confirmationChecked}
    >
      <ScrollView>
        <EventDetailsCard event={event} />
        <PasswordInput value={password} onChange={setPassword} disabled={isDeleting} />
        <ConfirmationCheck checked={confirmationChecked} onToggle={setConfirmationChecked} disabled={isDeleting} />
      </ScrollView>
    </ConfirmationModal>
  );
};

const localStyles = (colors: any) => StyleSheet.create({
  eventDetails: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 18,
  },
  eventCard: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  eventDate: {
    fontSize: 17,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 17,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  eventLocation: {
    fontSize: 17,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  attendeesWarning: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
    backgroundColor: colors.primaryMuted,
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    textAlign: 'center',
  },
  inputSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 18,
    fontSize: 17,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  checkboxSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 18,
  },
  checkboxText: {
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
});

export default EventDeleteConfirmationScreen;
