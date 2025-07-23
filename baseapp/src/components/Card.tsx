import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows } from '../theme/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: 'none' | 'small' | 'medium' | 'large';
  border?: boolean;
}

const Card = ({
  children,
  style,
  elevation = 'small',
  border = false,
}: CardProps) => {
  
  // Get shadow based on elevation
  const getShadowStyle = () => {
    switch (elevation) {
      case 'none':
        return {};
      case 'small':
        return shadows.small;
      case 'medium':
        return shadows.medium;
      case 'large':
        return shadows.large;
      default:
        return shadows.small;
    }
  };
  
  return (
    <View
      style={[
        styles.card,
        getShadowStyle(),
        border && styles.cardBorder,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: borderRadius.medium,
    padding: 16,
    marginVertical: 8,
  },
  cardBorder: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default Card;
