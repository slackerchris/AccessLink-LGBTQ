import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBusinessPortal } from '../../hooks/useBusinessPortal';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useTheme } from '../../hooks/useTheme';
import { User } from 'firebase/auth';
import { BusinessListing } from '../../types/business';

type BusinessPortalScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Portal'>;

interface BusinessPortalScreenProps {
  navigation: BusinessPortalScreenNavigationProp;
}

// --- Memoized Sub-components ---

const Header: React.FC<{ firstName: string }> = React.memo(({ firstName }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Business Portal</Text>
      <Text style={styles.headerSubtitle}>
        Welcome back, {firstName}! Manage your business and settings
      </Text>
    </View>
  );
});

type PortalCardVariant = 'primary' | 'info' | 'success' | 'warning' | 'notification';

interface PortalCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant: PortalCardVariant;
  onPress: () => void;
}

const PortalCard: React.FC<PortalCardProps> = React.memo(({ title, subtitle, icon, variant, onPress }) => {
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);

  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return { iconColor: colors.primary, backgroundColor: colors.primaryMuted };
      case 'info':
        return { iconColor: colors.info, backgroundColor: colors.infoMuted };
      case 'success':
        return { iconColor: colors.success, backgroundColor: colors.successMuted };
      case 'warning':
        return { iconColor: colors.warning, backgroundColor: colors.warningMuted };
      case 'notification':
        return { iconColor: colors.notification, backgroundColor: colors.notificationMuted };
      default:
        return { iconColor: colors.text, backgroundColor: colors.surface };
    }
  };

  const { iconColor, backgroundColor } = getVariantColors();

  return (
    <TouchableOpacity
      style={styles.portalCard}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
    >
      <View style={[styles.portalIconContainer, { backgroundColor }]}>
        <Ionicons name={icon} size={28} color={iconColor} />
      </View>
      <Text style={styles.portalCardTitle}>{title}</Text>
      <Text style={styles.portalCardSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
});

const ThemeToggleCard: React.FC<{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}> = React.memo(({ theme, toggleTheme }) => {
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);
  const isDark = theme === 'dark';
  return (
    <View
      style={styles.portalCard}
      accessibilityRole="switch"
      accessibilityLabel="Theme toggle"
      accessibilityHint={`Currently in ${theme} mode. Toggle to switch.`}
    >
      <View style={[styles.portalIconContainer, { backgroundColor: isDark ? colors.surface : colors.warningMuted }]}>
        <Ionicons name={isDark ? 'moon' : 'sunny'} size={28} color={colors.warning} />
      </View>
      <Text style={styles.portalCardTitle}>Theme</Text>
      <View style={styles.themeToggleContainer}>
        <Text style={styles.themeToggleLabel}>{isDark ? 'Dark' : 'Light'} Mode</Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: '#e5e7eb', true: colors.primary }}
          thumbColor="#ffffff"
          ios_backgroundColor="#e5e7eb"
        />
      </View>
    </View>
  );
});

const AccountInfo: React.FC<{
  user: User | null;
  business: BusinessListing | null;
  businessLoading: boolean;
}> = React.memo(({ user, business, businessLoading }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.accountInfo}>
      <Text style={styles.accountTitle}>Business Account</Text>
      <View style={styles.accountCard}>
        <View style={styles.accountRow}>
          <Text style={styles.accountLabel}>Email</Text>
          <Text style={styles.accountValue}>{user?.email}</Text>
        </View>
        <View style={styles.accountRow}>
          <Text style={styles.accountLabel}>Account Type</Text>
          <Text style={styles.accountValue}>Business Owner</Text>
        </View>
        <View style={[styles.accountRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.accountLabel}>Business Name</Text>
          <Text style={styles.accountValue}>
            {businessLoading ? 'Loading...' : business?.name || 'Not Set'}
          </Text>
        </View>
      </View>
    </View>
  );
});

// --- Main Component ---

export const BusinessPortalScreen: React.FC<BusinessPortalScreenProps> = ({ navigation }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const {
    user,
    business,
    businessLoading,
    firstName,
    theme,
    toggleTheme,
    handleSignOut,
  } = useBusinessPortal();

  const portalActions: { title: string; subtitle: string; icon: any; screen: string; variant: PortalCardVariant }[] = [
    { title: 'Business Profiles', subtitle: 'Manage your businesses', icon: 'business', variant: 'primary', screen: 'BusinessProfilesList' },
    { title: 'Services', subtitle: 'Manage offerings', icon: 'list', variant: 'info', screen: 'ServicesManagement' },
    { title: 'Reviews', subtitle: 'Customer feedback', icon: 'star', variant: 'warning', screen: 'Reviews' },
    { title: 'Media Gallery', subtitle: 'Photos & videos', icon: 'images', variant: 'warning', screen: 'MediaGallery' },
    { title: 'Add Business', subtitle: 'Register new location', icon: 'add-circle', variant: 'info', screen: 'AddBusiness' },
    { title: 'Events', subtitle: 'Manage events', icon: 'calendar', variant: 'success', screen: 'EventsManagement' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header firstName={firstName} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.portalGrid}>
          {portalActions.map(action => (
            <PortalCard
              key={action.screen}
              title={action.title}
              subtitle={action.subtitle}
              icon={action.icon}
              variant={action.variant}
              onPress={() => navigation.navigate(action.screen as any)}
            />
          ))}
          <ThemeToggleCard theme={theme} toggleTheme={toggleTheme} />
          <PortalCard
            title="Support"
            subtitle="Get help"
            icon="help-circle"
            variant="notification"
            onPress={() => Alert.alert('Support', 'Contact: support@accesslinklgbtq.app')}
          />
        </View>

        <View style={styles.signOutSection}>
          <PortalCard
            title="Sign Out"
            subtitle="Logout from app"
            icon="log-out"
            variant="notification"
            onPress={handleSignOut}
          />
        </View>

        <AccountInfo user={user} business={business} businessLoading={businessLoading} />
      </ScrollView>
    </SafeAreaView>
  );
};

const localStyles = (colors: any, shadows: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.textSecondary,
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
  signOutSection: {
    marginBottom: 16,
    alignItems: 'center',
  },
  portalCard: {
    borderRadius: 16,
    padding: 20,
    width: '48%',
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
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
  accountInfo: {
    marginTop: 16,
  },
  accountTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: colors.text,
  },
  accountCard: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: colors.card,
    ...shadows.small,
    borderWidth: 1,
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
    flex: 1,
    textAlign: 'right',
    color: colors.text,
  },
  themeToggleContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  themeToggleLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
    color: colors.textSecondary,
  },
});
