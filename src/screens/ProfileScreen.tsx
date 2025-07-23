import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, List, Switch, useTheme } from 'react-native-paper';
import { SafeAreaView } from '../components/AccessibleComponents';
import { useAccessibility } from '../accessibility/AccessibilityProvider';

export const ProfileScreen = () => {
  const theme = useTheme();
  const { preferences, updatePreferences } = useAccessibility();

  const handleToggleFeature = (feature: keyof typeof preferences) => {
    updatePreferences({
      [feature]: !preferences[feature],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        accessibilityLabel="Profile and accessibility settings"
      >
        <Text 
          variant="headlineMedium" 
          style={[styles.title, { color: theme.colors.onBackground }]}
          accessibilityRole="header"
        >
          Profile & Settings
        </Text>

        <View style={styles.section}>
          <Text 
            variant="titleLarge" 
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            Accessibility Preferences
          </Text>

          <List.Item
            title="High Contrast Mode"
            description="Increase color contrast for better visibility"
            right={() => (
              <Switch
                value={preferences.highContrast}
                onValueChange={() => handleToggleFeature('highContrast')}
                accessibilityLabel="Toggle high contrast mode"
              />
            )}
            accessibilityLabel="High contrast mode setting"
          />

          <List.Item
            title="Large Text"
            description="Increase text size throughout the app"
            right={() => (
              <Switch
                value={preferences.largeText}
                onValueChange={() => handleToggleFeature('largeText')}
                accessibilityLabel="Toggle large text"
              />
            )}
            accessibilityLabel="Large text setting"
          />

          <List.Item
            title="Reduce Motion"
            description="Minimize animations and transitions"
            right={() => (
              <Switch
                value={preferences.reduceMotion}
                onValueChange={() => handleToggleFeature('reduceMotion')}
                accessibilityLabel="Toggle reduce motion"
              />
            )}
            accessibilityLabel="Reduce motion setting"
          />

          <List.Item
            title="Voice Announcements"
            description="Hear important updates and navigation changes"
            right={() => (
              <Switch
                value={preferences.voiceAnnouncements}
                onValueChange={() => handleToggleFeature('voiceAnnouncements')}
                accessibilityLabel="Toggle voice announcements"
              />
            )}
            accessibilityLabel="Voice announcements setting"
          />
        </View>

        <View style={styles.section}>
          <Text 
            variant="titleLarge" 
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            Account
          </Text>

          <Button 
            mode="outlined" 
            onPress={() => {}}
            style={styles.button}
            accessibilityLabel="Edit profile information"
          >
            <Text>Edit Profile</Text>
          </Button>

          <Button 
            mode="outlined" 
            onPress={() => {}}
            style={styles.button}
            accessibilityLabel="Sign out of your account"
          >
            <Text>Sign Out</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 8,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
});
