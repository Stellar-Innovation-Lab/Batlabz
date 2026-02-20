// ==================== BATLABZ DESIGN SYSTEM v2.0 ====================
// Centralized component library - ENFORCED across all screens

import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// ==================== DESIGN TOKENS ====================

export const DS_COLORS = {
  primary: '#4A90E2',
  primaryDark: '#357ABD',
  primaryLight: '#5FA3E8',
  primaryGhost: '#E0F2F7',
  
  purple: '#7C4DFF',
  purpleDark: '#A27FFF',
  teal: '#4DB6AC',
  tealDark: '#80CBC4',
  
  background: '#F8F9FA',
  surface: '#FFFFFF',
  darkCard: '#303F5E',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  text: '#212529',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const DS_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const DS_TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: '900', color: DS_COLORS.text, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '800', color: DS_COLORS.text, letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '700', color: DS_COLORS.text },
  h4: { fontSize: 18, fontWeight: '600', color: DS_COLORS.text },
  body: { fontSize: 16, fontWeight: '400', color: DS_COLORS.text },
  bodySmall: { fontSize: 14, fontWeight: '400', color: DS_COLORS.textSecondary },
  caption: { fontSize: 12, fontWeight: '500', color: DS_COLORS.textMuted },
  label: { fontSize: 13, fontWeight: '600', color: DS_COLORS.text, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
};

export const DS_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const DS_SHADOW = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 8 },
};

// ==================== STANDARDIZED COMPONENTS ====================

// Primary Button
export const DSButton = ({ title, onPress, variant = 'primary', loading = false, disabled = false, icon = null, fullWidth = false }: any) => {
  const buttonStyles = [
    styles.button,
    fullWidth && styles.buttonFullWidth,
    (disabled || loading) && styles.buttonDisabled,
  ];

  if (variant === 'primary') {
    return (
      <TouchableOpacity style={buttonStyles} onPress={onPress} disabled={disabled || loading} activeOpacity={0.9}>
        <LinearGradient colors={[DS_COLORS.primary, DS_COLORS.primaryDark]} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          {loading ? <ActivityIndicator color="#fff" size="small" /> : (
            <View style={styles.buttonContent}>
              {icon && <Ionicons name={icon} size={20} color="#fff" style={{ marginRight: 8 }} />}
              <Text style={styles.buttonTextPrimary}>{title}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity style={[buttonStyles, styles.buttonSecondary]} onPress={onPress} disabled={disabled || loading} activeOpacity={0.9}>
        {loading ? <ActivityIndicator color={DS_COLORS.primary} size="small" /> : (
          <View style={styles.buttonContent}>
            {icon && <Ionicons name={icon} size={20} color={DS_COLORS.primary} style={{ marginRight: 8 }} />}
            <Text style={styles.buttonTextSecondary}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity style={[buttonStyles, styles.buttonOutline]} onPress={onPress} disabled={disabled || loading} activeOpacity={0.9}>
        {loading ? <ActivityIndicator color={DS_COLORS.primary} size="small" /> : (
          <View style={styles.buttonContent}>
            {icon && <Ionicons name={icon} size={20} color={DS_COLORS.primary} style={{ marginRight: 8 }} />}
            <Text style={styles.buttonTextOutline}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Danger variant
  return (
    <TouchableOpacity style={[buttonStyles, styles.buttonDanger]} onPress={onPress} disabled={disabled || loading} activeOpacity={0.9}>
      {loading ? <ActivityIndicator color="#fff" size="small" /> : (
        <View style={styles.buttonContent}>
          {icon && <Ionicons name={icon} size={20} color="#fff" style={{ marginRight: 8 }} />}
          <Text style={styles.buttonTextPrimary}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Card Component
export const DSCard = ({ children, variant = 'default', onPress = null }: any) => {
  const cardStyles = [styles.card, variant === 'elevated' && styles.cardElevated];
  
  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.95}>
        {children}
      </TouchableOpacity>
    );
  }
  
  return <View style={cardStyles}>{children}</View>;
};

// Input Component
export const DSInput = ({ label, placeholder, value, onChangeText, icon = null, error = null, ...props }: any) => (
  <View style={styles.inputContainer}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <View style={[styles.inputWrapper, error && styles.inputError]}>
      {icon && <Ionicons name={icon} size={20} color={DS_COLORS.textMuted} style={{ marginRight: 12 }} />}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={DS_COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// Badge Component
export const DSBadge = ({ label, variant = 'success' }: any) => {
  const colors: any = {
    success: { bg: '#ECFDF5', text: '#10B981' },
    warning: { bg: '#FEF3C7', text: '#F59E0B' },
    error: { bg: '#FEE2E2', text: '#EF4444' },
    info: { bg: '#DBEAFE', text: '#3B82F6' },
    neutral: { bg: '#F3F4F6', text: '#6B7280' },
  };
  
  return (
    <View style={[styles.badge, { backgroundColor: colors[variant].bg }]}>
      <Text style={[styles.badgeText, { color: colors[variant].text }]}>{label}</Text>
    </View>
  );
};

// ==================== STYLES ====================

const styles = StyleSheet.create({
  // Button Styles
  button: {
    borderRadius: DS_RADIUS.lg,
    overflow: 'hidden',
    ...DS_SHADOW.md,
  },
  buttonFullWidth: { width: '100%' },
  buttonDisabled: { opacity: 0.5 },
  buttonGradient: {
    paddingVertical: DS_SPACING.md,
    paddingHorizontal: DS_SPACING.lg,
  },
  buttonSecondary: {
    backgroundColor: DS_COLORS.surface,
    borderWidth: 2,
    borderColor: DS_COLORS.border,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: DS_COLORS.primary,
  },
  buttonDanger: {
    backgroundColor: DS_COLORS.error,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DS_SPACING.md,
    paddingHorizontal: DS_SPACING.lg,
  },
  buttonTextPrimary: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '800',
    color: DS_COLORS.primary,
    letterSpacing: 0.3,
  },
  buttonTextOutline: {
    fontSize: 16,
    fontWeight: '800',
    color: DS_COLORS.primary,
    letterSpacing: 0.3,
  },

  // Card Styles
  card: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.xl,
    padding: DS_SPACING.lg,
    borderWidth: 1,
    borderColor: DS_COLORS.borderLight,
    ...DS_SHADOW.sm,
  },
  cardElevated: {
    ...DS_SHADOW.lg,
  },

  // Input Styles
  inputContainer: {
    marginBottom: DS_SPACING.lg,
  },
  inputLabel: {
    ...DS_TYPOGRAPHY.label,
    marginBottom: DS_SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DS_COLORS.background,
    borderRadius: DS_RADIUS.md,
    borderWidth: 2,
    borderColor: DS_COLORS.border,
    paddingHorizontal: DS_SPACING.md,
  },
  inputError: {
    borderColor: DS_COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: DS_COLORS.text,
    paddingVertical: DS_SPACING.md,
  },
  errorText: {
    fontSize: 12,
    color: DS_COLORS.error,
    marginTop: DS_SPACING.xs,
    fontWeight: '500',
  },

  // Badge Styles
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: DS_RADIUS.md,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
