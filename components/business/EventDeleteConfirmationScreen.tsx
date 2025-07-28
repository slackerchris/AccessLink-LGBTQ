/**
 * Event Delete Confirmation Screen
 * Secure deletion page that requires password confirmation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { businessService } from '../../services/mockBusinessService';

interface BusinessEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  isAccessible: boolean;
  accessibilityFeatures: string[];
  maxAttendees?: number;
  currentAttendees: number;
  isPublic: boolean;
  registrationRequired: boolean;
  registrationDeadline?: Date;
  ticketPrice?: number;
  contactEmail?: string;
  contactPhone?: string;
  imageUri?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface EventDeleteConfirmationScreenProps {
  visible: boolean;
  event: BusinessEvent | null;
  onClose: () => void;
  onConfirmDelete: () => void;
  businessId: string;
}

export const EventDeleteConfirmationScreen: React.FC<EventDeleteConfirmationScreenProps> = ({
  visible,
  event,
  onClose,
  onConfirmDelete,
  businessId
}) => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!visible || !event) return null;

  const handleDeleteConfirmation = async () => {
    // Validate password (in a real app, this would verify against actual auth)
    if (!password.trim()) {
      Alert.alert('Password Required', 'Please enter your password to confirm deletion.');
      return;
    }

    if (!confirmationChecked) {
      Alert.alert('Confirmation Required', 'Please confirm that you understand this action cannot be undone.');
      return;
    }

    // Simple password validation for demo (in production, use proper auth)
    if (password.length < 4) {
      Alert.alert('Invalid Password', 'Password is incorrect. Please try again.');
      return;
    }

    try {
      setIsDeleting(true);
      console.log(`🔄 Attempting to delete event ${event.id} for business ${businessId}`);
      
      await businessService.deleteBusinessEvent(businessId, event.id);
      
      console.log(`✅ Event ${event.id} deleted successfully`);
      
      // Reset form
      setPassword('');
      setConfirmationChecked(false);
      
      // Call parent callback
      onConfirmDelete();
      
      Alert.alert(
        '✅ Event Deleted', 
        `"${event.title}" has been permanently deleted.`,
        [{ text: 'OK', onPress: onClose }]
      );
      
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      Alert.alert(
        'Deletion Failed', 
        'Unable to delete the event. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            disabled={isDeleting}
          >
            <Ionicons name="close" size={28} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delete Event</Text>
        </View>

        {/* Warning Section */}
        <View style={styles.warningSection}>
          <Ionicons name="warning" size={48} color="#FF4444" />
          <Text style={styles.warningTitle}>Permanent Deletion</Text>
          <Text style={styles.warningText}>
            This action cannot be undone. Once deleted, the event and all associated data will be permanently removed.
          </Text>
        </View>

        {/* Event Details */}
        <View style={styles.eventDetails}>
          <Text style={styles.sectionTitle}>Event to be deleted:</Text>
          
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDate}>
              📅 {formatDate(event.date)}
            </Text>
            <Text style={styles.eventTime}>
              🕐 {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </Text>
            <Text style={styles.eventLocation}>
              📍 {event.location}
            </Text>
            {event.currentAttendees > 0 && (
              <Text style={styles.attendeesWarning}>
                ⚠️ {event.currentAttendees} people have registered for this event
              </Text>
            )}
          </View>
        </View>

        {/* Password Confirmation */}
        <View style={styles.passwordSection}>
          <Text style={styles.sectionTitle}>Confirm Your Identity</Text>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            editable={!isDeleting}
          />
        </View>

        {/* Confirmation Checkbox */}
        <View style={styles.checkboxSection}>
          <View style={styles.checkboxRow}>
            <Switch
              value={confirmationChecked}
              onValueChange={setConfirmationChecked}
              trackColor={{ false: '#ddd', true: '#FF4444' }}
              thumbColor={confirmationChecked ? '#fff' : '#f4f3f4'}
              disabled={isDeleting}
            />
            <Text style={styles.checkboxText}>
              I understand that once this event is deleted, it cannot be recovered. All attendee registrations will be lost.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={onClose}
            disabled={isDeleting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.deleteButton,
              (!password.trim() || !confirmationChecked || isDeleting) && styles.disabledButton
            ]}
            onPress={handleDeleteConfirmation}
            disabled={!password.trim() || !confirmationChecked || isDeleting}
          >
            {isDeleting ? (
              <Text style={styles.deleteButtonText}>Deleting...</Text>
            ) : (
              <>
                <Ionicons name="trash" size={20} color="#fff" />
                <Text style={styles.deleteButtonText}>Delete Event Permanently</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Warning */}
        <View style={styles.footerWarning}>
          <Text style={styles.footerWarningText}>
            This action is irreversible. Please double-check before proceeding.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 15,
    color: '#333',
  },
  warningSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#FFF5F5',
    marginTop: 10,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF4444',
    marginTop: 15,
    marginBottom: 10,
  },
  warningText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  eventDetails: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  eventCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  eventDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  attendeesWarning: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  passwordSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  checkboxSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    paddingTop: 3,
  },
  buttonSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  deleteButton: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.5,
  },
  footerWarning: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    alignItems: 'center',
  },
  footerWarningText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default EventDeleteConfirmationScreen;
