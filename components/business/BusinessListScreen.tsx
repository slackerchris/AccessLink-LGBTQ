import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useBusinessList } from '../../hooks/useBusinessList';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { ApprovedBusiness } from '../../services/properBusinessService';

type BusinessListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Directory'>;

interface BusinessListScreenProps {
  navigation: BusinessListScreenNavigationProp;
}

// --- Memoized Sub-components ---

const Header: React.FC<{
  showSearch: boolean;
  searchQuery: string;
  onToggleSearch: () => void;
  onSearchChange: (query: string) => void;
}> = React.memo(({ showSearch, searchQuery, onToggleSearch, onSearchChange }) => {
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>LGBTQ+ Directory</Text>
        <TouchableOpacity onPress={onToggleSearch} style={styles.searchButton}>
          <Ionicons name="search" size={24} color={styles.headerTitle.color} />
        </TouchableOpacity>
      </View>
      {showSearch && (
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses, services, locations..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={onSearchChange}
          autoFocus
        />
      )}
    </View>
  );
});

const CategoryFilter: React.FC<{
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}> = React.memo(({ selectedCategory, onSelectCategory }) => {
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);
  const categories = [
    { id: 'all', name: 'All', icon: 'grid-outline' },
    { id: 'healthcare', name: 'Healthcare', icon: 'medical-outline' },
    { id: 'restaurant', name: 'Dining', icon: 'restaurant-outline' },
    { id: 'fitness', name: 'Fitness', icon: 'fitness-outline' },
    { id: 'retail', name: 'Retail', icon: 'storefront-outline' },
    { id: 'professional_services', name: 'Professional', icon: 'briefcase-outline' },
    { id: 'entertainment', name: 'Entertainment', icon: 'film-outline' },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
      {categories.map(category => (
        <TouchableOpacity
          key={category.id}
          style={[styles.categoryButton, selectedCategory === category.id && styles.categoryButtonActive]}
          onPress={() => onSelectCategory(category.id)}
        >
          <Ionicons name={category.icon as any} size={20} color={selectedCategory === category.id ? colors.headerText : styles.categoryText.color} />
          <Text style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextActive]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
});

const PerformanceIndicator: React.FC<{ count: number }> = React.memo(({ count }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.performanceIndicator}>
      <Ionicons name="flash" size={12} color={styles.performanceText.color} />
      <Text style={styles.performanceText}>⚡ Optimized • {count} results</Text>
    </View>
  );
});

const BusinessCard: React.FC<{ item: ApprovedBusiness; onPress: () => void }> = React.memo(({ item, onPress }) => {
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <TouchableOpacity style={styles.businessCard} onPress={onPress}>
      <View style={styles.businessHeader}>
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>{item.name}</Text>
          <Text style={styles.businessCategory}>{item.category}</Text>
          <Text style={styles.businessLocation}>{`${item.location.city}, ${item.location.state}`}</Text>
        </View>
        <View style={styles.businessMeta}>
          {item.featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color={styles.featuredText.color} />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.ratingText}>{item.averageRating ? item.averageRating.toFixed(1) : 'New'}</Text>
          </View>
        </View>
      </View>
      {item.description && <Text style={styles.businessDescription} numberOfLines={2}>{item.description}</Text>}
      <View style={styles.businessFooter}>
        <View style={styles.tagsContainer}>
          {item.tags?.slice(0, 3).map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <View style={styles.accessibilityIcons}>
          <Ionicons name="heart" size={16} color={colors.notification} />
          <Ionicons name="accessibility" size={16} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
});

const EmptyState: React.FC<{ isSearch: boolean }> = React.memo(({ isSearch }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="business" size={64} color={styles.emptySubtext.color} />
      <Text style={styles.emptyText}>{isSearch ? 'No businesses found' : 'No businesses available'}</Text>
      <Text style={styles.emptySubtext}>{isSearch ? 'Try a different search term' : 'Check back later for new listings'}</Text>
    </View>
  );
});

// --- Main Component ---

const BusinessListScreen: React.FC<BusinessListScreenProps> = ({ navigation }) => {
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);
  const { businesses, loading, loadingMore, error, hasMore, searchQuery, selectedCategory, setSearchQuery, setSelectedCategory, loadMore, refresh } = useBusinessList();
  const [showSearch, setShowSearch] = useState(false);

  if (loading && !loadingMore) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        showSearch={showSearch}
        searchQuery={searchQuery}
        onToggleSearch={() => setShowSearch(!showSearch)}
        onSearchChange={setSearchQuery}
      />

      {!searchQuery && <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />}

      <PerformanceIndicator count={businesses.length} />

      <FlatList
        data={businesses}
        renderItem={({ item }) => (
          <BusinessCard item={item} onPress={() => navigation.navigate('BusinessDetails', { businessId: item.businessId })} />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onRefresh={refresh}
        refreshing={loading}
        onEndReached={() => hasMore && !loadingMore && loadMore()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginVertical: 20 }} color={colors.primary} /> : null}
        ListEmptyComponent={<EmptyState isSearch={!!searchQuery} />}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const localStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 10, borderBottomWidth: 1, backgroundColor: colors.card, borderBottomColor: colors.border },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  searchButton: { padding: 8 },
  searchInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
    borderWidth: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    borderColor: colors.border,
  },
  categoryContainer: { paddingVertical: 8, borderBottomWidth: 1, height: 56, backgroundColor: colors.card, borderBottomColor: colors.border },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 12,
    height: 40,
    backgroundColor: colors.surface,
  },
  categoryButtonActive: { backgroundColor: colors.primary },
  categoryText: { fontSize: 14, fontWeight: '500', marginLeft: 6, color: colors.text },
  categoryTextActive: { color: colors.headerText },
  performanceIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, backgroundColor: colors.card },
  performanceText: { fontSize: 12, marginLeft: 4, fontWeight: '500', color: colors.primary },
  listContainer: { padding: 20 },
  businessCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  businessHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  businessInfo: { flex: 1 },
  businessName: { fontSize: 18, fontWeight: '600', marginBottom: 4, color: colors.text },
  businessCategory: { fontSize: 14, fontWeight: '500', marginBottom: 4, color: colors.primary },
  businessLocation: { fontSize: 14, color: colors.textSecondary },
  businessMeta: { alignItems: 'flex-end' },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  featuredText: { fontSize: 12, fontWeight: '500', marginLeft: 4, color: colors.warning },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, fontWeight: '500', marginLeft: 4, color: colors.text },
  businessDescription: { fontSize: 14, lineHeight: 20, marginBottom: 16, color: colors.textSecondary },
  businessFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tagsContainer: { flexDirection: 'row', flex: 1, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 8, marginBottom: 4, backgroundColor: colors.surface },
  tagText: { fontSize: 12, fontWeight: '500', color: colors.primary },
  accessibilityIcons: { flexDirection: 'row', gap: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8, color: colors.text },
  emptySubtext: { fontSize: 14, textAlign: 'center', color: colors.textSecondary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { color: colors.notification, textAlign: 'center', padding: 10 },
});

export default BusinessListScreen;
