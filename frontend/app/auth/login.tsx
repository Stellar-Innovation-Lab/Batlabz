import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const BACKEND_URL = 'https://cricket-payments-1.preview.emergentagent.com';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 12, delay: 200, useNativeDriver: true }),
    ]).start();
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <LinearGradient colors={['#4A90E2', '#357ABD']} style={styles.iconBg}>
              <Ionicons name="flash" size={36} color="#fff" />
            </LinearGradient>
            <Text style={styles.title}>BATLABZ</Text>
            <View style={styles.tagline}>
              <Text style={styles.taglineText}>PAY & PLAY CRICKET</Text>
            </View>
            <Text style={styles.subtitle}>Welcome Back!</Text>
            <Text style={styles.description}>UAE's trusted cricket platform</Text>
          </Animated.View>

          <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.card}>
              <Text style={styles.label}>MOBILE NUMBER</Text>
              <View style={styles.phoneInput}>
                <View style={styles.countryCode}>
                  <Text style={styles.flag}>🇦🇪</Text>
                  <View style={styles.divider} />
                  <Text style={styles.codeText}>+971</Text>
                </View>
                <TextInput style={styles.input} placeholder="50 123 4567" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" value={phone} onChangeText={setPhone} maxLength={11} editable={!loading} />
              </View>
              <View style={styles.helperRow}>
                <Ionicons name="shield-checkmark" size={14} color="#4A90E2" />
                <Text style={styles.helperText}>Secure • Instant verification</Text>
              </View>

              <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSendOTP} disabled={loading}>
                <LinearGradient colors={['#4A90E2', '#357ABD']} style={styles.buttonGradient}>
                  {loading ? <ActivityIndicator color="#fff" /> : (
                    <View style={styles.buttonContent}>
                      <Text style={styles.buttonText}>Get Started</Text>
                      <View style={styles.arrowCircle}>
                        <Ionicons name="arrow-forward" size={18} color="#4A90E2" />
                      </View>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.terms}>By continuing, you agree to <Text style={styles.termsLink}>Terms & Privacy</Text></Text>
            </View>
          </Animated.View>

          <View style={styles.features}>
            {[{ icon: 'calendar', text: 'Schedule' }, { icon: 'card', text: 'Pay & Split' }, { icon: 'location', text: 'Book' }, { icon: 'trophy', text: 'Play' }].map((f, i) => (
              <View key={i} style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Ionicons name={f.icon as any} size={20} color="#4A90E2" />
                </View>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 },
  iconBg: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
  title: { fontSize: 44, fontWeight: '900', color: '#212529', marginBottom: 16, letterSpacing: -1 },
  tagline: { backgroundColor: '#4A90E2', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 16 },
  taglineText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 2 },
  subtitle: { fontSize: 24, fontWeight: '700', color: '#212529', marginBottom: 8 },
  description: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  formContainer: { paddingHorizontal: 24 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20, borderWidth: 1, borderColor: '#F3F4F6' },
  label: { fontSize: 13, fontWeight: '800', color: '#212529', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' },
  phoneInput: { flexDirection: 'row', backgroundColor: '#F8F9FA', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, borderWidth: 2, borderColor: '#E5E7EB', marginBottom: 12 },
  countryCode: { flexDirection: 'row', alignItems: 'center', paddingRight: 12 },
  flag: { fontSize: 24, marginRight: 12 },
  divider: { width: 2, height: 24, backgroundColor: '#E5E7EB', marginRight: 12 },
  codeText: { fontSize: 16, fontWeight: '700', color: '#212529' },
  input: { flex: 1, fontSize: 18, color: '#212529', paddingVertical: 16, fontWeight: '600' },
  helperRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
  helperText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  button: { borderRadius: 16, overflow: 'hidden', marginBottom: 20, shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12 },
  buttonDisabled: { opacity: 0.6 },
  buttonGradient: { paddingVertical: 18 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  buttonText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  arrowCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  terms: { fontSize: 11, color: '#9CA3AF', textAlign: 'center' },
  termsLink: { color: '#4A90E2', fontWeight: '700' },
  features: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 24, marginTop: 32 },
  feature: { alignItems: 'center' },
  featureIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E0F2F7', justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#D0E7F0' },
  featureText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
});