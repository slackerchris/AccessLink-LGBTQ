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
    paddingTop: 60, // Increased for iPhone status bar
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    // Add safe area handling
    minHeight: 100,
  },
  closeButton: {
    padding: 12, // Increased touch target
    minWidth: 44, // iOS minimum touch target
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22, // Slightly larger for mobile readability
    fontWeight: '600',
    marginLeft: 15,
    color: '#333',
    flex: 1, // Take available space
  },
  warningSection: {
    alignItems: 'center',
    paddingVertical: 40, // Increased padding for mobile
    paddingHorizontal: 24, // Better mobile margins
    backgroundColor: '#FFF5F5',
    marginTop: 10,
  },
  warningTitle: {
    fontSize: 28, // Larger for mobile impact
    fontWeight: '700',
    color: '#FF4444',
    marginTop: 15,
    marginBottom: 15,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 18, // Larger for mobile readability
    color: '#666',
    textAlign: 'center',
    lineHeight: 26, // Better line spacing
    paddingHorizontal: 10,
  },
  eventDetails: {
    padding: 24, // Better mobile padding
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20, // Larger for mobile
    fontWeight: '600',
    color: '#333',
    marginBottom: 18,
  },
  eventCard: {
    backgroundColor: '#f8f9fa',
    padding: 24, // Increased padding for mobile
    borderRadius: 16, // More rounded for modern mobile feel
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 22, // Larger for mobile
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    lineHeight: 28,
  },
  eventDate: {
    fontSize: 17, // Slightly larger
    color: '#666',
    marginBottom: 8,
    lineHeight: 24,
  },
  eventTime: {
    fontSize: 17, // Slightly larger
    color: '#666',
    marginBottom: 8,
    lineHeight: 24,
  },
  eventLocation: {
    fontSize: 17, // Slightly larger
    color: '#666',
    marginBottom: 12,
    lineHeight: 24,
  },
  attendeesWarning: {
    fontSize: 15, // Slightly larger for mobile
    color: '#FF6B35',
    fontWeight: '600',
    backgroundColor: '#FFF3E0',
    padding: 14, // Better mobile padding
    borderRadius: 10,
    marginTop: 12,
    lineHeight: 22,
  },
  passwordSection: {
    paddingHorizontal: 24, // Better mobile margins
    marginBottom: 24,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12, // More rounded for mobile
    padding: 18, // Larger touch target
    fontSize: 17, // Better mobile font size
    backgroundColor: '#fff',
    minHeight: 56, // Ensure good touch target
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkboxSection: {
    paddingHorizontal: 24, // Better mobile margins
    marginBottom: 40, // More space before buttons
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 18, // Larger gap for mobile
    paddingVertical: 8,
  },
  checkboxText: {
    flex: 1,
    fontSize: 16, // Larger for mobile readability
    color: '#666',
    lineHeight: 24, // Better line spacing
    paddingTop: 3,
  },
  buttonSection: {
    flexDirection: 'column', // Stack buttons vertically on mobile
    paddingHorizontal: 24,
    gap: 16, // Vertical gap between buttons
    marginBottom: 24,
    paddingBottom: 20, // Extra bottom padding for safe area
  },
  cancelButton: {
    paddingVertical: 18, // Larger touch target
    borderRadius: 12,
    borderWidth: 2, // Thicker border for better visibility
    borderColor: '#ddd',
    alignItems: 'center',
    minHeight: 56, // Ensure good touch target
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    fontSize: 17, // Larger for mobile
    fontWeight: '600',
    color: '#666',
  },
  deleteButton: {
    paddingVertical: 18, // Larger touch target
    borderRadius: 12,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    minHeight: 56, // Ensure good touch target
    shadowColor: '#FF4444',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  deleteButtonText: {
    fontSize: 17, // Larger for mobile
    fontWeight: '700',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.5,
  },
  footerWarning: {
    backgroundColor: '#f8f9fa',
    padding: 24, // Better mobile padding
    alignItems: 'center',
    paddingBottom: 40, // Extra padding for safe area
  },
  footerWarningText: {
    fontSize: 14, // Slightly larger for mobile
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});

export default EventDeleteConfirmationScreen;
