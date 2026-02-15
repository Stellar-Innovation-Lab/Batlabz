import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Professional Button Component
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const ProfessionalButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  disabled,
  fullWidth,
  style,
}) => {
  const getButtonStyle = () => {
    const base: ViewStyle[] = [styles.button, styles[`button_${size}`]];
    if (fullWidth) base.push(styles.buttonFullWidth);
    if (disabled || loading) base.push(styles.buttonDisabled);
    if (style) base.push(style);
    return base;
  };

  const renderContent = () => (
    <View style={styles.buttonContent}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#0033A0' : '#fff'} size=\"small\" />
      ) : (
        <>
          {icon && <Ionicons name={icon as any} size={size === 'sm' ? 18 : 20} color={variant === 'outline' || variant === 'ghost' ? '#0033A0' : '#fff'} style={styles.buttonIcon} />}
          <Text style={[styles.buttonText, styles[`buttonText_${variant}`], styles[`buttonText_${size}`]]}>{title}</Text>
        </>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity style={getButtonStyle()} onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
        <LinearGradient colors={['#0033A0', '#001F5C']} style={styles.buttonGradient}>
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[getButtonStyle(), styles[`button_${variant}`]]} onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
      {renderContent()}
    </TouchableOpacity>
  );
};

// Professional Card Component
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  style?: ViewStyle;
  onPress?: () => void;
}

export const ProfessionalCard: React.FC<CardProps> = ({ children, variant = 'default', style, onPress }) => {
  const cardStyle = [styles.card, styles[`card_${variant}`], style];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.9}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

// Professional Input Component
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
  secureTextEntry?: boolean;
  multiline?: boolean;
  error?: string;
  disabled?: boolean;
}

export const ProfessionalInput: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  keyboardType,
  secureTextEntry,
  multiline,
  error,
  disabled,
}) => {
  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError, disabled && styles.inputDisabled]}>
        {icon && <Ionicons name={icon as any} size={20} color=\"#64748B\" style={styles.inputIcon} />}
        <input
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          disabled={disabled}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// Status Badge Component
interface BadgeProps {
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<BadgeProps> = ({ label, variant, size = 'md' }) => {
  return (
    <View style={[styles.badge, styles[`badge_${variant}`], styles[`badge_${size}`]]}>
      <Text style={[styles.badgeText, styles[`badgeText_${variant}`], styles[`badgeText_${size}`]]}>{label}</Text>
    </View>
  );
};

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, trendValue }) => {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <Ionicons name={icon as any} size={24} color=\"#0033A0\" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {trend && trendValue && (
        <View style={styles.statTrend}>
          <Ionicons 
            name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove'} 
            size={12} 
            color={trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#94A3B8'} 
          />
          <Text style={[styles.statTrendText, { color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#94A3B8' }]}>
            {trendValue}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Button Styles
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0033A0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  button_sm: { },
  button_md: { },
  button_lg: { },
  buttonFullWidth: { width: '100%' },
  buttonDisabled: { opacity: 0.5 },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button_secondary: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0033A0',
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonIcon: { marginRight: 8 },
  buttonText: { fontWeight: '700', fontSize: 16, letterSpacing: 0.3 },
  buttonText_primary: { color: '#fff' },
  buttonText_secondary: { color: '#0033A0' },
  buttonText_outline: { color: '#0033A0' },
  buttonText_ghost: { color: '#0033A0' },
  buttonText_sm: { fontSize: 14 },
  buttonText_md: { fontSize: 16 },
  buttonText_lg: { fontSize: 18 },

  // Card Styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  card_default: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  card_elevated: {
    shadowColor: '#0033A0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  card_outlined: {
    borderWidth: 2,
    borderColor: '#0033A0',
  },

  // Input Styles
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 8, letterSpacing: 0.3 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  inputError: { borderColor: '#ef4444' },
  inputDisabled: { opacity: 0.6, backgroundColor: '#F1F5F9' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#0F172A', paddingVertical: 14, fontWeight: '500' },
  errorText: { fontSize: 12, color: '#ef4444', marginTop: 6 },

  // Badge Styles
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' },
  badge_sm: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badge_md: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badge_success: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  badge_warning: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  badge_error: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  badge_info: { backgroundColor: 'rgba(0, 51, 160, 0.1)' },
  badge_neutral: { backgroundColor: '#F1F5F9' },
  badgeText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  badgeText_sm: { fontSize: 11 },
  badgeText_md: { fontSize: 13 },
  badgeText_success: { color: '#10b981' },
  badgeText_warning: { color: '#f59e0b' },
  badgeText_error: { color: '#ef4444' },
  badgeText_info: { color: '#0033A0' },
  badgeText_neutral: { color: '#64748B' },

  // Stat Card Styles
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0033A0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minWidth: 110,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 51, 160, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: { fontSize: 28, fontWeight: '800', color: '#0033A0', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', textAlign: 'center' },
  statTrend: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  statTrendText: { fontSize: 11, fontWeight: '600', marginLeft: 4 },
});
