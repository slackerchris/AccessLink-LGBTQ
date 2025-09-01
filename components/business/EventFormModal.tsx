import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import { BusinessEvent, EventFormData, EventCategory } from '../../types/event';
import { normalizeTimestampToDate } from '../../utils/dateUtils';
import { Timestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

interface EventFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete: (event: BusinessEvent) => void;
  formData: Partial<EventFormData>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<EventFormData>>>;
  editingEvent: BusinessEvent | null;
  categories: Array<{ key: EventCategory; label: string; icon: string }>;
  accessibilityFeatureOptions: string[];
  toggleAccessibilityFeature: (feature: string) => void;
}

const EventFormModal: React.FC<EventFormModalProps> = ({
  isVisible,
  onClose,
  onSave,
  onDelete,
  formData,
  setFormData,
  editingEvent,
  categories,
  accessibilityFeatureOptions,
  toggleAccessibilityFeature,
}) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = React.useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: Timestamp.fromDate(selectedDate) }));
    }
  };
  
  const handleDeadlineChange = (event: any, selectedDate?: Date) => {
    setShowDeadlinePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData(prev => ({ ...prev, registrationDeadline: Timestamp.fromDate(selectedDate) }));
    }
  };

  const dateForPicker = formData.date ? normalizeTimestampToDate(formData.date) : new Date();
  const deadlineForPicker = formData.registrationDeadline ? normalizeTimestampToDate(formData.registrationDeadline) : new Date();


  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>
            {editingEvent ? 'Edit Event' : 'Create Event'}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Event Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Annual Pride Parade"
              value={formData.title}
              onChangeText={text => setFormData(prev => ({ ...prev, title: text }))}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your event"
              value={formData.description}
              onChangeText={text => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerText}>
                {formData.date ? normalizeTimestampToDate(formData.date)?.toLocaleDateString() : 'Select Date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dateForPicker || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
          
          <View style={styles.timeContainer}>
            <View style={styles.timeInput}>
              <Text style={styles.label}>Start Time</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={formData.startTime}
                onChangeText={text => setFormData(prev => ({ ...prev, startTime: text }))}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={styles.timeInput}>
              <Text style={styles.label}>End Time</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={formData.endTime}
                onChangeText={text => setFormData(prev => ({ ...prev, endTime: text }))}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 123 Main St, Anytown"
              value={formData.location}
              onChangeText={text => setFormData(prev => ({ ...prev, location: text }))}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.category}
                onValueChange={itemValue => setFormData(prev => ({ ...prev, category: itemValue as EventCategory }))}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {categories.map(cat => (
                  <Picker.Item key={cat.key} label={`${cat.icon} ${cat.label}`} value={cat.key} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Public Event</Text>
            <Switch
              value={!!formData.isPublic}
              onValueChange={value => setFormData(prev => ({ ...prev, isPublic: value }))}
              trackColor={{ false: colors.background, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Registration Required</Text>
            <Switch
              value={!!formData.registrationRequired}
              onValueChange={value => setFormData(prev => ({ ...prev, registrationRequired: value }))}
              trackColor={{ false: colors.background, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          {formData.registrationRequired && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Registration Link (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/register"
                  value={formData.registrationLink}
                  onChangeText={text => setFormData(prev => ({ ...prev, registrationLink: text }))}
                  keyboardType="url"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Registration Deadline (Optional)</Text>
                <TouchableOpacity onPress={() => setShowDeadlinePicker(true)} style={styles.datePickerButton}>
                  <Text style={styles.datePickerText}>
                    {formData.registrationDeadline ? normalizeTimestampToDate(formData.registrationDeadline)?.toLocaleDateString() : 'Select Deadline'}
                  </Text>
                </TouchableOpacity>
                {showDeadlinePicker && (
                  <DateTimePicker
                    value={deadlineForPicker || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDeadlineChange}
                  />
                )}
              </View>
            </>
          )}

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Is Accessible</Text>
            <Switch
              value={!!formData.isAccessible}
              onValueChange={value => setFormData(prev => ({ ...prev, isAccessible: value }))}
              trackColor={{ false: colors.background, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          {formData.isAccessible && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Accessibility Features</Text>
              <View style={styles.checkboxContainer}>
                {accessibilityFeatureOptions.map(feature => (
                  <TouchableOpacity
                    key={feature}
                    style={styles.checkboxItem}
                    onPress={() => toggleAccessibilityFeature(feature)}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.accessibilityFeatures?.includes(feature) && styles.checkboxSelected
                    ]} />
                    <Text style={styles.checkboxLabel}>{feature}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={onSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {editingEvent && (
            <View style={styles.deleteSection}>
              <TouchableOpacity style={styles.bigDeleteButton} onPress={() => onDelete(editingEvent)}>
                <Ionicons name="trash" size={24} color="#fff" />
                <Text style={styles.bigDeleteButtonText}>Delete Event</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const localStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    height: 50,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    justifyContent: 'center',
  },
  datePickerText: {
    color: colors.text,
    fontSize: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInput: {
    width: '48%',
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  picker: {
    color: colors.text,
  },
  pickerItem: {
    color: colors.text,
    backgroundColor: colors.background,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
  },
  checkboxContainer: {
    marginTop: 10,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.textSecondary,
  },
  buttonText: {
    color: colors.card,
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bigDeleteButton: {
    backgroundColor: colors.notification,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  bigDeleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.headerText,
  },
});

export default EventFormModal;
