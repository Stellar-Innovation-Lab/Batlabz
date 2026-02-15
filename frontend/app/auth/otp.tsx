import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authAPI, getMeWithToken } from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { StatusBar } from 'expo-status-bar';
import { DS_COLORS, DS_SPACING, DS_RADIUS } from '../../src/components/DesignSystem';

export default function OTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { login } = useAuthStore();
  const inputRef = useRef<TextInput>(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => setCountdown((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    setTimeout(() => inputRef.current?.focus(), 500);
    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(cleaned);
    setError('');
  };

  const handleVerify = async () => {
    if (otp.length !== 6) { setError('Please enter complete 6-digit OTP'); return; }
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.verifyOTP(phone, otp);
      const { access_token, is_new_user } = response.data;
      const userResponse = await getMeWithToken(access_token);
      await login(access_token, userResponse.data);
      if (is_new_user || !userResponse.data.name) {
        router.replace('/auth/profile-setup');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Verification failed');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await authAPI.requestOTP(phone);
      setCountdown(30);
      setError('');
    } catch (err) { setError('Failed to resend OTP'); }
  };

  const renderOTPBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      boxes.push(
        <View key={i} style={[styles.otpBox, otp.length > i && styles.otpBoxFilled, otp.length === i && styles.otpBoxActive]}>
          <Text style={[styles.otpDigit, otp.length > i && styles.otpDigitFilled]}>{otp[i] || ''}</Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.background}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={DS_COLORS.text} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.iconContainer}>
              <LinearGradient colors={[DS_COLORS.primary, DS_COLORS.primaryDark]} style={styles.iconBg}>
                <Ionicons name="shield-checkmark" size={36} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Verify Your Number</Text>
            <Text style={styles.subtitle}>Enter the 6-digit code sent to</Text>
            <Text style={styles.phoneNumber}>{phone}</Text>

            <TextInput ref={inputRef} style={styles.hiddenInput} value={otp} onChangeText={handleOtpChange} keyboardType="number-pad" maxLength={6} autoFocus />
            
            <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()} style={styles.otpContainer}>
              {renderOTPBoxes()}
            </TouchableOpacity>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={DS_COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity onPress={handleVerify} disabled={otp.length !== 6 || loading} style={[styles.button, (otp.length !== 6 || loading) && styles.buttonDisabled]}>
              <LinearGradient colors={otp.length === 6 ? [DS_COLORS.primary, DS_COLORS.primaryDark] : ['#E5E7EB', '#D1D5DB']} style={styles.buttonGradient}>
                <Text style={[styles.buttonText, otp.length !== 6 && styles.buttonTextDisabled]}>
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </Text>
                <Ionicons name="checkmark" size={20} color={otp.length === 6 ? '#fff' : '#9CA3AF'} />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
                <Text style={[styles.resendText, countdown === 0 && styles.resendActive]}>
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.demoHint}>
              <Ionicons name="information-circle" size={16} color="#F59E0B" />
              <Text style={styles.demoHintText}>Demo: Use OTP <Text style={styles.demoCode}>123456</Text></Text>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, backgroundColor: DS_COLORS.background },
  backButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: DS_COLORS.surface, justifyContent: 'center', alignItems: 'center', margin: DS_SPACING.lg, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 } },
  scrollContent: { paddingHorizontal: DS_SPACING.lg, paddingTop: DS_SPACING.xl, paddingBottom: DS_SPACING.xxl },
  content: { alignItems: 'center' },
  iconContainer: { marginBottom: DS_SPACING.xl },
  iconBg: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', ...{ shadowColor: DS_COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16 } },
  title: { fontSize: 28, fontWeight: '900', color: DS_COLORS.text, marginBottom: DS_SPACING.sm, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: DS_COLORS.textSecondary, marginBottom: DS_SPACING.xs, fontWeight: '500' },
  phoneNumber: { fontSize: 17, fontWeight: '800', color: DS_COLORS.primary, marginBottom: DS_SPACING.xl },
  hiddenInput: { position: 'absolute', opacity: 0 },
  otpContainer: { flexDirection: 'row', gap: 12, marginBottom: DS_SPACING.xl },
  otpBox: { width: 52, height: 64, borderRadius: DS_RADIUS.md, backgroundColor: DS_COLORS.surface, borderWidth: 2, borderColor: DS_COLORS.border, justifyContent: 'center', alignItems: 'center' },
  otpBoxFilled: { borderColor: DS_COLORS.primary, backgroundColor: DS_COLORS.primaryGhost },
  otpBoxActive: { borderColor: DS_COLORS.primary, borderWidth: 2.5 },
  otpDigit: { fontSize: 28, fontWeight: '800', color: DS_COLORS.textMuted },
  otpDigitFilled: { color: DS_COLORS.primary },
  errorContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEE2E2', paddingHorizontal: DS_SPACING.md, paddingVertical: DS_SPACING.sm, borderRadius: DS_RADIUS.md, marginBottom: DS_SPACING.lg },
  errorText: { fontSize: 13, color: DS_COLORS.error, fontWeight: '600' },
  button: { width: '100%', borderRadius: DS_RADIUS.lg, overflow: 'hidden', marginBottom: DS_SPACING.lg, ...{ shadowColor: DS_COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12 } },
  buttonDisabled: { opacity: 0.5, ...{ shadowOpacity: 0 } },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  buttonText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  buttonTextDisabled: { color: '#9CA3AF' },
  resendContainer: { marginBottom: DS_SPACING.xl },
  resendText: { fontSize: 14, color: DS_COLORS.textMuted, fontWeight: '600' },
  resendActive: { color: DS_COLORS.primary, fontWeight: '800' },
  demoHint: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF3C7', paddingHorizontal: DS_SPACING.md, paddingVertical: DS_SPACING.sm, borderRadius: DS_RADIUS.md },
  demoHintText: { fontSize: 12, color: '#92400E', fontWeight: '600' },
  demoCode: { fontWeight: '900', color: '#78350F' },
});