import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BusinessCategory } from '../../services/businessService';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useTheme } from '../../hooks/useTheme';
import { useAddBusiness } from '../../hooks/useAddBusiness';

// Navigation Prop
type AddBusinessScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddBusiness'>;

interface AddBusinessScreenProps {
  navigation: AddBusinessScreenNavigationProp;
}

// Memoized Sub-components
const Header: React.FC<{ onBack: () => void }> = React.memo(({ onBack }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={colors.headerText} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Add New Business</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
});

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = React.memo(({ title, children }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
});

const FormInput: React.FC<{
  label: string;
  value: string | undefined;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'url';
  maxLength?: number;
}> = React.memo(({ label, ...props }) => {
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, props.multiline && styles.textArea]}
        placeholderTextColor={colors.textSecondary}
        {...props}
      />
    </View>
  );
});

const CategorySelector: React.FC<{
  selectedCategory: BusinessCategory;
  onSelectCategory: (category: BusinessCategory) => void;
}> = React.memo(({ selectedCategory, onSelectCategory }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const categories: { value: BusinessCategory; label: string }[] = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'beauty', label: 'Beauty & Wellness' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'retail', label: 'Retail' },
    { value: 'professional_services', label: 'Professional Services' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'education', label: 'Education' },
    { value: 'nonprofit', label: 'Non-Profit' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <View style={styles.categoryContainer}>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.value}
          style={[styles.categoryButton, selectedCategory === cat.value && styles.categoryButtonActive]}
          onPress={() => onSelectCategory(cat.value)}
        >
          <Text style={[styles.categoryButtonText, selectedCategory === cat.value && styles.categoryButtonTextActive]}>
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const FormSwitch: React.FC<{
  label: string;
  value: boolean | undefined;
  onValueChange: (value: boolean) => void;
}> = React.memo(({ label, value, onValueChange }) => {
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={"#ffffff"}
      />
    </View>
  );
});

const SubmitButton: React.FC<{ loading: boolean; onPress: () => void }> = React.memo(({ loading, onPress }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <TouchableOpacity
      style={[styles.submitButton, loading && styles.submitButtonDisabled]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? <ActivityIndicator color={colors.headerText} /> : <Text style={styles.submitButtonText}>Create Business</Text>}
    </TouchableOpacity>
  );
});

// Main Component
export default function AddBusinessScreen({ navigation }: AddBusinessScreenProps) {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const { formData, businessLoading, handleInputChange, handleNestedInputChange, handleSubmit } = useAddBusiness(() =>
    navigation.goBack()
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header onBack={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <FormSection title="Basic Information">
          <FormInput
            label="Business Name *"
            value={formData.name}
            onChangeText={(val) => handleInputChange('name', val)}
            placeholder="Enter business name"
          />
          <FormInput
            label="Description *"
            value={formData.description}
            onChangeText={(val) => handleInputChange('description', val)}
            placeholder="Describe your business and its services"
            multiline
          />
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <CategorySelector
              selectedCategory={formData.category}
              onSelectCategory={(val) => handleInputChange('category', val)}
            />
          </View>
        </FormSection>

        <FormSection title="Location">
          <FormInput
            label="Address *"
            value={formData.location?.address}
            onChangeText={(val) => handleNestedInputChange('location', 'address', val)}
            placeholder="Street address"
          />
          <View style={styles.row}>
            <View style={styles.flex1}>
              <FormInput
                label="City *"
                value={formData.location?.city}
                onChangeText={(val) => handleNestedInputChange('location', 'city', val)}
                placeholder="City"
              />
            </View>
            <View style={[styles.flex1, styles.marginLeft]}>
              <FormInput
                label="State *"
                value={formData.location?.state}
                onChangeText={(val) => handleNestedInputChange('location', 'state', val)}
                placeholder="ST"
                maxLength={2}
              />
            </View>
          </View>
          <FormInput
            label="ZIP Code *"
            value={formData.location?.zipCode}
            onChangeText={(val) => handleNestedInputChange('location', 'zipCode', val)}
            placeholder="ZIP Code"
            keyboardType="numeric"
            maxLength={10}
          />
        </FormSection>

        <FormSection title="Contact Information">
          <FormInput
            label="Phone"
            value={formData.contact?.phone}
            onChangeText={(val) => handleNestedInputChange('contact', 'phone', val)}
            placeholder="(555) 123-4567"
            keyboardType="phone-pad"
          />
          <FormInput
            label="Email"
            value={formData.contact?.email}
            onChangeText={(val) => handleNestedInputChange('contact', 'email', val)}
            placeholder="contact@business.com"
            keyboardType="email-address"
          />
          <FormInput
            label="Website"
            value={formData.contact?.website}
            onChangeText={(val) => handleNestedInputChange('contact', 'website', val)}
            placeholder="https://your-business.com"
            keyboardType="url"
          />
        </FormSection>

        <FormSection title="Inclusivity & Accessibility">
          <FormSwitch
            label="LGBTQ+ Verified"
            value={formData.lgbtqFriendly?.verified}
            onValueChange={(val) => handleNestedInputChange('lgbtqFriendly', 'verified', val)}
          />
          <FormSwitch
            label="Wheelchair Accessible"
            value={formData.accessibility?.wheelchairAccessible}
            onValueChange={(val) => handleNestedInputChange('accessibility', 'wheelchairAccessible', val)}
          />
          <FormSwitch
            label="Braille Menus"
            value={formData.accessibility?.brailleMenus}
            onValueChange={(val) => handleNestedInputChange('accessibility', 'brailleMenus', val)}
          />
          <FormSwitch
            label="Sign Language Support"
            value={formData.accessibility?.signLanguageSupport}
            onValueChange={(val) => handleNestedInputChange('accessibility', 'signLanguageSupport', val)}
          />
          <FormSwitch
            label="Quiet Spaces Available"
            value={formData.accessibility?.quietSpaces}
            onValueChange={(val) => handleNestedInputChange('accessibility', 'quietSpaces', val)}
          />
          <FormInput
            label="Accessibility Notes"
            value={formData.accessibility?.accessibilityNotes}
            onChangeText={(val) => handleNestedInputChange('accessibility', 'accessibilityNotes', val)}
            placeholder="e.g., Ramp available at side entrance"
            multiline
          />
        </FormSection>

        <SubmitButton loading={businessLoading} onPress={handleSubmit} />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = (colors: any, shadows: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.header,
      paddingHorizontal: 20,
      paddingVertical: 15,
      paddingTop: 45, // Adjust as needed for status bar
    },
    backButton: {
      padding: 5,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.headerText,
    },
    headerSpacer: {
      width: 34, // Match back button size
    },
    content: {
      flex: 1,
    },
    section: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 12,
      padding: 20,
      ...shadows.card,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    row: {
      flexDirection: 'row',
    },
    flex1: {
      flex: 1,
    },
    marginLeft: {
      marginLeft: 12,
    },
    categoryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    categoryButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryButtonText: {
      fontSize: 14,
      color: colors.text,
    },
    categoryButtonTextActive: {
      color: colors.headerText,
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingVertical: 4,
    },
    switchLabel: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    submitButton: {
      backgroundColor: colors.primary,
      marginHorizontal: 16,
      marginTop: 24,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      ...shadows.button,
    },
    submitButtonDisabled: {
      backgroundColor: colors.textSecondary,
    },
    submitButtonText: {
      color: colors.headerText,
      fontSize: 18,
      fontWeight: '600',
    },
    bottomSpacer: {
      height: 32,
    },
  });
