import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, StatusBar, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeInDown,
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';
const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Animation values
  const ballScale = useSharedValue(0);
  const ballY = useSharedValue(-50);
  const formOpacity = useSharedValue(0);

  useEffect(() => {
    // Ball drop animation
    ballScale.value = withDelay(200, withSpring(1, { damping: 8 }));
    ballY.value = withDelay(
      200,
      withSequence(
        withSpring(0, { damping: 8 }),
        withSpring(-20, { damping: 15 }),
        withSpring(0, { damping: 15 })
      )
    );

    // Form fade in
    formOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
  }, []);

  const ballAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: ballScale.value },
      { translateY: ballY.value },
    ],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

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
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Animated Background Circles */}
            <View style={styles.circlesContainer}>
              <Animated.View style={[styles.circle, styles.circle1]} entering={FadeIn.delay(100).duration(1000)} />
              <Animated.View style={[styles.circle, styles.circle2]} entering={FadeIn.delay(300).duration(1000)} />
            </View>

            {/* Header with animated cricket ball */}
            <View style={styles.header}>
              <Animated.View style={[styles.ballWrapper, ballAnimatedStyle]}>
                <View style={styles.cricketBall}>
                  <View style={styles.seam} />
                  <View style={[styles.seam, styles.seam2]} />
                </View>
              </Animated.View>
              
              <Animated.Text style={styles.title} entering={SlideInRight.delay(500).springify()}>BATLABZ</Animated.Text>
              <Animated.View style={styles.taglineBox} entering={FadeInDown.delay(700)}>
                <Text style={styles.tagline}>PAY & PLAY CRICKET</Text>
              </Animated.View>
              <Animated.Text style={styles.welcomeText} entering={FadeInDown.delay(900)}>🏏 Welcome!</Animated.Text>
              <Animated.Text style={styles.subtitle} entering={FadeInDown.delay(1000)}>Join UAE's premier cricket community</Animated.Text>
            </View>

            {/* Login Form */}
            <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
              <View style={styles.card}>
                <Animated.View entering={FadeInDown.delay(1100)}>
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
                    />
                  </View>
                  <Text style={styles.helperText}>We'll send a verification code via SMS</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(1200)}>
                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSendOTP}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#4ade80', '#22c55e']}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {loading ? (
                        <Text style={styles.buttonText}>Sending...</Text>
                      ) : (
                        <>
                          <Text style={styles.buttonText}>Get Started</Text>
                          <Ionicons name="arrow-forward" size={20} color="#000" style={{ marginLeft: 8 }} />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.Text style={styles.termsText} entering={FadeInDown.delay(1300)}>
                  By continuing, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms & Privacy Policy</Text>
                </Animated.Text>
              </View>
            </Animated.View>

            {/* Bottom Features */}
            <Animated.View style={styles.featuresContainer} entering={FadeInDown.delay(1400)}>
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
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  circlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    left: -100,
  },
  circle2: {
    width: 250,
    height: 250,
    bottom: 100,
    right: -100,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  ballWrapper: {
    marginBottom: 24,
  },
  cricketBall: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  seam: {
    position: 'absolute',
    width: 50,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
    transform: [{ rotate: '20deg' }],
  },
  seam2: {
    transform: [{ rotate: '-20deg' }],
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 4,
    marginBottom: 12,
    textShadowColor: 'rgba(74, 222, 128, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  taglineBox: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  tagline: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 2,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 12,
    letterSpacing: 1,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#334155',
    marginBottom: 12,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#334155',
  },
  flag: {
    fontSize: 24,
    marginRight: 8,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    color: '#fff',
    paddingVertical: 16,
    paddingLeft: 12,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 24,
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  termsText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  termsLink: {
    color: '#4ade80',
    fontWeight: '600',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  feature: {
    alignItems: 'center',
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
});