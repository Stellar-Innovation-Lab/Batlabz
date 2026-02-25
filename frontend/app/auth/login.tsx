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
  const headerY = useRef(new Animated.Value(-30)).current;
  const cardY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(headerY, { toValue: 0, tension: 50, friction: 12, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.spring(cardY, { toValue: 0, tension: 50, friction: 12, useNativeDriver: true }),
    ]).start();

    Animated.loop(Animated.sequence([
      Animated.timing(glowPulse, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(glowPulse, { toValue: 0.5, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 8) { alert('Please enter valid phone'); return; }
    setLoading(true);
    try {
      const fullPhone = phone.startsWith('+971') ? phone : `+971${phone}`;
      await axios.post(`${BACKEND_URL}/api/auth/request-otp`, { phone: fullPhone });
      router.push(`/auth/otp?phone=${encodeURIComponent(fullPhone)}`);
    } catch (error) { alert('Failed to send OTP'); } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.background}>
        <Animated.View style={[styles.glow, { opacity: glowPulse }]} />
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            
            <Animated.View style={[styles.header, { opacity, transform: [{ translateY: headerY }] }]}>
              <View style={styles.iconContainer}>
                <View style={styles.iconGlowBg} />
                <LinearGradient colors={['#F59E0B', '#FDBA74']} style={styles.iconBg}>
                  <Ionicons name="flash" size={44} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={styles.title}>BATLABZ</Text>
              <View style={styles.taglineWrapper}>
                <LinearGradient colors={['#1E3A8A', '#1E40AF']} style={styles.taglineBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.taglineText}>PAY & PLAY CRICKET</Text>
                </LinearGradient>
              </View>
              <Text style={styles.subtitle}>Welcome Back!</Text>
              <Text style={styles.description}>UAE's trusted cricket platform</Text>
            </Animated.View>

            <Animated.View style={[styles.formContainer, { transform: [{ translateY: cardY }] }]}>
              <View style={styles.card}>
                <View style={styles.cardPattern} />
                <View style={styles.cardContent}>
                  <Text style={styles.label}>MOBILE NUMBER</Text>
                  <View style={styles.phoneInput}>
                    <View style={styles.countryCode}>
                      <Text style={styles.flag}>🇦🇪</Text>
                      <View style={styles.divider} />
                      <Text style={styles.codeText}>+971</Text>
                    </View>
                    <TextInput style={styles.input} placeholder="50 123 4567" placeholderTextColor="#94A3B8" keyboardType="phone-pad" value={phone} onChangeText={setPhone} maxLength={11} editable={!loading} />
                  </View>
                  <View style={styles.helperRow}>
                    <Ionicons name="shield-checkmark" size={15} color="#1E3A8A" />
                    <Text style={styles.helperText}>Secure • Instant verification</Text>
                  </View>

                  <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSendOTP} disabled={loading} activeOpacity={0.92}>
                    <LinearGradient colors={['#1E3A8A', '#1E40AF']} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                      <View style={styles.buttonShine} />
                      {loading ? <ActivityIndicator color="#fff" size="small" /> : (
                        <View style={styles.buttonContent}>
                          <Text style={styles.buttonText}>Get Started</Text>
                          <View style={styles.arrowCircle}>
                            <Ionicons name="arrow-forward" size={20} color="#1E3A8A" />
                          </View>
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <Text style={styles.terms}>By continuing, you agree to <Text style={styles.termsLink}>Terms & Privacy</Text></Text>
                </View>
              </View>
            </Animated.View>

            <View style={styles.features}>
              {[{ icon: 'calendar', text: 'Schedule', color: '#1E3A8A' }, { icon: 'card', text: 'Payments', color: '#F59E0B' }, { icon: 'location', text: 'Grounds', color: '#3B82F6' }, { icon: 'trophy', text: 'Compete', color: '#8B5CF6' }].map((f, i) => (
                <View key={i} style={styles.feature}>
                  <View style={[styles.featureIcon, { backgroundColor: f.color + '15', borderColor: f.color + '30' }]}>
                    <Ionicons name={f.icon as any} size={22} color={f.color} />
                  </View>
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              ))}
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, backgroundColor: '#F8FAFC' },
  glow: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#1E3A8A', top: 120, left: '50%', marginLeft: -150, shadowColor: '#1E3A8A', shadowOpacity: 0.15, shadowRadius: 60 },
  circle1: { position: 'absolute', width: 450, height: 450, borderRadius: 225, borderWidth: 1.5, borderColor: 'rgba(30,58,138,0.08)', top: -100, left: -80 },
  circle2: { position: 'absolute', width: 350, height: 350, borderRadius: 175, borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.1)', bottom: -80, right: -60 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 },
  iconContainer: { marginBottom: 32, position: 'relative' },
  iconGlowBg: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: '#F59E0B', opacity: 0.15, top: -20, left: -20 },
  iconBg: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.4, shadowRadius: 24, borderWidth: 4, borderColor: 'rgba(255,255,255,0.2)', zIndex: 1 },
  title: { fontSize: 52, fontWeight: '900', color: '#0F172A', marginBottom: 20, letterSpacing: -2 },
  taglineWrapper: { marginBottom: 20 },
  taglineBadge: { paddingHorizontal: 26, paddingVertical: 11, borderRadius: 26, shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.95)' },
  taglineText: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 3 },
  subtitle: { fontSize: 26, fontWeight: '800', color: '#0F172A', marginBottom: 10 },
  description: { fontSize: 16, color: '#64748B', fontWeight: '600' },
  formContainer: { paddingHorizontal: 24 },
  card: { backgroundColor: '#fff', borderRadius: 28, overflow: 'hidden', shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 28, borderWidth: 1.5, borderColor: '#F3F4F6', position: 'relative' },
  cardPattern: { position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: '#DBEAFE', opacity: 0.25 },
  cardContent: { padding: 32, zIndex: 1 },
  label: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 14, letterSpacing: 1.3, textTransform: 'uppercase' },
  phoneInput: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 18, paddingHorizontal: 18, paddingVertical: 4, borderWidth: 2, borderColor: '#E5E7EB', marginBottom: 14 },
  countryCode: { flexDirection: 'row', alignItems: 'center', paddingRight: 14 },
  flag: { fontSize: 26, marginRight: 14 },
  divider: { width: 2, height: 28, backgroundColor: '#E5E7EB', marginRight: 14 },
  codeText: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  input: { flex: 1, fontSize: 19, color: '#0F172A', paddingVertical: 18, fontWeight: '700' },
  helperRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 28 },
  helperText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  button: { borderRadius: 18, overflow: 'hidden', marginBottom: 22, shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.28, shadowRadius: 18 },
  buttonDisabled: { opacity: 0.6 },
  buttonGradient: { paddingVertical: 20, position: 'relative', overflow: 'hidden' },
  buttonShine: { position: 'absolute', top: 0, left: '-60%', width: '60%', height: '100%', backgroundColor: 'rgba(255,255,255,0.15)', transform: [{ skewX: '-25deg' }] },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 },
  buttonText: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  arrowCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  terms: { fontSize: 12, color: '#94A3B8', textAlign: 'center', lineHeight: 18 },
  termsLink: { color: '#1E3A8A', fontWeight: '800' },
  features: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 24, marginTop: 40 },
  feature: { alignItems: 'center' },
  featureIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 2 },
  featureText: { fontSize: 12, color: '#64748B', fontWeight: '700' },
});