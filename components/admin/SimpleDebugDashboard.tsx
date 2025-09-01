import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useFirebaseAuth';

// Prop Interface
interface SimpleDebugDashboardProps {
  navigation: any;
}

// Memoized Sub-components
const Header: React.FC<{ onBack: () => void }> = React.memo(({ onBack }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backIcon} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>Simple Debug</Text>
    </View>
  );
});

const DebugInfoCard: React.FC<{ title: string; data: object }> = React.memo(({ title, data }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.infoText}>{JSON.stringify(data, null, 2)}</Text>
    </View>
  );
});

// Main Component
const SimpleDebugDashboard: React.FC<SimpleDebugDashboardProps> = ({ navigation }) => {
  const { user, userProfile } = useAuth();
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);

  const isAdmin = userProfile?.role === 'admin';

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Header onBack={() => navigation.goBack()} />
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed" size={64} color="#ff4444" />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            This is a restricted area.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Authentication State</Text>
        <DebugInfoCard title="Firebase User" data={user || {}} />
        <DebugInfoCard title="User Profile" data={userProfile || {}} />
        
        <Text style={styles.sectionTitle}>Theme Information</Text>
        <DebugInfoCard title="Theme Colors" data={colors} />
      </ScrollView>
    </View>
  );
};

const localStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    color: colors.text,
  },
  backIcon: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    marginTop: 16,
  },
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.notification,
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default SimpleDebugDashboard;
