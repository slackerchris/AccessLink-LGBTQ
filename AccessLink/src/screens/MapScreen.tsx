import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView, Searchbar } from '../components/AccessibleComponents';

export const MapScreen = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text 
          variant="headlineMedium" 
          style={[styles.title, { color: theme.colors.onBackground }]}
          accessibilityRole="header"
        >
          Find Businesses
        </Text>
        
        <Searchbar
          placeholder="Search for businesses..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          accessibilityLabel="Search for businesses"
          accessibilityHint="Enter business name or category to search"
        />
      </View>

      <View style={[styles.mapPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text 
          variant="bodyLarge" 
          style={{ color: theme.colors.onSurfaceVariant }}
          accessibilityLabel="Map view placeholder"
        >
          Interactive Map Coming Soon
        </Text>
        <Text 
          variant="bodyMedium" 
          style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
        >
          This will show accessible LGBTQ+ friendly businesses on a map
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  mapPlaceholder: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    margin: 16,
    padding: 20,
  },
  searchbar: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
});
