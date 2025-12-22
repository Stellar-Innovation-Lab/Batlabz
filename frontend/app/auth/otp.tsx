import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Button } from '../../src/components';
import { authAPI, getMeWithToken } from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';

export default function OTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { login } = useAuthStore();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const otpArray = value.slice(0, 6).split('');
      setOtp(otpArray.concat(Array(6 - otpArray.length).fill('')));
      inputRefs.current[Math.min(otpArray.length, 5)]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete OTP');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await authAPI.verifyOTP(phone, otpString);
      const { access_token, user_id, is_new_user } = response.data;
      
      // Fetch user data with the token directly
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
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <Ionicons name="shield-checkmark" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>Enter the 6-digit code sent to</Text>
            <Text style={styles.phone}>{phone}</Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  error && styles.otpInputError,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={6}
                selectTextOnFocus
              />
            ))}
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Text style={styles.hint}>For testing, use OTP: 123456</Text>

          <Button
            title="Verify"
            onPress={handleVerify}
            loading={loading}
            fullWidth
            size="lg"
            style={styles.button}
          />

          <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
            <Text style={[styles.resend, countdown > 0 && styles.resendDisabled]}>
              {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  backButton: {
    padding: SPACING.md,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  phone: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  otpInput: {
    width: 50,
    height: 60,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlign: 'center',
    fontSize: FONT_SIZES.xxl,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  otpInputError: {
    borderColor: COLORS.error,
  },
  error: {
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  button: {
    marginBottom: SPACING.lg,
  },
  resend: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  resendDisabled: {
    color: COLORS.textMuted,
  },
});
