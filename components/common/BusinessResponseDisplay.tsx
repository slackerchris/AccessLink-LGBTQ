/**
 * Business Response Display Component
 * Shows business owner responses to reviews in public-facing screens
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BusinessResponse } from '../../services/businessResponseService';

interface BusinessResponseDisplayProps {
  response: BusinessResponse;
  compact?: boolean; // For smaller displays like in business details screen
}

export const BusinessResponseDisplay: React.FC<BusinessResponseDisplayProps> = ({
  response,
  compact = false,
}) => {
  const { colors } = useTheme();

  const formatDate = (dateValue: string) => {
    try {
      const date = new Date(dateValue);
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

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: colors.surface, 
        borderColor: colors.border 
      },
      compact && styles.compactContainer
    ]}>
      {/* Response Header */}
      <View style={styles.header}>
        <View style={styles.authorContainer}>
          <View style={[styles.businessIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="storefront" size={14} color={colors.primary} />
          </View>
          <View style={styles.authorInfo}>
            <Text style={[styles.authorName, { color: colors.text }]}>
              {response.businessOwnerName}
            </Text>
            <Text style={[styles.authorLabel, { color: colors.textSecondary }]}>
              Business Owner
            </Text>
          </View>
        </View>
        
        <View style={styles.dateContainer}>
          <Text style={[styles.responseDate, { color: colors.textSecondary }]}>
            {formatDate(response.createdAt)}
          </Text>
          {response.updatedAt !== response.createdAt && (
            <Text style={[styles.editedIndicator, { color: colors.textSecondary }]}>
              (edited)
            </Text>
          )}
        </View>
      </View>

      {/* Response Content */}
      <Text style={[
        styles.responseContent, 
        { color: colors.text },
        compact && styles.compactContent
      ]}>
        {response.message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981', // Green accent for business responses
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
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  authorLabel: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  responseDate: {
    fontSize: 12,
  },
  editedIndicator: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2,
  },
  responseContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  compactContent: {
    fontSize: 13,
    lineHeight: 18,
  },
});
