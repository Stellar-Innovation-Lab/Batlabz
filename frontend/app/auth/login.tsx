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
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(50)).current;
  const glowPulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(cardY, { toValue: 0, tension: 50, friction: 12, delay: 200, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(glowPulse, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(glowPulse, { toValue: 0.5, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 8) { alert('Please enter a valid phone number'); return; }
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
        
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            
            <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
              <View style={styles.ballWrapper}>
                <View style={styles.cricketBall}>
                  <View style={styles.seam} />
                  <View style={[styles.seam, { transform: [{ rotate: '-50deg' }] }]} />
                  <View style={styles.ballShine} />
                </View>
              </View>

              <View style={styles.logoRow}>
                <LinearGradient colors={['#10B981', '#16A34A']} style={styles.iconContainer}>
                  <Ionicons name="flash" size={32} color="#fff" />
                </LinearGradient>
                <Text style={styles.title}>BATLABZ</Text>
              </View>
              
              <LinearGradient colors={['#10B981', '#16A34A']} style={styles.taglineBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.tagline}>PAY & PLAY CRICKET</Text>
              </LinearGradient>
              <Text style={styles.welcomeText}>🏏 Welcome!</Text>
              <Text style={styles.subtitle}>UAE's premier cricket community</Text>
            </Animated.View>

            <Animated.View style={[styles.cardContainer, { transform: [{ translateY: cardY }] }]}>
              <View style={styles.card}>
                <Text style={styles.label}>MOBILE NUMBER</Text>
                <View style={styles.phoneInputContainer}>
                  <View style={styles.countryCode}>
                    <Text style={styles.flag}>🇦🇪</Text>
                    <View style={styles.divider} />
                    <Text style={styles.codeText}>+971</Text>
                  </View>
                  <TextInput style={styles.phoneInput} placeholder="50 123 4567" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" value={phone} onChangeText={setPhone} maxLength={11} editable={!loading} />
                </View>
                <View style={styles.helperRow}>
                  <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                  <Text style={styles.helperText}>Secure • Instant verification</Text>
                </View>

                <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSendOTP} disabled={loading} activeOpacity={0.9}>
                  <LinearGradient colors={['#10B981', '#16A34A']} style={styles.buttonGradient}>
                    {loading ? <ActivityIndicator color="#fff" size="small" /> : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.buttonText}>Get Started</Text>
                        <View style={styles.arrowCircle}>
                          <Ionicons name="arrow-forward" size={18} color="#10B981" />
                        </View>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.termsText}>By continuing, you agree to <Text style={styles.termsLink}>Terms & Privacy Policy</Text></Text>
              </View>
            </Animated.View>

            <View style={styles.featuresGrid}>
              {[{ icon: 'calendar', text: 'Schedule', color: '#10B981' }, { icon: 'card', text: 'Pay & Split', color: '#F59E0B' }, { icon: 'location', text: 'Book Ground', color: '#3B82F6' }, { icon: 'trophy', text: 'Compete', color: '#EF4444' }].map((f, i) => (
                <View key={i} style={styles.featureItem}>
                  <View style={[styles.featureIcon, { backgroundColor: f.color + '15' }]}>
                    <Ionicons name={f.icon as any} size={20} color={f.color} />
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
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  glow: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#10B981', top: 100, left: '50%', marginLeft: -125, shadowColor: '#10B981', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 60 },
  ring: { position: 'absolute', borderRadius: 1000, borderWidth: 2, borderColor: 'rgba(16, 185, 129, 0.1)' },
  ring1: { width: 400, height: 400, top: 50, left: '50%', marginLeft: -200 },
  ring2: { width: 550, height: 550, top: -25, left: '50%', marginLeft: -275 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24 },
  ballWrapper: { marginBottom: 24 },
  cricketBall: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#DC2626', justifyContent: 'center', alignItems: 'center', shadowColor: '#DC2626', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 12 },
  seam: { position: 'absolute', width: 65, height: 4, backgroundColor: '#fff', borderRadius: 2, transform: [{ rotate: '25deg' }] },
  ballShine: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255, 255, 255, 0.25)', top: 18, left: 25 },
  ballShine1: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255, 255, 255, 0.25)', top: 18, left: 25 },
  ballShine2: { position: 'absolute', width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(255, 255, 255, 0.15)', top: 32, left: 42 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconContainer: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12, shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12 },
  title: { fontSize: 48, fontWeight: '900', color: '#111827', letterSpacing: -1.5 },
  badge: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 25, marginBottom: 20, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: '800', color: '#fff', letterSpacing: 2.5 },
  welcomeText: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', fontWeight: '500' },
  cardContainer: { paddingHorizontal: 24 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  label: { fontSize: 13, fontWeight: '800', color: '#111827', marginBottom: 12, letterSpacing: 1.2 },
  phoneInputContainer: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, borderWidth: 2, borderColor: '#E5E7EB', marginBottom: 12 },
  countryCode: { flexDirection: 'row', alignItems: 'center', paddingRight: 12 },
  flag: { fontSize: 24, marginRight: 12 },
  divider: { width: 2, height: 24, backgroundColor: '#E5E7EB', marginRight: 12 },
  codeText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  phoneInput: { flex: 1, fontSize: 18, color: '#111827', paddingVertical: 16, fontWeight: '600' },
  helperRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
  helperText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  button: { borderRadius: 16, overflow: 'hidden', marginBottom: 20, shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16 },
  buttonGradient: { paddingVertical: 18 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  arrowCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  termsText: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', lineHeight: 16 },
  termsLink: { color: '#10B981', fontWeight: '700' },
  featuresGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 24, marginTop: 32 },
  featureItem: { alignItems: 'center', width: 70 },
  featureIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  featureText: { fontSize: 11, color: '#6B7280', fontWeight: '600', textAlign: 'center' },
});