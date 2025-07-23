import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const DiscoverScreen = () => {
  // Mock data for discovery items
  const mockItems = [
    { id: '1', title: 'Local LGBTQ+ Events' },
    { id: '2', title: 'Support Groups' },
    { id: '3', title: 'Community Resources' },
    { id: '4', title: 'Health Services' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover</Text>
      
      <FlatList
        data={mockItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{item.title}</Text>
          </View>
        )}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DiscoverScreen;
