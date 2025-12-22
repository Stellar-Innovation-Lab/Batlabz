// Premium Cricket-themed Design System
export const COLORS = {
  // Primary - Cricket Pitch Green
  primary: '#00C853',
  primaryDark: '#00A844',
  primaryLight: '#69F0AE',
  primaryGlow: 'rgba(0, 200, 83, 0.3)',
  
  // Secondary - Stadium Orange/Gold
  secondary: '#FF6D00',
  secondaryDark: '#E65100',
  secondaryLight: '#FFAB40',
  
  // Accent - Championship Gold
  gold: '#FFD700',
  goldDark: '#FFC400',
  goldLight: '#FFEA00',
  
  // Background - Stadium Night Theme
  background: '#0A0E17',
  backgroundLight: '#111827',
  backgroundGradientStart: '#0A0E17',
  backgroundGradientEnd: '#1A1F2E',
  
  // Card - Glass Morphism
  card: 'rgba(25, 32, 48, 0.8)',
  cardSolid: '#192030',
  cardHover: '#1E2A40',
  cardHighlight: 'rgba(0, 200, 83, 0.1)',
  
  // Glass Effect
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textGlow: 'rgba(255, 255, 255, 0.8)',
  
  // Status Colors
  success: '#22C55E',
  successLight: 'rgba(34, 197, 94, 0.2)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.2)',
  error: '#EF4444',
  errorLight: 'rgba(239, 68, 68, 0.2)',
  info: '#3B82F6',
  infoLight: 'rgba(59, 130, 246, 0.2)',
  
  // Cricket Specific
  cricketRed: '#DC2626',    // Cricket ball
  cricketBrown: '#92400E',  // Bat wood
  pitchGreen: '#16A34A',    // Pitch
  stumps: '#FDE68A',        // Stumps yellow
  
  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#00C853', '#00A844'],
  gradientGold: ['#FFD700', '#FF9500'],
  gradientDark: ['#1A1F2E', '#0A0E17'],
  gradientCard: ['rgba(30, 42, 64, 0.9)', 'rgba(25, 32, 48, 0.9)'],
  
  // Border
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.15)',
  borderActive: '#00C853',
  
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
