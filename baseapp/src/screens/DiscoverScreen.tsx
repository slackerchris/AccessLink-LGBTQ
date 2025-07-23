import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DiscoverScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data for discovery items with more details
  const mockItems = [
    { 
      id: '1', 
      title: 'Local LGBTQ+ Events',
      description: 'Find local events, meetups, and gatherings',
      category: 'Events',
      icon: '🎭'
    },
    { 
      id: '2', 
      title: 'Support Groups',
      description: 'Connect with supportive communities',
      category: 'Community',
      icon: '👥'
    },
    { 
      id: '3', 
      title: 'Community Resources',
      description: 'Access helpful resources for the LGBTQ+ community',
      category: 'Resources',
      icon: '📚'
    },
    { 
      id: '4', 
      title: 'Health Services',
      description: 'LGBTQ+ friendly healthcare providers and services',
      category: 'Health',
      icon: '🏥'
    },
    { 
      id: '5', 
      title: 'Legal Support',
      description: 'Find legal assistance and know your rights',
      category: 'Legal',
      icon: '⚖️'
    },
    { 
      id: '6', 
      title: 'Youth Programs',
      description: 'Programs and resources for LGBTQ+ youth',
      category: 'Youth',
      icon: '🧒'
    },
  ];

  // Filter items based on search query
  const filteredItems = searchQuery
    ? mockItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockItems;

  // Categories for the horizontal category list
  const categories = ['All', 'Events', 'Community', 'Health', 'Resources', 'Legal', 'Youth'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter by category if not "All"
  const categoryFilteredItems = selectedCategory !== 'All'
    ? filteredItems.filter(item => item.category === selectedCategory)
    : filteredItems;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Discover</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {/* Category Selector */}
        <View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[
                  styles.categoryItem,
                  selectedCategory === item && styles.selectedCategoryItem
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text 
                  style={[
                    styles.categoryText,
                    selectedCategory === item && styles.selectedCategoryText
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            style={styles.categoryList}
          />
        </View>
        
        {/* Main Resource List */}
        <FlatList
          data={categoryFilteredItems}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.itemContainer}>
              <Text style={styles.itemIcon}>{item.icon}</Text>
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{item.category}</Text>
                  </View>
                </View>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          )}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No resources found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or category</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    padding: 12,
    fontSize: 16,
  },
  categoryList: {
    marginBottom: 15,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  selectedCategoryItem: {
    backgroundColor: '#6a0dad',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedCategoryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  categoryTag: {
    backgroundColor: '#6a0dad',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  categoryTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default DiscoverScreen;
