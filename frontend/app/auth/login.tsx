import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions,
  Animated,
  Easing,
  Image,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { authAPI } from '../../src/services/api';

const { width, height } = Dimensions.get('window');

// Animated cricket ball component
const FloatingBall = ({ delay, startX, startY }: { delay: number; startX: number; startY: number }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -20,
            duration: 3000 + delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 10,
            duration: 2500 + delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 3000 + delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 2500 + delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.floatingBall,
        {
          left: startX,
          top: startY,
          opacity,
          transform: [{ translateY }, { translateX }, { scale }],
        },
      ]}
    >
      <Text style={styles.ballEmoji}>🏏</Text>
    </Animated.View>
  );
};

// Glowing orb effect
const GlowOrb = ({ color, size, x, y, delay }: any) => {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.2,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.glowOrb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: x,
          top: y,
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
};

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;
  const inputScale = useRef(new Animated.Value(1)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Logo subtle rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (phone.replace(/\D/g, '').length >= 9) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonPulse, {
            toValue: 1.02,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(buttonPulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      buttonPulse.setValue(1);
    }
  }, [phone]);

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)}`;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhone(text);
    setPhone(formatted);
    setError('');
  };

  const handleFocus = () => {
    setFocused(true);
    Animated.spring(inputScale, {
      toValue: 1.02,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.spring(inputScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleContinue = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 9) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullPhone = cleanPhone.startsWith('971') ? `+${cleanPhone}` : `+971${cleanPhone}`;
      await authAPI.requestOTP(fullPhone);
      router.push({ 
        pathname: '/auth/otp', 
        params: { phone: fullPhone } 
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logoRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '3deg'],
  });

  const isValid = phone.replace(/\D/g, '').length >= 9;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Background */}
      <LinearGradient
        colors={['#0a0f1a', '#0d1929', '#0a1628']}
        style={StyleSheet.absoluteFill}
      />

      {/* Glowing orbs */}
      <GlowOrb color={COLORS.primary} size={300} x={-100} y={-50} delay={0} />
      <GlowOrb color={COLORS.secondary} size={250} x={width - 80} y={height - 300} delay={1500} />
      <GlowOrb color="#6366f1" size={200} x={width / 2 - 100} y={height / 2} delay={800} />

      {/* Floating elements */}
      <FloatingBall delay={0} startX={50} startY={120} />
      <FloatingBall delay={400} startX={width - 80} startY={180} />
      <FloatingBall delay={800} startX={30} startY={height - 250} />

      {/* Grid pattern overlay */}
      <View style={styles.gridOverlay} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <Animated.View 
              style={[
                styles.logoSection,
                { 
                  transform: [
                    { scale: logoScale },
                    { rotate: logoRotation },
                  ] 
                }
              ]}
            >
              <View style={styles.logoOuter}>
                <LinearGradient
                  colors={[COLORS.primary, '#00e676', COLORS.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradient}
                >
                  <View style={styles.logoInner}>
                    <Text style={styles.logoEmoji}>🏏</Text>
                  </View>
                </LinearGradient>
              </View>
              
              <View style={styles.titleContainer}>
                <Text style={styles.appName}>BATLABZ</Text>
                <View style={styles.taglineContainer}>
                  <View style={styles.taglineLine} />
                  <Text style={styles.tagline}>PAY & PLAY CRICKET</Text>
                  <View style={styles.taglineLine} />
                </View>
              </View>
            </Animated.View>

            {/* Main Content */}
            <Animated.View 
              style={[
                styles.mainContent,
                {
                  opacity: contentOpacity,
                  transform: [{ translateY: contentTranslateY }],
                }
              ]}
            >
              {/* Welcome Card */}
              <View style={styles.welcomeCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                  style={styles.welcomeGradient}
                >
                  <Text style={styles.welcomeEmoji}>👋</Text>
                  <Text style={styles.welcomeTitle}>Welcome, Player!</Text>
                  <Text style={styles.welcomeText}>
                    Join thousands of cricket enthusiasts. Schedule matches, book grounds, and split costs effortlessly.
                  </Text>
                </LinearGradient>
              </View>

              {/* Phone Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>ENTER YOUR PHONE NUMBER</Text>
                
                <Animated.View style={{ transform: [{ scale: inputScale }] }}>
                  <TouchableOpacity 
                    activeOpacity={1}
                    style={[
                      styles.inputContainer,
                      focused && styles.inputContainerFocused,
                      error && styles.inputContainerError,
                    ]}
                    onPress={() => inputRef.current?.focus()}
                  >
                    <LinearGradient
                      colors={focused 
                        ? ['rgba(0,200,83,0.15)', 'rgba(0,200,83,0.05)']
                        : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                      style={styles.inputGradient}
                    >
                      <View style={styles.countryCode}>
                        <Text style={styles.flag}>🇦🇪</Text>
                        <Text style={styles.countryCodeText}>+971</Text>
                        <View style={styles.countryDivider} />
                      </View>
                      <TextInput
                        ref={inputRef}
                        style={styles.input}
                        value={phone}
                        onChangeText={handlePhoneChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="50 123 4567"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        keyboardType="phone-pad"
                        maxLength={11}
                      />
                      {isValid && (
                        <View style={styles.validIcon}>
                          <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : (
                  <Text style={styles.inputHint}>
                    We'll send you a verification code
                  </Text>
                )}
              </View>

              {/* Continue Button */}
              <Animated.View style={{ transform: [{ scale: buttonPulse }] }}>
                <TouchableOpacity
                  onPress={handleContinue}
                  disabled={!isValid || loading}
                  activeOpacity={0.9}
                  style={styles.buttonWrapper}
                >
                  <LinearGradient
                    colors={isValid 
                      ? [COLORS.primary, '#00e676', COLORS.primary]
                      : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.continueButton,
                      !isValid && styles.continueButtonDisabled,
                    ]}
                  >
                    {loading ? (
                      <View style={styles.loadingDots}>
                        <Text style={styles.loadingText}>Sending OTP</Text>
                        <Text style={styles.loadingDotsText}>...</Text>
                      </View>
                    ) : (
                      <>
                        <Text style={[
                          styles.continueButtonText,
                          !isValid && styles.continueButtonTextDisabled,
                        ]}>
                          Continue
                        </Text>
                        <View style={[
                          styles.buttonArrow,
                          !isValid && styles.buttonArrowDisabled,
                        ]}>
                          <Ionicons 
                            name="arrow-forward" 
                            size={20} 
                            color={isValid ? '#000' : 'rgba(255,255,255,0.3)'} 
                          />
                        </View>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Terms */}
              <Text style={styles.terms}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </Animated.View>
          </View>

          {/* Bottom Features */}
          <View style={styles.featuresSection}>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: 'rgba(0,200,83,0.15)' }]}>
                <Ionicons name="calendar" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.featureTitle}>Schedule</Text>
              <Text style={styles.featureText}>Matches</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: 'rgba(255,215,0,0.15)' }]}>
                <Ionicons name="wallet" size={22} color={COLORS.gold} />
              </View>
              <Text style={styles.featureTitle}>Split</Text>
              <Text style={styles.featureText}>Costs</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: 'rgba(255,109,0,0.15)' }]}>
                <Ionicons name="location" size={22} color={COLORS.secondary} />
              </View>
              <Text style={styles.featureTitle}>Book</Text>
              <Text style={styles.featureText}>Grounds</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: 'rgba(99,102,241,0.15)' }]}>
                <Ionicons name="people" size={22} color="#6366f1" />
              </View>
              <Text style={styles.featureTitle}>Team</Text>
              <Text style={styles.featureText}>Management</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1a',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
  },

  // Grid overlay
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
  },

  // Floating elements
  floatingBall: {
    position: 'absolute',
    zIndex: 1,
  },
  ballEmoji: {
    fontSize: 32,
    opacity: 0.6,
  },

  // Glow orbs
  glowOrb: {
    position: 'absolute',
    opacity: 0.3,
    zIndex: 0,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoOuter: {
    padding: 4,
    borderRadius: 32,
    marginBottom: SPACING.lg,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 28,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    backgroundColor: '#0d1929',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 48,
  },
  titleContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 6,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  taglineLine: {
    width: 30,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tagline: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 3,
    fontWeight: '500',
  },

  // Main content
  mainContent: {},

  // Welcome card
  welcomeCard: {
    marginBottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  welcomeGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  welcomeEmoji: {
    fontSize: 36,
    marginBottom: SPACING.sm,
  },
  welcomeTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  welcomeText: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Input
  inputSection: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: SPACING.sm,
    letterSpacing: 1.5,
  },
  inputContainer: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  inputGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: SPACING.md,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md + 4,
  },
  flag: {
    fontSize: 22,
    marginRight: SPACING.xs,
  },
  countryCodeText: {
    fontSize: FONT_SIZES.lg,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  countryDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginLeft: SPACING.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md + 4,
    fontSize: 22,
    color: '#fff',
    letterSpacing: 2,
    fontWeight: '500',
  },
  validIcon: {
    marginLeft: SPACING.sm,
  },
  inputHint: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.4)',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },

  // Button
  buttonWrapper: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 4,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
  continueButtonTextDisabled: {
    color: 'rgba(255,255,255,0.4)',
  },
  buttonArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonArrowDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: '#000',
  },
  loadingDotsText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: '#000',
  },

  // Terms
  terms: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Features
  featuresSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  featureCard: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  featureTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#fff',
  },
  featureText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 1,
  },
});
