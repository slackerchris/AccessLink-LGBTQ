import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePortal } from '../../hooks/usePortal';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import { UserProfile } from '../../types/user';

type PortalScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Portal'>;

interface PortalScreenProps {
  navigation: PortalScreenNavigationProp;
}

const ScreenHeader = React.memo(({ firstName }: { firstName: string }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Portal</Text>
      <Text style={styles.headerSubtitle}>
        Welcome back, {firstName}! Manage your account and preferences
      </Text>
    </View>
  );
});

const PortalCard = React.memo(({
  onPress, iconName, iconColor, title, subtitle, accessibilityLabel, accessibilityHint
}: {
  onPress: () => void; iconName: keyof typeof Ionicons.glyphMap; iconColor: string; title: string; subtitle: string; accessibilityLabel: string; accessibilityHint: string;
}) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <TouchableOpacity
      style={styles.portalCard}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <View style={[styles.portalIconContainer, { backgroundColor: `${iconColor}30` }]}>
        <Ionicons name={iconName} size={28} color={iconColor} />
      </View>
      <Text style={styles.portalCardTitle}>{title}</Text>
      <Text style={styles.portalCardSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
});

const ThemeToggleCard = React.memo(({ theme, toggleTheme }: { theme: 'light' | 'dark', toggleTheme: () => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.portalCard}>
      <View style={[styles.portalIconContainer, { backgroundColor: colors.warningMuted }]}>
        <Ionicons name={theme === 'light' ? 'sunny' : 'moon'} size={28} color={colors.warning} />
      </View>
      <Text style={styles.portalCardTitle}>Theme</Text>
      <View style={styles.themeToggleContainer}>
        <Text style={styles.themeToggleLabel}>
          {theme === 'light' ? 'Light' : 'Dark'} Mode
        </Text>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.card}
        />
      </View>
    </View>
  );
});

const AccountInfo = React.memo(({ userProfile }: { userProfile: UserProfile | null }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const getRoleName = (role?: string) => {
    switch (role) {
      case 'user': return 'Community Member';
      case 'bizowner': return 'Business Owner';
      case 'bizmanager': return 'Business Manager';
      case 'admin': return 'Administrator';
      case 'moderator': return 'Community Moderator';
      default: return 'Unknown';
    }
  };

  const memberSince = userProfile?.createdAt
    ? (userProfile.createdAt instanceof Date ? userProfile.createdAt.toLocaleDateString() : 'N/A')
    : 'N/A';

  return (
    <View style={styles.accountInfo}>
      <Text style={styles.accountTitle}>Account Information</Text>
      <View style={styles.accountCard}>
        <View style={styles.accountRow}>
          <Text style={styles.accountLabel}>Email</Text>
          <Text style={styles.accountValue}>{userProfile?.email}</Text>
        </View>
        <View style={styles.accountRow}>
          <Text style={styles.accountLabel}>Account Type</Text>
          <Text style={styles.accountValue}>{getRoleName(userProfile?.role)}</Text>
        </View>
        <View style={[styles.accountRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.accountLabel}>Member Since</Text>
          <Text style={styles.accountValue}>{memberSince}</Text>
        </View>
      </View>
    </View>
  );
});

export default function PortalScreen({ navigation }: PortalScreenProps) {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const {
    userProfile,
    theme,
    toggleTheme,
    handleSignOut,
    firstName,
    navigationHandlers,
  } = usePortal(navigation);

  const portalActions = [
    { handler: navigationHandlers.editProfile, icon: 'person', color: colors.primary, title: 'My Profile', subtitle: 'Edit personal details' },
    { handler: navigationHandlers.savedPlaces, icon: 'bookmark', color: '#6366f1', title: 'Saved Places', subtitle: 'Your saved businesses' },
    { handler: navigationHandlers.reviewHistory, icon: 'star', color: colors.warning, title: 'My Reviews', subtitle: 'View your reviews' },
    { handler: navigationHandlers.accessibility, icon: 'accessibility', color: colors.success, title: 'Accessibility', subtitle: 'Customize preferences' },
    { handler: navigationHandlers.identity, icon: 'heart', color: '#ec4899', title: 'Identity Settings', subtitle: 'LGBTQ+ identity preferences' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader firstName={firstName} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.portalGrid}>
          {portalActions.map((action) => (
            <PortalCard 
              key={action.title}
              onPress={action.handler} 
              iconName={action.icon as any} 
              iconColor={action.color} 
              title={action.title} 
              subtitle={action.subtitle} 
              accessibilityLabel={action.title} 
              accessibilityHint={action.subtitle} 
            />
          ))}
          <ThemeToggleCard theme={theme} toggleTheme={toggleTheme} />
          <PortalCard 
            onPress={handleSignOut} 
            iconName="log-out" 
            iconColor={colors.notification} 
            title="Sign Out" 
            subtitle="Logout from app" 
            accessibilityLabel="Sign Out" 
            accessibilityHint="Sign out of your account" 
          />
        </View>

        <AccountInfo userProfile={userProfile} />
      </ScrollView>
    </SafeAreaView>
  );
};

const localStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: colors.header,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.headerText,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.headerText + 'CC',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  portalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  portalCard: {
    borderRadius: 16,
    padding: 20,
    width: '48%',
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 16,
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  portalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  portalCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
    lineHeight: 20,
    color: colors.text,
  },
  portalCardSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
    color: colors.textSecondary,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  themeToggleLabel: {
    fontSize: 13,
    flex: 1,
    textAlign: 'left',
    color: colors.textSecondary,
  },
  accountInfo: {
    marginBottom: 32,
  },
  accountTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: colors.text,
  },
  accountCard: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  accountLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  accountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});