import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBusinessProfileEdit } from '../../hooks/useBusinessProfileEdit';
import PhotoUploadComponent from '../common/PhotoUploadComponent';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { BusinessListing } from '../../types/business';

// --- Memoized Sub-components ---

const Header: React.FC<{ isSaving: boolean; onSave: () => void }> = React.memo(({ isSaving, onSave }) => {
  const navigation = useNavigation();
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.headerText} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Edit Business Profile</Text>
      <TouchableOpacity onPress={onSave} disabled={isSaving} style={styles.saveButton}>
        {isSaving ? <ActivityIndicator size="small" color={colors.headerText} /> : <Text style={styles.saveButtonText}>Save</Text>}
      </TouchableOpacity>
    </View>
  );
});

const LoadingState: React.FC = React.memo(() => {
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.centeredContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading Business...</Text>
    </View>
  );
});

const ErrorState: React.FC = React.memo(() => {
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.centeredContainer}>
      <Ionicons name="alert-circle" size={48} color={colors.notification} />
      <Text style={styles.errorTitle}>No Business Found</Text>
      <Text style={styles.errorText}>No business profile is associated with your account.</Text>
    </View>
  );
});

const FormSection: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = React.memo(({ title, subtitle, children }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      {children}
    </View>
  );
});

const FormInput: React.FC<{ label: string; value: string; onChangeText: (text: string) => void; placeholder: string; multiline?: boolean; keyboardType?: any; autoCapitalize?: any }> = React.memo(({ label, ...props }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.textInput, props.multiline && styles.textArea]} {...props} />
    </View>
  );
});

