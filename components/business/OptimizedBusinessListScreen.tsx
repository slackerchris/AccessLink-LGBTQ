import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

// Dummy data for demonstration
const categories = [
  { id: 'all', name: 'All', icon: 'grid-outline' },
  { id: 'healthcare', name: 'Healthcare', icon: 'medical-outline' },
  { id: 'dining', name: 'Dining', icon: 'restaurant-outline' },
  { id: 'fitness', name: 'Fitness', icon: 'fitness-outline' },
  { id: 'retail', name: 'Retail', icon: 'storefront-outline' },
  { id: 'professional', name: 'Professional', icon: 'briefcase-outline' },
  { id: 'entertainment', name: 'Entertainment', icon: 'film-outline' },
];

const demoBusinesses = [
  { id: '1', name: 'Rainbow Cafe', category: 'Dining', location: { city: 'San Francisco', state: 'CA' }, description: 'A safe and inclusive space for all.', tags: ['Cafe', 'LGBTQ+', 'Safe Space'], featured: true, averageRating: 4.8 },
  { id: '2', name: 'Pride Fitness', category: 'Fitness', location: { city: 'New York', state: 'NY' }, description: 'Empowering the LGBTQ+ community through fitness.', tags: ['Gym', 'Inclusive'], featured: false, averageRating: 4.5 },
];

const OptimizedBusinessListScreen = () => {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Filtered businesses (replace with real data logic)
  const filteredBusinesses = demoBusinesses.filter(biz =>
    (selectedCategory === 'all' || biz.category.toLowerCase() === selectedCategory) &&
    (searchQuery === '' || biz.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderBusinessCard = ({ item }) => (
    <TouchableOpacity style={[styles.businessCard, { backgroundColor: colors.card }]}
      onPress={() => {}}>
      <View style={styles.businessHeader}>
        <View style={styles.businessInfo}>
          <Text style={[styles.businessName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.businessCategory, { color: colors.primary }]}>{item.category}</Text>
          <Text style={[styles.businessLocation, { color: colors.textSecondary || colors.text }]}>
            {item.location.city}, {item.location.state}
          </Text>
        </View>
        <View style={styles.businessMeta}>
          {item.featured && (
            <View style={[styles.featuredBadge, { backgroundColor: colors.card }] }>
              <Ionicons name="star" size={12} color={'#FFD700'} />
              <Text style={[styles.featuredText, { color: '#D97706' }]}>Featured</Text>
            </View>
          )}
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={'#FFD700'} />
            <Text style={[styles.ratingText, { color: colors.text }]}>
              {item.averageRating ? item.averageRating.toFixed(1) : 'New'}
            </Text>
          </View>
        </View>
      </View>
      {item.description && (
        <Text style={[styles.businessDescription, { color: colors.textSecondary || colors.text }]} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      <View style={styles.businessFooter}>
        <View style={styles.tagsContainer}>
          {item.tags?.slice(0, 3).map((tag, idx) => (
            <View key={idx} style={[styles.tag, { backgroundColor: colors.surface }] }>
              <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
            </View>
          ))}
        </View>
        <View style={styles.accessibilityIcons}>
          <Ionicons name="heart" size={16} color={'#FF6B6B'} />
          <Ionicons name="accessibility" size={16} color={'#4ECDC4'} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryFilter = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      style={[styles.categoryContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
    >
      {categories.map(category => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface }
          ]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Ionicons name={category.icon as any} size={20} color={selectedCategory === category.id ? '#FFF' : colors.textSecondary || colors.text} />
          <Text style={[
            styles.categoryText,
            selectedCategory === category.id ? { color: '#FFF' } : { color: colors.text }
          ]}>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}> 
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>LGBTQ+ Directory</Text>
          <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.searchButton}>
            <Ionicons name="search" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {showSearch && (
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Search businesses, services, locations..."
            placeholderTextColor={colors.textSecondary || colors.text}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        )}
      </View>
      {/* Category Filter */}
      {!searchQuery && renderCategoryFilter()}
      {/* Performance Indicator */}
      <View style={[styles.performanceIndicator, { backgroundColor: colors.card }]}> 
        <Ionicons name="flash" size={12} color={colors.primary} />
        <Text style={[styles.performanceText, { color: colors.primary }]}> 
          ⚡ Optimized • {filteredBusinesses.length} results
        </Text>
      </View>
      {/* Business List */}
      <FlatList
        data={filteredBusinesses}
        renderItem={renderBusinessCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="business" size={64} color={colors.textSecondary || '#D1D5DB'} />
            <Text style={[styles.emptyText, { color: colors.text }]}> 
              {searchQuery ? 'No businesses found' : 'No businesses available'}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary || colors.text }]}> 
              {searchQuery ? 'Try a different search term' : 'Check back later for new listings'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 10, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  searchButton: { padding: 8 },
  searchInput: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, marginBottom: 10 },
  categoryContainer: { paddingVertical: 8, borderBottomWidth: 1, height: 56 },
  categoryButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 0, borderRadius: 20, marginLeft: 12, width: 120, justifyContent: 'center', height: 40 },
  categoryText: { fontSize: 14, fontWeight: '500', marginLeft: 6 },
  performanceIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8 },
  performanceText: { fontSize: 12, marginLeft: 4, fontWeight: '500' },
  listContainer: { padding: 20 },
  businessCard: { borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  businessHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  businessInfo: { flex: 1 },
  businessName: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  businessCategory: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  businessLocation: { fontSize: 14 },
  businessMeta: { alignItems: 'flex-end' },
  featuredBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  featuredText: { fontSize: 12, fontWeight: '500', marginLeft: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, fontWeight: '500', marginLeft: 4 },
  businessDescription: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  businessFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tagsContainer: { flexDirection: 'row', flex: 1 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  tagText: { fontSize: 12, fontWeight: '500' },
  accessibilityIcons: { flexDirection: 'row' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptySubtext: { fontSize: 14, textAlign: 'center' },
});

export default OptimizedBusinessListScreen;
