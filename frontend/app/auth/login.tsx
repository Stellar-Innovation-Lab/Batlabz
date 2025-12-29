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
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { authAPI } from '../../src/services/api';

const { width, height } = Dimensions.get('window');

// Cricket ball with rotation
const CricketBall = ({ size = 90 }: { size?: number }) => {
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

  const innerSize = size * 0.78;
  const emojiSize = size * 0.44;

  return (
    <Animated.View style={[
      styles.cricketBall, 
      { 
        width: size, 
        height: size, 
        borderRadius: size / 2,
        transform: [{ rotate: spin }, { scale }] 
      }
    ]}>
      <View style={[styles.ballInner, { width: innerSize, height: innerSize, borderRadius: innerSize / 2 }]}>
        <Text style={{ fontSize: emojiSize }}>🏏</Text>
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
  const inputRef = useRef<TextInput>(null);

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

      {/* Gradient Orbs */}
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Header with Ball */}
            <View style={styles.header}>
              <CricketBall size={80} />
              
              <View style={styles.titleContainer}>
                <Text style={styles.appName}>BATLABZ</Text>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.gold]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.taglineGradient}
                >
                  <Text style={styles.tagline}>PAY & PLAY CRICKET</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <View style={styles.welcomeRow}>
                <Text style={styles.waveEmoji}>👋</Text>
                <Text style={styles.welcomeText}>Welcome!</Text>
              </View>
              <Text style={styles.subtitleText}>
                Join UAE's premier cricket community
              </Text>
            </View>

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
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="50 123 4567"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  keyboardType="phone-pad"
                  maxLength={11}
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

            {/* Terms */}
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms</Text> &{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            {/* Bottom spacing */}
            <View style={{ height: SPACING.xl }} />
          </ScrollView>

          {/* Bottom Features - Fixed at bottom */}
          <View style={styles.featuresContainer}>
            {[
              { icon: 'calendar', label: 'Schedule', color: COLORS.primary },
              { icon: 'wallet', label: 'Pay & Split', color: COLORS.gold },
              { icon: 'location', label: 'Book', color: COLORS.secondary },
              { icon: 'trophy', label: 'Compete', color: '#a855f7' },
            ].map((item, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIconBg, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <Text style={styles.featureLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
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
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },

  // Orbs
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 350,
    height: 350,
    top: -120,
    right: -120,
    backgroundColor: COLORS.primary,
    opacity: 0.08,
  },
  orb2: {
    width: 250,
    height: 250,
    bottom: 80,
    left: -80,
    backgroundColor: COLORS.gold,
    opacity: 0.06,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
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
  titleContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 5,
  },
  taglineGradient: {
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  tagline: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 2,
  },

  // Welcome
  welcomeSection: {
    marginBottom: SPACING.lg,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  waveEmoji: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  subtitleText: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },

  // Input Card
  inputCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  inputLabel: {
    fontSize: 10,
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
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  flag: {
    fontSize: 18,
    marginRight: 4,
  },
  countryCode: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    letterSpacing: 1,
  },
  checkIcon: {
    paddingRight: SPACING.sm,
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
    marginBottom: SPACING.sm,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: '#000',
  },
  buttonTextDisabled: {
    color: 'rgba(255,255,255,0.35)',
  },
  buttonIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIconDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // Terms
  termsText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    lineHeight: 16,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '500',
  },

  // Features
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(15, 23, 42, 0.98)',
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  featureLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
});
