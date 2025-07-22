import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView, Card, FAB } from '../components/AccessibleComponents';
import { Card as PaperCard } from 'react-native-paper';

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
          <PaperCard.Content>
            <Text variant="titleMedium">Find Businesses</Text>
            <Text variant="bodyMedium">
              Discover businesses that welcome everyone and prioritize accessibility
            </Text>
          </PaperCard.Content>
        </Card>

        <Card style={styles.card} accessibilityLabel="Community events">
          <PaperCard.Content>
            <Text variant="titleMedium">Community Events</Text>
            <Text variant="bodyMedium">
              Join accessible LGBTQ+ events and gatherings in your area
            </Text>
          </PaperCard.Content>
        </Card>

        <Card style={styles.card} accessibilityLabel="Resources">
          <PaperCard.Content>
            <Text variant="titleMedium">Resources</Text>
            <Text variant="bodyMedium">
              Access helpful resources and support for the LGBTQ+ community
            </Text>
          </PaperCard.Content>
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
  card: {
    marginBottom: 16,
  },
  container: {
    flex: 1,
  },
  fab: {
    bottom: 0,
    margin: 16,
    position: 'absolute',
    right: 0,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  subtitle: {
    marginBottom: 24,
    textAlign: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
});
