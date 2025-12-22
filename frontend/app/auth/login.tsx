import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { PremiumBackground, StadiumLights } from '../../src/components/CricketBackgrounds';
import { PremiumButton } from '../../src/components/PremiumUI';
import { authAPI } from '../../src/services/api';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

  const formatPhone = (text: string) => {
    // Remove non-digits
    const cleaned = text.replace(/\D/g, '');
    // Format as UAE number
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhone(text);
    setPhone(formatted);
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

  return (
    <View style={styles.container}>
      {/* Premium Background */}
      <PremiumBackground variant="default" />
      <StadiumLights intensity={0.2} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.logoContainer}
              >
                <Text style={styles.logoIcon}>🏏</Text>
              </LinearGradient>
              <Text style={styles.appName}>Batlabz</Text>
              <Text style={styles.tagline}>Pay & Play Cricket</Text>
            </View>

            {/* Welcome Text */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Welcome, Player!</Text>
              <Text style={styles.welcomeText}>
                Enter your phone number to get started with the ultimate cricket experience
              </Text>
            </View>

            {/* Phone Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TouchableOpacity 
                activeOpacity={1}
                style={styles.inputContainer}
                onPress={() => inputRef.current?.focus()}
              >
                <View style={styles.countryCode}>
                  <Text style={styles.flag}>🇦🇪</Text>
                  <Text style={styles.countryCodeText}>+971</Text>
                </View>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder="50 123 4567"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="phone-pad"
                  maxLength={12}
                  autoFocus
                />
              </TouchableOpacity>
              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </View>

            {/* Continue Button */}
            <PremiumButton
              title="Continue"
              onPress={handleContinue}
              loading={loading}
              disabled={phone.replace(/\D/g, '').length < 9}
              variant="primary"
              size="lg"
              fullWidth
              icon={<Ionicons name="arrow-forward" size={20} color={COLORS.text} />}
              iconPosition="right"
            />

            {/* Terms */}
            <Text style={styles.terms}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Bottom Features */}
          <View style={styles.featuresSection}>
            <View style={styles.feature}>
              <Ionicons name="calendar" size={24} color={COLORS.primary} />
              <Text style={styles.featureText}>Schedule Matches</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="wallet" size={24} color={COLORS.gold} />
              <Text style={styles.featureText}>Split Costs</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="location" size={24} color={COLORS.secondary} />
              <Text style={styles.featureText}>Book Grounds</Text>
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
    backgroundColor: COLORS.background,
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

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  logoIcon: {
    fontSize: 50,
  },
  appName: {
    fontSize: FONT_SIZES.hero,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Welcome
  welcomeSection: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  welcomeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Input
  inputSection: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardSolid,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.glass,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  flag: {
    fontSize: 20,
    marginRight: SPACING.xs,
  },
  countryCodeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    letterSpacing: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },

  // Terms
  terms: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '500',
  },

  // Features
  featuresSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  feature: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});
