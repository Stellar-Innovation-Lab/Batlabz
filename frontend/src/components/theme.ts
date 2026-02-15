// Indian Cricket Team - White Theme Design System
export const COLORS = {
  // Primary - Indian Cricket Team Royal Blue
  primary: '#0033A0',        // Royal Blue (Indian Cricket Team)
  primaryDark: '#001F5C',    // Darker Blue
  primaryLight: '#4D7FDB',   // Sky Blue
  primaryGlow: 'rgba(0, 51, 160, 0.3)',
  
  // Secondary - Light Blue Accent
  secondary: '#4D7FDB',      // Sky Blue
  secondaryDark: '#0033A0',  // Royal Blue
  secondaryLight: '#A3C4F3', // Very Light Blue
  
  // Accent - Indian Orange & Gold
  gold: '#FFD700',           // Gold for highlights
  goldDark: '#FFC400',
  goldLight: '#FFEA00',
  
  // Background - WHITE THEME
  background: '#FFFFFF',     // Pure White
  backgroundLight: '#F8FAFC', // Off-white
  backgroundGradientStart: '#FFFFFF',
  backgroundGradientEnd: '#F8FAFC',
  
  // Card - White Cards with Borders
  card: '#FFFFFF',           // White cards
  cardSolid: '#FFFFFF',
  cardHover: '#F8FAFC',
  cardHighlight: 'rgba(0, 51, 160, 0.05)',
  cardBorder: '#E2E8F0',     // Light border
  
  // Glass Effect (subtle on white)
  glass: 'rgba(0, 51, 160, 0.03)',
  glassBorder: 'rgba(0, 51, 160, 0.08)',
  
  // Text - FOR WHITE BACKGROUND
  text: '#0F172A',           // Dark text on white
  textSecondary: '#64748B',  // Gray text
  textMuted: '#94A3B8',      // Muted text
  textGlow: 'rgba(0, 51, 160, 0.8)',
  textOnPrimary: '#FFFFFF',  // White text on blue
  
  // Status Colors
  success: '#10b981',        // Green for success
  successLight: 'rgba(16, 185, 129, 0.1)',
  warning: '#f59e0b',        // Orange for warnings
  warningLight: 'rgba(245, 158, 11, 0.1)',
  error: '#ef4444',          // Red for errors
  errorLight: 'rgba(239, 68, 68, 0.1)',
  info: '#0033A0',           // Royal Blue
  infoLight: 'rgba(0, 51, 160, 0.1)',
  
  // Cricket Specific - Indian Team Colors
  cricketBlue: '#0033A0',    // Indian Cricket Blue
  cricketOrange: '#FF9933',  // Indian Orange
  cricketBrown: '#92400E',   // Bat wood
  pitchGreen: '#10b981',     // Pitch green
  stumps: '#FFD700',         // Gold
  
  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#0033A0', '#001F5C'],
  gradientGold: ['#FFD700', '#FF9933'],
  gradientDark: ['#0F172A', '#1E293B'],
  gradientCard: ['rgba(255, 255, 255, 0.98)', 'rgba(248, 250, 252, 0.95)'],
  
  // Border
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderActive: '#0033A0',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  
  // Shadow
  shadow: 'rgba(0, 51, 160, 0.1)',
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
    shadowColor: '#42C0E5',
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
