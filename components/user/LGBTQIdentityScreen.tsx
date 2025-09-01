import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import { useLGBTQIdentity } from '../../hooks/useLGBTQIdentity';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

const lgbtqIdentityOptions = [
  'Lesbian', 'Gay', 'Bisexual', 'Transgender', 'Queer', 'Questioning',
  'Intersex', 'Asexual', 'Pansexual', 'Non-binary', 'Genderfluid',
  'Demisexual', 'Two-Spirit', 'Ally', 'Other'
];

const pronounOptions = [
  'she/her', 'he/him', 'they/them', 'ze/zir', 'xe/xem',
  'it/its', 'any pronouns', 'ask me', 'prefer not to say'
];

type LGBTQIdentityScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LGBTQIdentity'>;

interface LGBTQIdentityScreenProps {
  navigation: LGBTQIdentityScreenNavigationProp;
}

const ScreenHeader = React.memo(({ navigation }: { navigation: LGBTQIdentityScreenNavigationProp }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.headerText} />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>LGBTQ+ Identity Settings</Text>
        <Text style={styles.headerSubtitle}>
          Share your identity to connect with affirming businesses and community
        </Text>
      </View>
    </View>
  );
});

const PrivacySection = React.memo(({ visible, onToggle }: { visible: boolean, onToggle: () => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.privacySection}>
      <View style={styles.privacyHeader}>
        <View style={styles.privacyIconContainer}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
        </View>
        <View style={styles.privacyContent}>
          <Text style={styles.privacyTitle}>Identity Visibility</Text>
          <Text style={styles.privacyDescription}>
            Control whether your identity is visible to others
          </Text>
        </View>
        <Switch
          value={visible}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary + '40' }}
          thumbColor={visible ? colors.primary : colors.textSecondary}
          ios_backgroundColor={colors.border}
        />
      </View>
      <View style={styles.privacyNote}>
        <Ionicons name="lock-closed" size={16} color={colors.textSecondary} />
        <Text style={styles.privacyNoteText}>
          {visible
            ? 'Your identity will be visible to help find affirming spaces.'
            : 'Your identity is private and used for personalized recommendations.'}
        </Text>
      </View>
    </View>
  );
});

const PreferredNameInput = React.memo(({ value, onChange }: { value: string, onChange: (text: string) => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Preferred Name</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Enter your preferred name (optional)"
        value={value}
        onChangeText={onChange}
        maxLength={50}
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  );
});

const PronounsSection = React.memo(({ selected, onSelect, custom, onCustomChange, onAddCustom }: { selected: string, onSelect: (p: string) => void, custom: string, onCustomChange: (t: string) => void, onAddCustom: () => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Pronouns</Text>
      <View style={styles.optionsGrid}>
        {pronounOptions.map((pronoun) => (
          <TouchableOpacity
            key={pronoun}
            style={[styles.optionChip, selected === pronoun && styles.optionChipSelected]}
            onPress={() => onSelect(pronoun)}
          >
            <Text style={[styles.optionChipText, selected === pronoun && styles.optionChipTextSelected]}>
              {pronoun}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.customInputContainer}>
        <TextInput
          style={styles.customInput}
          placeholder="Custom pronouns"
          value={custom}
          onChangeText={onCustomChange}
          maxLength={20}
          placeholderTextColor={colors.textSecondary}
        />
        <TouchableOpacity
          style={[styles.addButton, !custom.trim() && styles.addButtonDisabled]}
          onPress={onAddCustom}
          disabled={!custom.trim()}
        >
          <Ionicons name="add" size={20} color={custom.trim() ? colors.headerText : colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const IdentitySection = React.memo(({ selected, onToggle, custom, onCustomChange, onAddCustom }: { selected: string[], onToggle: (i: string) => void, custom: string, onCustomChange: (t: string) => void, onAddCustom: () => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Identity (Select all that apply)</Text>
      <View style={styles.optionsGrid}>
        {lgbtqIdentityOptions.map((identityOption) => (
          <TouchableOpacity
            key={identityOption}
            style={[styles.optionChip, selected.includes(identityOption) && styles.optionChipSelected]}
            onPress={() => onToggle(identityOption)}
          >
            <Text style={[styles.optionChipText, selected.includes(identityOption) && styles.optionChipTextSelected]}>
              {identityOption}
            </Text>
            {selected.includes(identityOption) && (
              <Ionicons name="checkmark" size={16} color={colors.headerText} style={styles.checkmark} />
            )}
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.customInputContainer}>
        <TextInput
          style={styles.customInput}
          placeholder="Custom identity"
          value={custom}
          onChangeText={onCustomChange}
          maxLength={30}
          placeholderTextColor={colors.textSecondary}
        />
        <TouchableOpacity
          style={[styles.addButton, !custom.trim() && styles.addButtonDisabled]}
          onPress={onAddCustom}
          disabled={!custom.trim()}
        >
          <Ionicons name="add" size={20} color={custom.trim() ? colors.headerText : colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const FooterButtons = React.memo(({ onReset, onSave, hasChanges, saving }: { onReset: () => void, onSave: () => void, hasChanges: boolean, saving: boolean }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.resetButton} onPress={onReset} disabled={saving}>
        <Text style={styles.resetButtonText}>Reset All</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.saveButton, (!hasChanges || saving) && styles.saveButtonDisabled]}
        onPress={onSave}
        disabled={!hasChanges || saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color={colors.headerText} />
        ) : (
          <Text style={[styles.saveButtonText, !hasChanges && styles.saveButtonTextDisabled]}>
            Save Settings
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
});

export default function LGBTQIdentityScreen({ navigation }: LGBTQIdentityScreenProps) {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const {
    identity,
    customPronoun,
    setCustomPronoun,
    customIdentity,
    setCustomIdentity,
    saving,
    hasChanges,
    handleToggleVisibility,
    handlePronounSelect,
    handleIdentityToggle,
    handleAddCustomPronoun,
    handleAddCustomIdentity,
    handlePreferredNameChange,
    handleSave,
    handleReset,
  } = useLGBTQIdentity(navigation);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader navigation={navigation} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <PrivacySection visible={identity.visible} onToggle={handleToggleVisibility} />
        <PreferredNameInput value={identity.preferredName} onChange={handlePreferredNameChange} />
        <PronounsSection
          selected={identity.pronouns}
          onSelect={handlePronounSelect}
          custom={customPronoun}
          onCustomChange={setCustomPronoun}
          onAddCustom={handleAddCustomPronoun}
        />
        <IdentitySection
          selected={identity.identities}
          onToggle={handleIdentityToggle}
          custom={customIdentity}
          onCustomChange={setCustomIdentity}
          onAddCustom={handleAddCustomIdentity}
        />
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
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.header,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.headerText,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.headerText,
    lineHeight: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  privacySection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  privacyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  privacyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 52,
  },
  privacyNoteText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.card,
    color: colors.text,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  optionChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionChipText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  optionChipTextSelected: {
    color: colors.headerText,
  },
  checkmark: {
    marginLeft: 6,
  },
  customInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: colors.card,
    color: colors.text,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.surface,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.surface,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.headerText,
  },
  saveButtonTextDisabled: {
    color: colors.textSecondary,
  },
});