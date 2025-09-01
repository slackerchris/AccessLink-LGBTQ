import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth as useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { useTheme, ThemeColors } from '../../hooks/useTheme';

export default function MinimalAuthTestScreen() {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  let user;
  let authError: string | null = null;

  try {
    user = useFirebaseAuth().user;
  } catch (e) {
    authError = String(e);
  }

  if (authError) {
    return (
      <View style={styles.container}>
        <Text style={[styles.statusText, { color: colors.notification }]}>AuthProvider context error:</Text>
        <Text style={[styles.userText, { color: colors.notification }]}>{authError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.statusText, { color: colors.success }]}>AuthProvider context OK</Text>
      <Text style={styles.userText}>User: {user ? JSON.stringify(user, null, 2) : 'No user'}</Text>
    </View>
  );
}

const localStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  userText: {
    color: colors.text,
    fontSize: 14,
  },
});
