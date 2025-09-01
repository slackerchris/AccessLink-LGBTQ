import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import { useAccessibilityPreferences } from '../../hooks/useAccessibilityPreferences';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

interface AccessibilityPreference {
  key: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

type AccessibilityPreferencesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AccessibilityPreferences'>;

interface AccessibilityPreferencesScreenProps {
  navigation: AccessibilityPreferencesScreenNavigationProp;
}

const accessibilityOptions: AccessibilityPreference[] = [
    { key: 'wheelchairAccess', title: 'Wheelchair Accessible', description: 'Prioritize businesses with wheelchair accessibility', icon: 'accessibility' },
    { key: 'aslInterpretation', title: 'ASL Interpretation', description: 'Find businesses offering sign language interpretation', icon: 'hand-left' },
    { key: 'brailleMenus', title: 'Braille Menus', description: 'Show businesses that offer braille menus', icon: 'document-text' },
    { key: 'largePrint', title: 'Large Print', description: 'Places with large print materials available', icon: 'text' },
    { key: 'audioAssistance', title: 'Audio Assistance', description: 'Businesses with audio assistance options', icon: 'volume-high' },
    { key: 'serviceAnimalFriendly', title: 'Service Animal Friendly', description: 'Places that welcome service animals', icon: 'paw' },
    { key: 'quietSpaces', title: 'Quiet Spaces', description: 'Businesses with quiet areas or accommodations', icon: 'volume-mute' },
    { key: 'genderNeutralRestrooms', title: 'Gender Neutral Restrooms', description: 'Places with inclusive restroom facilities', icon: 'transgender' },
    { key: 'sensoryAccommodations', title: 'Sensory Accommodations', description: 'Businesses with sensory-friendly environments', icon: 'flower' }
];

const ScreenHeader = React.memo(({ navigation }: { navigation: AccessibilityPreferencesScreenNavigationProp }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Accessibility</Text>
        <Text style={styles.headerSubtitle}>
          Customize your needs to find businesses that work for you.
        </Text>
      </View>
    </View>
  );
});

const InfoCard = React.memo(() => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.infoCard}>
      <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
      <Text style={styles.infoText}>
        Your preferences are private and only used to improve your search results.
      </Text>
    </View>
  );
});

const PreferenceItem = React.memo(({ item, value, onToggle }: { item: AccessibilityPreference, value: boolean, onToggle: () => void }) => {
  const { colors, isDarkMode, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceIcon}>
        <Ionicons name={item.icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.preferenceContent}>
        <Text style={styles.preferenceTitle}>{item.title}</Text>
        <Text style={styles.preferenceDescription}>{item.description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={isDarkMode ? colors.card : '#ffffff'}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
});

const FooterButtons = React.memo(({ onReset, onSave, hasChanges, saving }: { onReset: () => void, onSave: () => void, hasChanges: boolean, saving: boolean }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.resetButton}
        onPress={onReset}
        disabled={saving}
      >
        <Text style={styles.resetButtonText}>Reset All</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.saveButton,
          (!hasChanges || saving) && styles.saveButtonDisabled
        ]}
        onPress={onSave}
        disabled={!hasChanges || saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color={colors.headerText} />
        ) : (
          <Text style={styles.saveButtonText}>
            Save Preferences
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
});

export default function AccessibilityPreferencesScreen({ navigation }: AccessibilityPreferencesScreenProps) {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const {
    preferences,
    saving,
    hasChanges,
    highVisibility,
    toggleHighVisibility,
    handleTogglePreference,
    handleSave,
    handleReset,
  } = useAccessibilityPreferences(navigation);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader navigation={navigation} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <InfoCard />

        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>Display Settings</Text>
          <PreferenceItem 
            item={{ 
              key: 'highVisibility', 
              title: 'High Visibility Mode', 
              description: 'Enhanced contrast and larger text for better readability', 
              icon: 'eye' 
            }}
            value={highVisibility}
            onToggle={toggleHighVisibility}
          />
        </View>

        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>Select Your Accessibility Needs</Text>
          {accessibilityOptions.map(item => (
            <PreferenceItem
              key={item.key}
              item={item}
              value={preferences[item.key as keyof typeof preferences]}
              onToggle={() => handleTogglePreference(item.key)}
            />
          ))}
        </View>
      </ScrollView>

      <FooterButtons 
        onReset={handleReset}
        onSave={handleSave}
        hasChanges={hasChanges}
        saving={saving}
      />
    </SafeAreaView>
  );
}

const localStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    backgroundColor: colors.card,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: colors.surface,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
    color: colors.textSecondary,
  },
  preferencesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: colors.text,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: colors.surface,
  },
  preferenceContent: {
    flex: 1,
    marginRight: 12,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.text,
  },
  preferenceDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    gap: 12,
    backgroundColor: colors.card,
    borderTopColor: colors.border,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.headerText,
    letterSpacing: 0.5,
  },
});