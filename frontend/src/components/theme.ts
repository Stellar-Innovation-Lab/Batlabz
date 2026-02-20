// ==================== PREMIUM LIGHT CRICKET THEME ====================
// Design System v2.0 - SaaS-Grade Professional

export const COLORS = {
  // NexusPay-Inspired Colors
  primary: '#4A90E2',           // Primary Blue
  primaryDark: '#357ABD',       // Darker Blue
  primaryLight: '#5FA3E8',      // Lighter Blue
  primaryGhost: '#E0F2F7',      // Light Blue Background
  
  purple: '#7C4DFF',            // Purple Gradient Start
  purpleDark: '#A27FFF',        // Purple Gradient End
  teal: '#4DB6AC',              // Teal Gradient Start
  tealDark: '#80CBC4',          // Teal Gradient End
  
  background: '#F8F9FA',        // Soft Background
  backgroundAlt: '#F1F5F9',     // Alternate Background
  surface: '#FFFFFF',           // Card/Surface
  darkCard: '#303F5E',          // Dark Card Background
  
  border: '#E5E7EB',            // Primary Border
  borderLight: '#F3F4F6',       // Light Border
  
  text: '#212529',              // Primary Text
  textSecondary: '#6B7280',     // Secondary Text
  textMuted: '#9CA3AF',         // Muted Text
  textOnPrimary: '#FFFFFF',     // White on Blue
  textOnDark: '#FFFFFF',        // White on Dark
  
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
  // Font Sizes
  h1: 32,        // Page Titles
  h2: 24,        // Section Titles
  h3: 20,        // Card Titles
  h4: 18,        // Subsections
  body: 16,      // Body Text
  bodySmall: 14, // Small Body
  caption: 12,   // Captions/Labels
  tiny: 10,      // Tiny Text
  
  // Font Weights
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
  
  // Line Heights
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
