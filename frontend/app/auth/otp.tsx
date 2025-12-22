import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { PremiumBackground, StadiumLights } from '../../src/components/CricketBackgrounds';
import { PremiumButton } from '../../src/components/PremiumUI';
import { authAPI, getMeWithToken } from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';

export default function OTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { login } = useAuthStore();
  const inputRef = useRef<TextInput>(null);
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Auto-focus OTP input
    setTimeout(() => inputRef.current?.focus(), 500);
  }, []);

  const handleOtpChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(cleaned);
    setError('');
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await authAPI.verifyOTP(phone, otp);
      const { access_token, is_new_user } = response.data;
      
      const userResponse = await getMeWithToken(access_token);
      const userData = { ...userResponse.data };
      
      await login(access_token, userData);
      
      if (is_new_user || !userData.name) {
        router.replace('/auth/profile-setup');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      console.log('OTP Error:', err);
      setError(err.response?.data?.detail || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    try {
      await authAPI.requestOTP(phone);
      setCountdown(30);
      setError('');
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  // Render OTP boxes
  const renderOTPBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      const isFilled = otp.length > i;
      const isActive = otp.length === i;
      
      boxes.push(
        <View
          key={i}
          style={[
            styles.otpBox,
            isFilled && styles.otpBoxFilled,
            isActive && styles.otpBoxActive,
          ]}
        >
          <Text style={[styles.otpText, isFilled && styles.otpTextFilled]}>
            {otp[i] || ''}
          </Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <View style={styles.container}>
      <PremiumBackground variant="default" />
      <StadiumLights intensity={0.15} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.content}>
            {/* Shield Icon */}
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.iconContainer}
            >
              <Ionicons name="shield-checkmark" size={40} color={COLORS.text} />
            </LinearGradient>

            {/* Title */}
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={styles.phoneNumber}>{phone}</Text>
            </Text>

            {/* OTP Input */}
            <TouchableOpacity 
              style={styles.otpContainer}
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
            >
              {renderOTPBoxes()}
            </TouchableOpacity>

            {/* Hidden Input */}
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={otp}
              onChangeText={handleOtpChange}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            {/* Test OTP Hint */}
            <Text style={styles.hint}>For testing, use OTP: 123456</Text>

            {/* Error */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Verify Button */}
            <PremiumButton
              title="Verify"
              onPress={handleVerify}
              loading={loading}
              disabled={otp.length !== 6}
              variant="primary"
              size="lg"
              fullWidth
            />

            {/* Resend */}
            <TouchableOpacity 
              style={styles.resendContainer} 
              onPress={handleResend}
              disabled={countdown > 0}
            >
              {countdown > 0 ? (
                <Text style={styles.countdownText}>
                  Resend OTP in <Text style={styles.countdownNumber}>{countdown}s</Text>
                </Text>
              ) : (
                <Text style={styles.resendText}>Resend OTP</Text>
              )}
            </TouchableOpacity>
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
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.md,
    marginTop: SPACING.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  phoneNumber: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  otpBox: {
    width: 50,
    height: 60,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.cardSolid,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  otpBoxActive: {
    borderColor: COLORS.gold,
  },
  otpText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  otpTextFilled: {
    color: COLORS.text,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  resendContainer: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
  },
  countdownText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  countdownNumber: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  resendText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
