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
  StatusBar,
  ScrollView,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { authAPI } from '../../src/services/api';

const { width, height } = Dimensions.get('window');

// Animated particles
const Particle = ({ delay, size, x, color }: any) => {
  const translateY = useRef(new Animated.Value(height + 50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(height + 50);
      opacity.setValue(0);
      
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -50,
            duration: 8000 + Math.random() * 4000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.6,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.delay(5000),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => animate());
    };
    animate();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
};

// Cricket ball with rotation
const CricketBall = ({ compact }: { compact?: boolean }) => {
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const ballSize = compact ? 60 : 90;
  const innerSize = compact ? 46 : 70;
  const emojiSize = compact ? 28 : 40;

  return (
    <Animated.View style={[
      styles.cricketBall, 
      { 
        width: ballSize, 
        height: ballSize, 
        borderRadius: ballSize / 2,
        transform: [{ rotate: spin }, { scale }] 
      }
    ]}>
      <View style={[styles.ballInner, { width: innerSize, height: innerSize, borderRadius: innerSize / 2 }]}>
        <Text style={[styles.ballEmoji, { fontSize: emojiSize }]}>🏏</Text>
      </View>
    </Animated.View>
  );
};

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Animations
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(formTranslateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      // Scroll to bottom when keyboard shows
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)}`;
  };

  const handlePhoneChange = (text: string) => {
    setPhone(formatPhone(text));
    setError('');
  };

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  const handleContinue = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 9) {
      setError('Please enter a valid phone number');
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setError('');

    try {
      const fullPhone = cleanPhone.startsWith('971') ? `+${cleanPhone}` : `+971${cleanPhone}`;
      await authAPI.requestOTP(fullPhone);
      router.push({ pathname: '/auth/otp', params: { phone: fullPhone } });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const isValid = phone.replace(/\D/g, '').length >= 9;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated Particles - only show when keyboard not visible */}
      {!keyboardVisible && [...Array(6)].map((_, i) => (
        <Particle
          key={i}
          delay={i * 1000}
          size={4 + Math.random() * 3}
          x={Math.random() * width}
          color={i % 2 === 0 ? COLORS.primary : COLORS.gold}
        />
      ))}

      {/* Gradient Orbs */}
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Header with Ball */}
            <View style={[styles.header, keyboardVisible && styles.headerCompact]}>
              <CricketBall compact={keyboardVisible} />
              
              <View style={styles.titleContainer}>
                <Text style={[styles.appName, keyboardVisible && styles.appNameCompact]}>BATLABZ</Text>
                {!keyboardVisible && (
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.gold]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.taglineGradient}
                  >
                    <Text style={styles.tagline}>PAY & PLAY CRICKET</Text>
                  </LinearGradient>
                )}
              </View>
            </View>

            {/* Main Form */}
            <Animated.View 
              style={[
                styles.formContainer,
                { opacity: formOpacity, transform: [{ translateY: formTranslateY }] }
              ]}
            >
              {/* Welcome Section - hide when keyboard visible */}
              {!keyboardVisible && (
                <View style={styles.welcomeSection}>
                  <View style={styles.welcomeRow}>
                    <Text style={styles.waveEmoji}>👋</Text>
                    <Text style={styles.welcomeText}>Welcome, Cricketer!</Text>
                  </View>
                  <Text style={styles.subtitleText}>
                    Join UAE's premier cricket community
                  </Text>
                </View>
              )}

              {/* Phone Input Card */}
              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
                
                <View 
                  style={[
                    styles.inputWrapper,
                    focused && styles.inputWrapperFocused,
                    error && styles.inputWrapperError,
                  ]}
                >
                  <View style={styles.countrySection}>
                    <Text style={styles.flag}>🇦🇪</Text>
                    <Text style={styles.countryCode}>+971</Text>
                  </View>
                  
                  <View style={styles.divider} />
                  
                  <TextInput
                    ref={inputRef}
                    style={styles.phoneInput}
                    value={phone}
                    onChangeText={handlePhoneChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="50 123 4567"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    keyboardType="phone-pad"
                    maxLength={11}
                    returnKeyType="done"
                    onSubmitEditing={handleContinue}
                  />
                  
                  {isValid && (
                    <View style={styles.checkIcon}>
                      <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
                    </View>
                  )}
                </View>

                {error ? (
                  <View style={styles.errorRow}>
                    <Ionicons name="alert-circle" size={14} color={COLORS.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : (
                  <Text style={styles.hintText}>We'll send a verification code via SMS</Text>
                )}
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                onPress={handleContinue}
                disabled={!isValid || loading}
                activeOpacity={0.85}
                style={styles.buttonContainer}
              >
                <LinearGradient
                  colors={isValid 
                    ? [COLORS.primary, '#00e676']
                    : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueButton}
                >
                  {loading ? (
                    <Text style={styles.buttonText}>Sending...</Text>
                  ) : (
                    <>
                      <Text style={[
                        styles.buttonText,
                        !isValid && styles.buttonTextDisabled
                      ]}>
                        Get Started
                      </Text>
                      <View style={[
                        styles.buttonIcon,
                        !isValid && styles.buttonIconDisabled
                      ]}>
                        <Ionicons 
                          name="arrow-forward" 
                          size={18} 
                          color={isValid ? '#000' : 'rgba(255,255,255,0.3)'} 
                        />
                      </View>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Terms - hide when keyboard visible */}
              {!keyboardVisible && (
                <Text style={styles.termsText}>
                  By continuing, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms</Text> &{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              )}
            </Animated.View>
          </ScrollView>

          {/* Bottom Features - only show when keyboard not visible */}
          {!keyboardVisible && (
            <View style={styles.featuresContainer}>
              {[
                { icon: 'calendar', label: 'Schedule', color: COLORS.primary },
                { icon: 'wallet', label: 'Pay & Split', color: COLORS.gold },
                { icon: 'location', label: 'Book', color: COLORS.secondary },
                { icon: 'trophy', label: 'Compete', color: '#a855f7' },
              ].map((item, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={[styles.featureIconBg, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={styles.featureLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },

  // Orbs
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 400,
    height: 400,
    top: -150,
    right: -150,
    backgroundColor: COLORS.primary,
    opacity: 0.08,
  },
  orb2: {
    width: 300,
    height: 300,
    bottom: 100,
    left: -100,
    backgroundColor: COLORS.gold,
    opacity: 0.06,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  headerCompact: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  cricketBall: {
    backgroundColor: '#1e293b',
    borderWidth: 3,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  ballInner: {
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballEmoji: {},
  titleContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 6,
  },
  appNameCompact: {
    fontSize: 28,
    letterSpacing: 4,
  },
  taglineGradient: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 2,
  },

  // Form
  formContainer: {
    width: '100%',
  },
  welcomeSection: {
    marginBottom: SPACING.lg,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  waveEmoji: {
    fontSize: 28,
    marginRight: SPACING.sm,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  subtitleText: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },

  // Input Card
  inputCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0,200,83,0.05)',
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  countrySection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  flag: {
    fontSize: 20,
    marginRight: 6,
  },
  countryCode: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  phoneInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '500',
    color: '#fff',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    letterSpacing: 1,
  },
  checkIcon: {
    paddingRight: SPACING.md,
  },
  hintText: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.35)',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    gap: 4,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },

  // Button
  buttonContainer: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    gap: SPACING.sm,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: '#000',
  },
  buttonTextDisabled: {
    color: 'rgba(255,255,255,0.35)',
  },
  buttonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIconDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // Terms
  termsText: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '500',
  },

  // Features
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  featureLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
});
