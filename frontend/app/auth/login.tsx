import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const BACKEND_URL = 'https://cricket-payments-1.preview.emergentagent.com';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Animations
  const headerY = useRef(new Animated.Value(-50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(100)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const featuresY = useRef(new Animated.Value(50)).current;
  const featuresOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.4)).current;
  const ringScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Sequential animations for smooth entrance
    Animated.sequence([
      Animated.parallel([
        Animated.spring(headerY, { toValue: 0, tension: 40, friction: 10, useNativeDriver: true }),
        Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(cardY, { toValue: 0, tension: 50, friction: 12, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(featuresY, { toValue: 0, tension: 50, friction: 12, useNativeDriver: true }),
        Animated.timing(featuresOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();

    // Continuous animations
    Animated.loop(Animated.sequence([
      Animated.timing(glowPulse, { toValue: 0.8, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(glowPulse, { toValue: 0.4, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(ringScale, { toValue: 1.1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(ringScale, { toValue: 0.9, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 8) { alert('Please enter a valid phone number'); return; }
    setLoading(true);
    try {
      const fullPhone = phone.startsWith('+971') ? phone : `+971${phone}`;
      await axios.post(`${BACKEND_URL}/api/auth/request-otp`, { phone: fullPhone });
      router.push(`/auth/otp?phone=${encodeURIComponent(fullPhone)}`);
    } catch (error) { console.error('OTP failed:', error); alert('Failed to send OTP'); } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0033A0', '#001F5C', '#000814']} style={styles.gradient}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            
            {/* Animated background elements */}
            <Animated.View style={[styles.glow, { opacity: glowPulse }]} />
            <Animated.View style={[styles.ring, { transform: [{ scale: ringScale }] }]} />
            <Animated.View style={[styles.ring2, { transform: [{ scale: ringScale }] }]} />

            {/* Header with dramatic entrance */}
            <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerY }] }]}>
              {/* Floating orbs */}
              <View style={styles.orbContainer}>
                <View style={[styles.orb, styles.orb1]} />
                <View style={[styles.orb, styles.orb2]} />
              </View>

              {/* Cricket ball with glow */}
              <View style={styles.ballWrapper}>
                <View style={styles.ballGlow} />
                <View style={styles.cricketBall}>
                  <View style={styles.seam} />
                  <View style={[styles.seam, { transform: [{ rotate: '-50deg' }] }]} />
                  <View style={styles.ballShine} />
                </View>
              </View>

              {/* Logo with lightning */}
              <View style={styles.logoRow}>
                <LinearGradient colors={['#FF9933', '#FFB366']} style={styles.lightningIcon}>
                  <Ionicons name="flash" size={32} color="#fff" />
                </LinearGradient>
                <Text style={styles.title}>BATLABZ</Text>
              </View>
              
              <LinearGradient colors={['#FF9933', '#FFB366']} style={styles.taglineBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.tagline}>PAY & PLAY CRICKET</Text>
              </LinearGradient>
              <Text style={styles.welcomeText}>🏏 Welcome Back, Champ!</Text>
              <Text style={styles.subtitle}>India's most trusted cricket platform</Text>
            </Animated.View>

            {/* Login card with glassmorphism */}
            <Animated.View style={[styles.formContainer, { opacity: cardOpacity, transform: [{ translateY: cardY }] }]}>
              <View style={styles.glassCard}>
                <View style={styles.cardInner}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>MOBILE NUMBER</Text>
                    <View style={styles.phoneInputContainer}>
                      <View style={styles.countryCode}>
                        <Text style={styles.flag}>🇮🇳</Text>
                        <View style={styles.divider} />
                        <Text style={styles.codeText}>+971</Text>
                      </View>
                      <TextInput style={styles.phoneInput} placeholder="50 123 4567" placeholderTextColor="rgba(15, 23, 42, 0.4)" keyboardType="phone-pad" value={phone} onChangeText={setPhone} maxLength={11} editable={!loading} />
                    </View>
                    <View style={styles.inputHelper}>
                      <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                      <Text style={styles.helperText}>Secure • Instant • No password needed</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSendOTP} disabled={loading} activeOpacity={0.9}>
                    <LinearGradient colors={['#0033A0', '#001F5C']} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <View style={styles.buttonShine} />
                      {loading ? <ActivityIndicator color="#fff" size="small" /> : (
                        <View style={styles.buttonContent}>
                          <Text style={styles.buttonText}>Get Started</Text>
                          <View style={styles.arrowCircle}>
                            <Ionicons name="arrow-forward" size={18} color="#0033A0" />
                          </View>
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <Text style={styles.termsText}>By continuing, you agree to <Text style={styles.termsLink}>Terms & Privacy</Text></Text>
                </View>
              </View>
            </Animated.View>

            {/* Feature pills with entrance animation */}
            <Animated.View style={[styles.featuresContainer, { opacity: featuresOpacity, transform: [{ translateY: featuresY }] }]}>
              {[
                { icon: 'calendar-outline', text: 'Schedule Matches', color: '#42C0E5' },
                { icon: 'wallet-outline', text: 'Split Payments', color: '#FF9933' },
                { icon: 'location-outline', text: 'Book Grounds', color: '#4D7FDB' },
                { icon: 'trophy-outline', text: 'Track Stats', color: '#FFD700' },
              ].map((f, i) => (
                <View key={i} style={styles.featurePill}>
                  <View style={[styles.featureIconBg, { backgroundColor: f.color + '20' }]}>
                    <Ionicons name={f.icon as any} size={18} color={f.color} />
                  </View>
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              ))}
            </Animated.View>

            {/* Trust indicators */}
            <View style={styles.trustContainer}>
              <View style={styles.trustBadge}>
                <Ionicons name="lock-closed" size={12} color="#10b981" />
                <Text style={styles.trustText}>Bank-grade security</Text>
              </View>
              <View style={styles.trustBadge}>
                <Ionicons name="people" size={12} color="#42C0E5" />
                <Text style={styles.trustText}>5,000+ players</Text>
              </View>
              <View style={styles.trustBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.trustText}>4.9 rating</Text>
              </View>
            </View>

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
  glow: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#42C0E5', top: 100, left: '50%', marginLeft: -125, shadowColor: '#42C0E5', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 60 },
  ring: { position: 'absolute', width: 400, height: 400, borderRadius: 200, borderWidth: 1, borderColor: 'rgba(66, 192, 229, 0.15)', top: 50, left: '50%', marginLeft: -200 },
  ring2: { position: 'absolute', width: 550, height: 550, borderRadius: 275, borderWidth: 1, borderColor: 'rgba(66, 192, 229, 0.08)', top: -25, left: '50%', marginLeft: -275 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 },
  orbContainer: { position: 'absolute', width: '100%', height: '100%' },
  orb: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255, 153, 51, 0.1)' },
  orb1: { top: 20, left: 20 },
  orb2: { bottom: 20, right: 20 },
  ballWrapper: { marginBottom: 20, position: 'relative' },
  ballGlow: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: '#DC2626', opacity: 0.2, top: -10, left: -10, shadowColor: '#DC2626', shadowOpacity: 0.6, shadowRadius: 30 },
  cricketBall: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#DC2626', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.4, shadowRadius: 25, elevation: 15 },
  seam: { position: 'absolute', width: 75, height: 4, backgroundColor: '#fff', borderRadius: 2, transform: [{ rotate: '25deg' }], shadowColor: '#fff', shadowOpacity: 0.6, shadowRadius: 3 },
  ballShine: { position: 'absolute', width: 35, height: 35, borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.25)', top: 22, left: 28 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  lightningIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12, shadowColor: '#FF9933', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
  title: { fontSize: 48, fontWeight: '900', color: '#fff', letterSpacing: -1.5, textShadowColor: 'rgba(66, 192, 229, 0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  taglineBadge: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 25, marginBottom: 20, shadowColor: '#FF9933', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  tagline: { fontSize: 12, fontWeight: '800', color: '#fff', letterSpacing: 3 },
  welcomeText: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#A9E1F5', textAlign: 'center', fontWeight: '500' },
  formContainer: { paddingHorizontal: 24, marginTop: 10 },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    padding: 4,
    shadowColor: '#0033A0',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardInner: { backgroundColor: '#fff', borderRadius: 28, padding: 32 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '800', color: '#0033A0', marginBottom: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  phoneInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#E7F3FB',
    shadowColor: '#0033A0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  countryCode: { flexDirection: 'row', alignItems: 'center', paddingRight: 16 },
  flag: { fontSize: 28, marginRight: 12 },
  divider: { width: 2, height: 24, backgroundColor: '#E2E8F0', marginRight: 16 },
  codeText: { fontSize: 18, fontWeight: '800', color: '#0033A0' },
  phoneInput: { flex: 1, fontSize: 20, color: '#0F172A', paddingVertical: 18, fontWeight: '600' },
  inputHelper: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingLeft: 4 },
  helperText: { fontSize: 12, color: '#64748B', marginLeft: 6, fontWeight: '500' },
  button: { borderRadius: 20, overflow: 'hidden', marginBottom: 20, shadowColor: '#0033A0', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 20 },
  buttonGradient: { paddingVertical: 20, position: 'relative', overflow: 'hidden' },
  buttonShine: { position: 'absolute', top: 0, left: '-50%', width: '50%', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', transform: [{ skewX: '-20deg' }] },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 18, fontWeight: '800', color: '#fff', marginRight: 12, letterSpacing: 0.5 },
  arrowCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  termsText: { fontSize: 12, color: '#94A3B8', textAlign: 'center', lineHeight: 18 },
  termsLink: { color: '#0033A0', fontWeight: '700' },
  featuresContainer: { paddingHorizontal: 24, marginTop: 24 },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  featureIconBg: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  featureText: { fontSize: 14, color: '#fff', fontWeight: '600', flex: 1 },
  trustContainer: { flexDirection: 'row', justifyContent: 'center', gap: 16, paddingHorizontal: 24, marginTop: 32 },
  trustBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  trustText: { fontSize: 11, color: 'rgba(255, 255, 255, 0.8)', marginLeft: 6, fontWeight: '600' },
});