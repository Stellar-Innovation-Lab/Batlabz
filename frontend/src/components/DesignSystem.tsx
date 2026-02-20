// ==================== BATLABZ DESIGN SYSTEM - NAVY THEME ====================

import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export const DS_COLORS = {
  primary: '#1E3A8A',
  primaryDark: '#1E40AF',
  primaryLight: '#3B82F6',
  primaryGhost: '#DBEAFE',
  
  accent: '#F59E0B',
  accentLight: '#FCD34D',
  accentGhost: '#FEF3C7',
  
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const DS_SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const DS_RADIUS = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 9999 };

export const DSButton = ({ title, onPress, variant = 'primary', loading = false, disabled = false, icon = null }: any) => {
  if (variant === 'primary') {
    return (
      <TouchableOpacity style={[styles.button, disabled && styles.buttonDisabled]} onPress={onPress} disabled={disabled || loading}>
        <LinearGradient colors={[DS_COLORS.primary, DS_COLORS.primaryDark]} style={styles.buttonGradient}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <View style={styles.buttonContent}>
              {icon && <Ionicons name={icon} size={20} color="#fff" style={{ marginRight: 8 }} />}
              <Text style={styles.buttonTextPrimary}>{title}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity style={[styles.button, styles.buttonOutline, disabled && styles.buttonDisabled]} onPress={onPress} disabled={disabled || loading}>
      <Text style={styles.buttonTextOutline}>{title}</Text>
    </TouchableOpacity>
  );
};

export const DSCard = ({ children, onPress = null }: any) => {
  if (onPress) return <TouchableOpacity style={styles.card} onPress={onPress}>{children}</TouchableOpacity>;
  return <View style={styles.card}>{children}</View>;
};

export const DSBadge = ({ label, variant = 'success' }: any) => {
  const colors: any = {
    success: { bg: '#D1FAE5', text: '#059669' },
    warning: { bg: '#FEF3C7', text: '#F59E0B' },
    error: { bg: '#FEE2E2', text: '#EF4444' },
    info: { bg: '#DBEAFE', text: '#1E3A8A' },
    neutral: { bg: '#F3F4F6', text: '#6B7280' },
  };
  return <View style={[styles.badge, { backgroundColor: colors[variant].bg }]}><Text style={[styles.badgeText, { color: colors[variant].text }]}>{label}</Text></View>;
};

const styles = StyleSheet.create({
  button: { borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  buttonDisabled: { opacity: 0.5 },
  buttonGradient: { paddingVertical: 16, paddingHorizontal: 24 },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: DS_COLORS.primary, paddingVertical: 16, paddingHorizontal: 24 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonTextPrimary: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  buttonTextOutline: { fontSize: 16, fontWeight: '800', color: DS_COLORS.primary, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
});