import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import { BusinessResponse } from '../../services/businessResponseService';

interface BusinessResponseDisplayProps {
  response: BusinessResponse;
  compact?: boolean;
}

const formatDate = (dateValue: any) => {
  try {
    const date = dateValue?.toDate ? dateValue.toDate() : new Date(dateValue);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export const BusinessResponseDisplay: React.FC<BusinessResponseDisplayProps> = React.memo(({
  response,
  compact = false,
}) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);

  const createdAtFormatted = formatDate(response.createdAt);
  const updatedAtFormatted = response.updatedAt ? formatDate(response.updatedAt) : createdAtFormatted;

  return (
    <View style={[
      styles.container,
      compact && styles.compactContainer
    ]}>
      <View style={styles.header}>
        <View style={styles.authorContainer}>
          <View style={styles.businessIcon}>
            <Ionicons name="storefront" size={14} color={colors.primary} />
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>
              {response.businessOwnerName}
            </Text>
            <Text style={styles.authorLabel}>
              Business Owner
            </Text>
          </View>
        </View>
        
        <View style={styles.dateContainer}>
          <Text style={styles.responseDate}>
            {createdAtFormatted}
          </Text>
          {updatedAtFormatted !== createdAtFormatted && (
            <Text style={styles.editedIndicator}>
              (edited)
            </Text>
          )}
        </View>
      </View>

      <Text style={[
        styles.responseContent,
        compact && styles.compactContent
      ]}>
        {response.message}
      </Text>
    </View>
  );
});

const localStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 4,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderLeftColor: colors.success,
  },
  compactContainer: {
    marginTop: 8,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  businessIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: colors.primaryMuted,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    color: colors.text,
  },
  authorLabel: {
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  responseDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  editedIndicator: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2,
    color: colors.textSecondary,
  },
  responseContent: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  compactContent: {
    fontSize: 13,
    lineHeight: 18,
  },
});
