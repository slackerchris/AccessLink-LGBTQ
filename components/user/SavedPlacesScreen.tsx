import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ListRenderItemInfo, StyleSheet } from 'react-native';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useSavedPlaces } from '../../hooks/useSavedPlaces';
import { BusinessListing } from '../../types/business';

type SavedPlacesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SavedPlaces'>;

interface Props {
  navigation: SavedPlacesScreenNavigationProp;
}

const ScreenHeader = React.memo(({ navigation }: { navigation: SavedPlacesScreenNavigationProp }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.headerText} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Saved Places</Text>
    </View>
  );
});

const PlaceItem = React.memo(({ item, onPress }: { item: BusinessListing, onPress: () => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
      <View style={styles.itemIcon}>
        <Ionicons name="business" size={24} color={colors.primary} />
      </View>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );
});

const EmptyList = React.memo(() => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No saved places yet.</Text>
    </View>
  );
});

const LoadingIndicator = React.memo(() => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
});

const ErrorDisplay = React.memo(({ error }: { error: string }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ color: colors.text }}>{error}</Text>
    </View>
  );
});

const SavedPlacesScreen: React.FC<Props> = ({ navigation }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const { savedPlaces, loading, error } = useSavedPlaces();

  const renderItem = ({ item }: ListRenderItemInfo<BusinessListing>) => (
    <PlaceItem
      item={item}
      onPress={() => navigation.navigate('BusinessDetails', { businessId: item.id })}
    />
  );

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader navigation={navigation} />
      <FlatList
        data={savedPlaces}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyList />}
      />
    </View>
  );
};

const localStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    backgroundColor: colors.header,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    color: colors.headerText,
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  itemIcon: {
    marginRight: 16,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  itemCategory: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text,
  },
});

export default SavedPlacesScreen;