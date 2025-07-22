import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView, Card, FAB } from '../components/AccessibleComponents';

export const HomeScreen = () => {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        accessibilityLabel="Home screen content"
      >
        <Text 
          variant="headlineLarge" 
          style={[styles.title, { color: theme.colors.onBackground }]}
          accessibilityRole="header"
        >
          Welcome to AccessLink
        </Text>
        
        <Text 
          variant="bodyLarge" 
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Find LGBTQ+ friendly and accessible businesses near you
        </Text>

        <Card style={styles.card} accessibilityLabel="Search businesses">
          <Card.Content>
            <Text variant="titleMedium">Find Businesses</Text>
            <Text variant="bodyMedium">
              Discover businesses that welcome everyone and prioritize accessibility
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} accessibilityLabel="Community events">
          <Card.Content>
            <Text variant="titleMedium">Community Events</Text>
            <Text variant="bodyMedium">
              Join accessible LGBTQ+ events and gatherings in your area
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} accessibilityLabel="Resources">
          <Card.Content>
            <Text variant="titleMedium">Resources</Text>
            <Text variant="bodyMedium">
              Access helpful resources and support for the LGBTQ+ community
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {}}
        accessibilityLabel="Add a new business or event"
        accessibilityHint="Opens a form to submit a business or event"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