const CategorySelector: React.FC<{ selectedCategory: string; onSelect: (category: string) => void }> = React.memo(({ selectedCategory, onSelect }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const categories = ['Restaurant', 'Cafe', 'Bar/Club', 'Retail', 'Healthcare', 'Fitness', 'Beauty & Spa', 'Professional Services', 'Education', 'Entertainment', 'Other'];
  return (
    <View style={styles.categoryContainer}>
      {categories.map(category => {
        const isSelected = selectedCategory === category;
        return (
          <TouchableOpacity key={category} style={[styles.categoryChip, isSelected && styles.selectedCategory]} onPress={() => onSelect(category)}>
            <Text style={[styles.categoryText, isSelected && styles.selectedCategoryText]}>{category}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const HoursEditor: React.FC<{ day: string; hours: any; onChange: (day: string, field: string, value: any) => void }> = React.memo(({ day, hours, onChange }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const dayHours = hours?.[day] || {};
  return (
    <View style={styles.hoursRow}>
      <Text style={styles.dayLabel}>{day}</Text>
      <TextInput
        style={styles.hoursInput}
        value={dayHours.closed ? 'Closed' : `${dayHours.open || ''} - ${dayHours.close || ''}`}
        onChangeText={text => {
          if (text.toLowerCase() !== 'closed') {
            const [open, close] = text.split(' - ');
            onChange(day, 'open', open || '');
            onChange(day, 'close', close || '');
          }
        }}
        placeholder="9:00 AM - 5:00 PM"
        editable={!dayHours.closed}
      />
      <Switch value={dayHours.closed || false} onValueChange={value => onChange(day, 'closed', value)} />
    </View>
  );
});

const AccessibilitySwitch: React.FC<{ label: string; icon: any; value: boolean; onValueChange: (value: boolean) => void }> = React.memo(({ label, icon, value, onValueChange }) => {
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchLabel}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={styles.switchText}>{label}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={value ? colors.primary : colors.surface} />
    </View>
  );
});

// --- Main Component ---

export const BusinessProfileEditScreen: React.FC = () => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const {
    userBusiness,
    loading,
    isSaving,
    formData,
    handleSave,
    handleFormChange,
    handleNestedChange,
    handleHoursChange,
    onPhotoUploaded,
    onPhotoRemoved,
  } = useBusinessProfileEdit();

  if (loading) return <LoadingState />;
  if (!userBusiness) return <ErrorState />;

  return (
    <View style={{ flex: 1 }}>
      <Header isSaving={isSaving} onSave={handleSave} />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <FormSection title="Business Photo">
            <PhotoUploadComponent
              uploadType="business-profile"
              businessId={userBusiness?.id}
              currentPhotoURL={formData.profilePhoto}
              onPhotoUploaded={onPhotoUploaded}
              onPhotoRemoved={onPhotoRemoved}
              disabled={isSaving}
              style={{ marginVertical: 16 }}
            />
          </FormSection>

          <FormSection title="Basic Information">
            <FormInput label="Business Name *" value={formData.name} onChangeText={text => handleFormChange('name', text)} placeholder="Enter business name" />
            <FormInput label="Description *" value={formData.description} onChangeText={text => handleFormChange('description', text)} placeholder="Describe your business..." multiline />
            <CategorySelector selectedCategory={formData.category} onSelect={category => handleFormChange('category', category)} />
          </FormSection>

          <FormSection title="Contact Information">
            <FormInput label="Phone Number" value={formData.contact?.phone} onChangeText={text => handleNestedChange('contact', 'phone', text)} placeholder="(555) 123-4567" keyboardType="phone-pad" />
            <FormInput label="Email Address" value={formData.contact?.email} onChangeText={text => handleNestedChange('contact', 'email', text)} placeholder="contact@business.com" keyboardType="email-address" autoCapitalize="none" />
            <FormInput label="Website" value={formData.contact?.website} onChangeText={text => handleNestedChange('contact', 'website', text)} placeholder="https://www.business.com" keyboardType="url" autoCapitalize="none" />
          </FormSection>

          <FormSection title="Location">
            <FormInput label="Street Address *" value={formData.location?.address} onChangeText={text => handleNestedChange('location', 'address', text)} placeholder="123 Main Street" />
            <View style={styles.row}>
              <View style={{ flex: 2 }}>
                <FormInput label="City *" value={formData.location?.city} onChangeText={text => handleNestedChange('location', 'city', text)} placeholder="City" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <FormInput label="State *" value={formData.location?.state} onChangeText={text => handleNestedChange('location', 'state', text)} placeholder="State" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <FormInput label="ZIP Code *" value={formData.location?.zipCode} onChangeText={text => handleNestedChange('location', 'zipCode', text)} placeholder="12345" keyboardType="numeric" />
              </View>
            </View>
          </FormSection>

          <FormSection title="Operating Hours">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
              <HoursEditor key={day} day={day} hours={formData.hours} onChange={handleHoursChange} />
            ))}
          </FormSection>

          <FormSection title="Accessibility Features" subtitle="Select all accessibility features available at your business">
            <AccessibilitySwitch label="Wheelchair Accessible" icon="accessibility" value={!!formData.accessibility?.wheelchairAccessible} onValueChange={value => handleNestedChange('accessibility', 'wheelchairAccessible', value)} />
            <AccessibilitySwitch label="Braille Menus" icon="book" value={!!formData.accessibility?.brailleMenus} onValueChange={value => handleNestedChange('accessibility', 'brailleMenus', value)} />
            <AccessibilitySwitch label="Sign Language Support" icon="hand-left" value={!!formData.accessibility?.signLanguageSupport} onValueChange={value => handleNestedChange('accessibility', 'signLanguageSupport', value)} />
            <AccessibilitySwitch label="Quiet Spaces Available" icon="volume-mute" value={!!formData.accessibility?.quietSpaces} onValueChange={value => handleNestedChange('accessibility', 'quietSpaces', value)} />
            <FormInput label="Additional Notes" value={formData.accessibility?.accessibilityNotes} onChangeText={text => handleNestedChange('accessibility', 'accessibilityNotes', text)} placeholder="e.g., Ramps available at the north entrance" multiline />
          </FormSection>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </View>
  );
};

const localStyles = (colors: any, shadows: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: colors.headerText,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  saveButton: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.headerText,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    ...shadows.small,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectedCategoryText: {
    color: colors.headerText,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  hoursInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
    marginRight: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.notification,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomPadding: {
    height: 40,
  },
});
