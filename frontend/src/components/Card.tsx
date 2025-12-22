import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from './theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'highlight' | 'success' | 'warning' | 'error';
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, variant = 'default' }) => {
  const getCardStyle = (): ViewStyle[] => {
    const base: ViewStyle[] = [styles.card, SHADOWS.md];
    
    switch (variant) {
      case 'highlight':
        base.push(styles.highlight);
        break;
      case 'success':
        base.push(styles.success);
        break;
      case 'warning':
        base.push(styles.warning);
        break;
      case 'error':
        base.push(styles.error);
        break;
    }
    
    if (style) base.push(style);
    return base;
  };

  if (onPress) {
    return (
      <TouchableOpacity style={getCardStyle()} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={getCardStyle()}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  highlight: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  success: {
    borderColor: COLORS.success,
    borderLeftWidth: 4,
  },
  warning: {
    borderColor: COLORS.warning,
    borderLeftWidth: 4,
  },
  error: {
    borderColor: COLORS.error,
    borderLeftWidth: 4,
  },
});
