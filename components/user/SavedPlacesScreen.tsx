import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export function SavedPlacesScreen() {
  const navigation = useNavigation();

  const handleGoToDirectory = () => {
    navigation.navigate('Businesses' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.emptyState}>
        <Ionicons name="bookmark-outline" size={80} color="#9ca3af" />
        <Text style={styles.emptyTitle}>No Saved Places Yet</Text>
        <Text style={styles.emptySubtitle}>
          Start exploring LGBTQ+ friendly businesses and save your favorites here
        </Text>
        
        <TouchableOpacity style={styles.exploreButton} onPress={handleGoToDirectory}>
          <Ionicons name="compass-outline" size={20} color="#fff" />
          <Text style={styles.exploreButtonText}>Explore Directory</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 24,
  },
  exploreButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 30,
    gap: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});