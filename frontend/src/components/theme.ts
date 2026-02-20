// ==================== BATLABZ PREMIUM NAVY THEME ====================
// Professional Banking-Grade Color System

export const COLORS = {
  // Deep Navy Theme (Premium & Trustworthy)
  primary: '#1E3A8A',           // Deep Navy Blue
  primaryDark: '#1E40AF',       // Rich Navy
  primaryLight: '#3B82F6',      // Sky Blue
  primaryGhost: '#DBEAFE',      // Light Blue Ghost
  
  accent: '#F59E0B',            // Amber Accent
  accentLight: '#FCD34D',       // Light Amber
  accentGhost: '#FEF3C7',       // Amber Ghost
  
  background: '#F8FAFC',        // Soft Background
  backgroundAlt: '#F1F5F9',     // Alternate Background  
  surface: '#FFFFFF',           // Pure White Cards
  surfaceElevated: '#FAFBFC',   // Elevated Surface
  
  border: '#E5E7EB',            // Primary Border
  borderLight: '#F3F4F6',       // Light Border
  
  text: '#0F172A',              // Primary Text (Dark)
  textSecondary: '#64748B',     // Secondary Text
  textMuted: '#94A3B8',         // Muted Text
  textOnPrimary: '#FFFFFF',     // White on Navy
  
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowDark: 'rgba(0, 0, 0, 0.12)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const TYPOGRAPHY = {
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,
  tiny: 10,
  
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
  
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const FONT_SIZES = {
  xs: TYPOGRAPHY.tiny,
  sm: TYPOGRAPHY.caption,
  md: TYPOGRAPHY.bodySmall,
  lg: TYPOGRAPHY.body,
  xl: TYPOGRAPHY.h4,
  xxl: TYPOGRAPHY.h3,
  xxxl: TYPOGRAPHY.h2,
  hero: TYPOGRAPHY.h1,
};

export default { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, FONT_SIZES };