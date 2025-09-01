import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import { BusinessListing } from '../../types/business';
import { useUserHome } from '../../hooks/useUserHome';

const Header = React.memo(({ firstName }: { firstName: string }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{firstName}! 🏳️‍🌈</Text>
        <Text style={styles.subtitle}>Find your community</Text>
      </View>
    </View>
  );
});

const SearchBar = React.memo(({
  searchQuery,
  setSearchQuery,
  handleSearch,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
}) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.searchContainer}>
      <Text style={styles.sectionTitle}>Find LGBTQ+ Friendly Businesses</Text>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for restaurants, cafes, services..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const BusinessCard = React.memo(({ business, onPress }: { business: BusinessListing; onPress: () => void; }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <TouchableOpacity
      style={styles.businessCard}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.businessInfo}>
        <Text style={styles.businessName} numberOfLines={1}>{business.name}</Text>
        <Text style={styles.businessCategory} numberOfLines={1}>{business.category}</Text>
        <Text style={styles.businessDescription} numberOfLines={2}>{business.description}</Text>
        <View style={styles.businessMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <Text style={styles.ratingText}>{business.averageRating?.toFixed(1) || 'N/A'}</Text>
          </View>
          <Text style={styles.reviewCount}>{business.totalReviews || 0} reviews</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
});

const FeaturedSection = React.memo(({
  businesses,
  loading,
  error,
  onBusinessPress,
  onSeeAll,
}: {
  businesses: BusinessListing[];
  loading: boolean;
  error: string | null;
  onBusinessPress: (business: BusinessListing) => void;
  onSeeAll: () => void;
}) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />;
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    if (businesses.length === 0) {
        return <Text style={styles.emptyText}>No featured businesses found.</Text>;
    }
    return (
      <FlatList
        data={businesses}
        renderItem={({ item }) => (
          <BusinessCard
            business={item}
            onPress={() => onBusinessPress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    );
  };

  return (
    <View style={styles.featuredContainer}>
      <View style={styles.featuredHeader}>
        <Text style={styles.sectionTitle}>Featured Businesses</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      {renderContent()}
    </View>
  );
});

export const UserHomeScreen: React.FC = () => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const {
    firstName,
    searchQuery,
    setSearchQuery,
    featuredBusinesses,
    loading,
    error,
    handleBusinessPress,
    handleSearch,
    handleSeeAll,
  } = useUserHome();

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Header firstName={firstName} />
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
      />
      <FeaturedSection
        businesses={featuredBusinesses}
        loading={loading}
        error={error}
        onBusinessPress={handleBusinessPress}
        onSeeAll={handleSeeAll}
      />
    </ScrollView>
  );
};

const localStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.header,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  greeting: {
    fontSize: 18,
    color: colors.headerText + 'CC',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
    lineHeight: 34,
    color: colors.headerText,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    color: colors.headerText + 'CC',
  },
  searchContainer: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    minHeight: 60,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: colors.headerText,
    fontSize: 16,
    fontWeight: '600',
  },
  featuredContainer: {
    padding: 24,
    paddingTop: 0,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    minHeight: 90,
    borderWidth: 1,
  },
  businessInfo: {
    flex: 1,
    marginRight: 10,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.text,
  },
  businessCategory: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: colors.primary,
  },
  businessDescription: {
    fontSize: 15,
    marginBottom: 10,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  businessMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
    color: colors.text,
  },
  reviewCount: {
    fontSize: 12,
    marginLeft: 8,
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.notification,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});