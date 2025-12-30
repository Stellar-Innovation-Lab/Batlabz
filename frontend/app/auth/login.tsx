import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Animated, Easing, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://cricket-payments-1.preview.emergentagent.com';
const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Animations
  const ballY = useRef(new Animated.Value(-50)).current;
  const formY = useRef(new Animated.Value(30)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const featuresY = useRef(new Animated.Value(20)).current;
  const glowPulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Ball entrance
    Animated.spring(ballY, {
      toValue: 0,
      tension: 40,
      friction: 10,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Form fade in
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.spring(formY, {
        toValue: 0,
        tension: 50,
        friction: 12,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.spring(featuresY, {
        toValue: 0,
        tension: 50,
        friction: 12,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.5,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 8) {
      alert('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = phone.startsWith('+971') ? phone : `+971${phone}`;
      await axios.post(`${BACKEND_URL}/api/auth/request-otp`, { phone: fullPhone });
      router.push(`/auth/otp?phone=${encodeURIComponent(fullPhone)}`);
    } catch (error) {
      console.error('OTP request failed:', error);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0a0e1a', '#1a1f2e', '#0f172a']} style={styles.gradient}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* Background Elements */}
            <View style={styles.backgroundElements}>
              <Animated.View style={[styles.glow, { opacity: glowPulse }]} />
              <View style={[styles.circle, styles.circle1]} />
              <View style={[styles.circle, styles.circle2]} />
            </View>

            {/* Header with Ball */}
            <View style={styles.header}>
              <Animated.View style={[styles.ballWrapper, { transform: [{ translateY: ballY }] }]}>
                <View style={styles.cricketBall}>
                  <View style={styles.seam} />
                  <View style={[styles.seam, styles.seam2]} />
                  <View style={styles.ballShine} />
                </View>
              </Animated.View>

              <View style={styles.logoBox}>
                <View style={styles.logoIconContainer}>
                  <Ionicons name="flash" size={24} color="#000" style={styles.logoIcon} />
                </View>
                <Text style={styles.title}>BATLABZ</Text>
              </View>
              
              <View style={styles.taglineBadge}>
                <Text style={styles.tagline}>PAY & PLAY CRICKET</Text>
              </View>
              <Text style={styles.welcomeText}>🏏 Welcome Back!</Text>
              <Text style={styles.subtitle}>Join UAE's premier cricket community</Text>
            </View>

            {/* Login Form */}
            <Animated.View style={[styles.formContainer, { opacity: formOpacity, transform: [{ translateY: formY }] }]}>
              <View style={styles.card}>
                <Text style={styles.label}>MOBILE NUMBER</Text>
                <View style={styles.phoneInputContainer}>
                  <View style={styles.countryCode}>
                    <Text style={styles.flag}>🇦🇪</Text>
                    <Text style={styles.codeText}>+971</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="50 123 4567"
                    placeholderTextColor="#64748b"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    maxLength={11}
                    editable={!loading}
                  />
                </View>
                <Text style={styles.helperText}>We'll send a 6-digit verification code via SMS</Text>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleSendOTP}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient colors={['#4ade80', '#22c55e']} style={styles.buttonGradient}>
                    {loading ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.buttonText}>Get Started</Text>
                        <Ionicons name="arrow-forward" size={20} color="#000" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.termsText}>
                  By continuing, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms & Privacy Policy</Text>
                </Text>
              </View>
            </Animated.View>

            {/* Features */}
            <Animated.View style={[styles.featuresContainer, { transform: [{ translateY: featuresY }] }]}>
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Ionicons name="calendar" size={20} color="#4ade80" />
                </View>
                <Text style={styles.featureText}>Schedule</Text>
              </View>
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Ionicons name="card" size={20} color="#4ade80" />
                </View>
                <Text style={styles.featureText}>Pay & Split</Text>
              </View>
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Ionicons name="location" size={20} color="#4ade80" />
                </View>
                <Text style={styles.featureText}>Book</Text>
              </View>
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Ionicons name="trophy" size={20} color="#4ade80" />
                </View>
                <Text style={styles.featureText}>Compete</Text>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  backgroundElements: { ...StyleSheet.absoluteFillObject },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#4ade80',
    top: '30%',
    left: '50%',
    marginLeft: -100,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(74, 222, 128, 0.03)',
  },
  circle1: { width: 300, height: 300, top: -100, left: -100 },
  circle2: { width: 250, height: 250, bottom: 100, right: -80 },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  ballWrapper: { marginBottom: 24 },
  cricketBall: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  seam: {
    position: 'absolute',
    width: 55,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
    transform: [{ rotate: '25deg' }],
  },
  seam2: { transform: [{ rotate: '-25deg' }] },
  ballShine: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    top: 18,
    left: 22,
  },
  logoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#4ade80',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  logoIcon: { transform: [{ rotate: '-15deg' }] },
  title: {
    fontSize: 44,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  taglineBadge: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 2,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
  },
  formContainer: { paddingHorizontal: 20 },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 14,
    letterSpacing: 1.2,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#334155',
    marginBottom: 14,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 14,
    borderRightWidth: 1,
    borderRightColor: '#334155',
  },
  flag: { fontSize: 26, marginRight: 10 },
  codeText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  phoneInput: {
    flex: 1,
    fontSize: 19,
    color: '#fff',
    paddingVertical: 16,
    paddingLeft: 14,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 24,
    lineHeight: 18,
  },
  button: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#000',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  termsText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 17,
  },
  termsLink: { color: '#4ade80', fontWeight: '600' },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  feature: { alignItems: 'center', width: 70 },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
  },
  featureText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
  },
});