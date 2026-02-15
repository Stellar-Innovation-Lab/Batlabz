// Premium Blue-themed Design System
export const COLORS = {
  // Primary - Blue Theme from Design
  primary: '#42C0E5',        // Light Blue/Cyan
  primaryDark: '#2A79A6',    // Deep Teal/Blue
  primaryLight: '#A9E1F5',   // Soft Blue
  primaryGlow: 'rgba(66, 192, 229, 0.3)',
  
  // Secondary - Accent Blue
  secondary: '#A9E1F5',      // Soft Blue
  secondaryDark: '#42C0E5',  // Light Blue
  secondaryLight: '#E7F3FB', // Very Light Blue
  
  // Accent - Vibrant Blue
  gold: '#FFD700',           // Gold for highlights
  goldDark: '#FFC400',
  goldLight: '#FFEA00',
  
  // Background - Deep Blue Theme
  background: '#2A79A6',     // Deep Blue (main app background)
  backgroundLight: '#42C0E5', // Light Blue
  backgroundGradientStart: '#2A79A6',
  backgroundGradientEnd: '#1A5A7A',
  
  // Card - White/Light Cards
  card: '#FFFFFF',           // White cards
  cardSolid: '#FFFFFF',
  cardHover: '#F5F5F5',
  cardHighlight: 'rgba(66, 192, 229, 0.1)',
  
  // Glass Effect
  glass: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  
  // Text
  text: '#FFFFFF',           // White text on dark backgrounds
  textSecondary: '#E7F3FB',  // Light text on dark backgrounds
  textMuted: '#A3A3A3',      // Muted text
  textGlow: 'rgba(255, 255, 255, 0.8)',
  
  // Status Colors
  success: '#4ade80',        // Green for success
  successLight: 'rgba(74, 222, 128, 0.2)',
  warning: '#FF6B00',        // Orange for warnings
  warningLight: 'rgba(255, 107, 0, 0.2)',
  error: '#FF453A',          // Red for errors
  errorLight: 'rgba(255, 69, 58, 0.2)',
  info: '#007AFF',           // Vibrant Blue
  infoLight: 'rgba(0, 122, 255, 0.2)',
  
  // Cricket Specific (adapted to blue theme)
  cricketRed: '#FF453A',     // Red accent
  cricketBrown: '#92400E',   // Bat wood
  pitchGreen: '#42C0E5',     // Now using blue
  stumps: '#FFD700',         // Gold
  
  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#42C0E5', '#2A79A6'],
  gradientGold: ['#FFD700', '#FF9500'],
  gradientDark: ['#2A79A6', '#1A5A7A'],
  gradientCard: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)'],
  
  // Border
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.15)',
  borderActive: '#42C0E5',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
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

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
  hero: 40,
  display: 48,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  goldGlow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
};

// Animation Durations
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};
