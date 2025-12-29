import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Dimensions,
  StatusBar
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { authAPI, getMeWithToken } from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';

const { width } = Dimensions.get('window');

export default function OTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { login } = useAuthStore();
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 500);
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
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

    Keyboard.dismiss();
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
      setError('Failed to resend OTP. Please try again.');
    }
  };

  const formatPhoneDisplay = (phoneNum: string) => {
    if (!phoneNum) return '';
    const cleaned = phoneNum.replace(/\D/g, '');
    if (cleaned.length >= 12) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    return phoneNum;
  };

  const isComplete = otp.length === 6;

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
          <Text style={[
            styles.otpDigit,
            isFilled && styles.otpDigitFilled,
          ]}>
            {otp[i] || ''}
          </Text>
          {isActive && <View style={styles.cursor} />}
        </View>
      );
    }
    return boxes;
  };

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

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[COLORS.primary, '#00e676']}
                style={styles.iconGradient}
              >
                <Ionicons name="shield-checkmark" size={40} color="#000" />
              </LinearGradient>
            </View>

            {/* Title */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Verify Your Number</Text>
              <Text style={styles.subtitle}>
                Enter the 6-digit code sent to
              </Text>
              <Text style={styles.phoneNumber}>{formatPhoneDisplay(phone)}</Text>
            </View>

            {/* Hidden Input for keyboard */}
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={otp}
              onChangeText={handleOtpChange}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleVerify}
            />

            {/* OTP Boxes */}
            <TouchableOpacity 
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
              style={styles.otpContainer}
            >
              {renderOTPBoxes()}
            </TouchableOpacity>

            {/* Error */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Verify Button */}
            <TouchableOpacity
              onPress={handleVerify}
              disabled={!isComplete || loading}
              activeOpacity={0.85}
              style={styles.buttonContainer}
            >
              <LinearGradient
                colors={isComplete 
                  ? [COLORS.primary, '#00e676']
                  : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.verifyButton}
              >
                {loading ? (
                  <Text style={styles.buttonText}>Verifying...</Text>
                ) : (
                  <>
                    <Text style={[
                      styles.buttonText,
                      !isComplete && styles.buttonTextDisabled
                    ]}>
                      Verify & Continue
                    </Text>
                    <View style={[
                      styles.buttonIcon,
                      !isComplete && styles.buttonIconDisabled
                    ]}>
                      <Ionicons 
                        name="checkmark" 
                        size={18} 
                        color={isComplete ? '#000' : 'rgba(255,255,255,0.3)'} 
                      />
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <TouchableOpacity 
                onPress={handleResend}
                disabled={countdown > 0}
              >
                <Text style={[
                  styles.resendLink,
                  countdown > 0 && styles.resendLinkDisabled
                ]}>
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Demo Hint */}
            {!keyboardVisible && (
              <View style={styles.demoHint}>
                <Ionicons name="information-circle" size={16} color={COLORS.gold} />
                <Text style={styles.demoHintText}>
                  Demo: Use OTP <Text style={styles.demoCode}>123456</Text>
                </Text>
              </View>
            )}
          </ScrollView>
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
    paddingBottom: SPACING.xl,
  },

  // Orbs
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
    backgroundColor: COLORS.primary,
    opacity: 0.08,
  },
  orb2: {
    width: 250,
    height: 250,
    bottom: 50,
    left: -80,
    backgroundColor: COLORS.gold,
    opacity: 0.06,
  },

  // Header
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Icon
  iconContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Title
  titleSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.5)',
  },
  phoneNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 4,
  },

  // Hidden input
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },

  // OTP boxes
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  otpBox: {
    width: (width - SPACING.xl * 2 - SPACING.sm * 5) / 6,
    maxWidth: 52,
    height: 60,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0,200,83,0.08)',
  },
  otpBoxActive: {
    borderColor: COLORS.primary,
  },
  otpDigit: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
  },
  otpDigitFilled: {
    color: '#fff',
  },
  cursor: {
    position: 'absolute',
    width: 2,
    height: 24,
    backgroundColor: COLORS.primary,
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },

  // Button
  buttonContainer: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  verifyButton: {
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

  // Resend
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  resendText: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.5)',
  },
  resendLink: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  resendLinkDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },

  // Demo hint
  demoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: BORDER_RADIUS.lg,
    alignSelf: 'center',
  },
  demoHintText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gold,
  },
  demoCode: {
    fontWeight: '700',
    color: '#fff',
  },
});
