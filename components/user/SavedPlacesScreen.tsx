import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth, useAuthActions } from '../../hooks/useAuth';
import { useBusinesses } from '../../hooks/useBusiness';
import { useTheme } from '../../hooks/useTheme';

export function SavedPlacesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userProfile } = useAuth();
  const { unsaveBusiness } = useAuthActions();
  const { businesses } = useBusinesses();
  const { colors } = useTheme();

  // Check if we can go back (i.e., we're in a stack, not a tab)
  const canGoBack = navigation.canGoBack();
  const showBackButton = canGoBack && route.name === 'SavedPlaces';

  // Get saved businesses
  const savedBusinesses = useMemo(() => {
    const savedIds = userProfile?.profile?.savedBusinesses || [];
    return businesses.filter(business => savedIds.includes(business.id));
  }, [businesses, userProfile?.profile?.savedBusinesses]);

  const handleGoToDirectory = () => {
    navigation.navigate('Directory' as never);
  };

  const handleUnsaveBusiness = async (businessId: string) => {
    Alert.alert(
      'Remove from Saved Places',
      'Are you sure you want to remove this business from your saved places?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await unsaveBusiness(businessId);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove business from saved places');
            }
          }
        }
      ]
    );
  };

  const renderSavedBusiness = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.businessCard}
      onPress={() => (navigation as any).navigate('Directory', { 
        screen: 'BusinessDetails', 
        params: { business: item } 
      })}
    >
      <View style={styles.businessHeader}>
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>{item.name}</Text>
          <Text style={styles.businessCategory}>{item.category}</Text>
          <Text style={styles.businessDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.businessMeta}>
            <Text style={styles.location}>
              📍 {item.location?.city}, {item.location?.state}
            </Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text style={styles.ratingText}>{item.averageRating?.toFixed(1) || '4.5'}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.unsaveButton}
          onPress={(e) => {
            e.stopPropagation();
            handleUnsaveBusiness(item.id);
          }}
        >
          <Ionicons name="bookmark" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (savedBusinesses.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={80} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Saved Places Yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Start exploring LGBTQ+ friendly businesses and save your favorites here
          </Text>
          
          <TouchableOpacity style={[styles.exploreButton, { backgroundColor: colors.primary }]} onPress={handleGoToDirectory}>
            <Ionicons name="compass-outline" size={20} color="#fff" />
            <Text style={styles.exploreButtonText}>Explore Directory</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        {showBackButton && (
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <View style={[styles.headerContent, !showBackButton && styles.headerContentCentered]}>
          <Text style={[styles.headerTitle, { color: colors.headerText }]}>Saved Places</Text>
          <Text style={[styles.headerSubtitle, { color: colors.headerText + 'CC' }]}>
            {savedBusinesses.length} saved {savedBusinesses.length === 1 ? 'place' : 'places'}
          </Text>
        </View>
      </View>
      
      <FlatList
        data={savedBusinesses}
        renderItem={renderSavedBusiness}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerContentCentered: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  listContainer: {
    padding: 20,
  },
  businessCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
    marginBottom: 8,
  },
  businessDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  businessMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  location: {
    fontSize: 12,
    color: '#6b7280',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#1f2937',
    marginLeft: 4,
  },
  unsaveButton: {
    padding: 8,
    marginLeft: 12,
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