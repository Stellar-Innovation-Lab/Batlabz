import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Animated, Easing, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const BACKEND_URL = 'https://cricket-payments-1.preview.emergentagent.com';
const { width: screenWidth } = Dimensions.get('window');

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
  const headerScale = useRef(new Animated.Value(0.9)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.4)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance choreography
    Animated.sequence([
      Animated.parallel([
        Animated.spring(headerScale, { toValue: 1, tension: 45, friction: 10, useNativeDriver: true }),
        Animated.timing(headerOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(cardY, { toValue: 0, tension: 50, friction: 12, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    ]).start();

    // Continuous animations
    Animated.loop(Animated.sequence([
      Animated.timing(glowPulse, { toValue: 0.8, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(glowPulse, { toValue: 0.4, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.timing(shimmer, { toValue: 1, duration: 3500, easing: Easing.linear, useNativeDriver: true })).start();
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

  const shimmerTranslate = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-screenWidth, screenWidth] });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.background}>
        
        {/* Background effects */}
        <Animated.View style={[styles.glow, { opacity: glowPulse }]} />
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]} />
        <View style={styles.meshOverlay} />
        
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            
            {/* Header with animations */}
            <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ scale: headerScale }] }]}>
              <View style={styles.iconContainer}>
                <View style={styles.iconGlowBg} />
                <LinearGradient colors={['#F59E0B', '#FDBA74']} style={styles.iconBg}>
                  <Ionicons name="flash" size={48} color="#fff" />
                </LinearGradient>
              </View>
              
              <Text style={styles.title}>BATLABZ</Text>
              
              <View style={styles.taglineWrapper}>
                <LinearGradient colors={['#1E3A8A', '#1E40AF']} style={styles.tagline} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.taglineText}>PAY & PLAY CRICKET</Text>
                </LinearGradient>
              </View>
              
              <Text style={styles.subtitle}>Welcome Back! 👋</Text>
              <Text style={styles.description}>UAE's premier cricket platform</Text>
            </Animated.View>

            {/* Form card with animation */}
            <Animated.View style={[styles.formContainer, { opacity: cardOpacity, transform: [{ translateY: cardY }] }]}>
              <View style={styles.card}>
                <View style={styles.cardPattern} />
                <View style={styles.cardContent}>
                  
                  <Text style={styles.label}>MOBILE NUMBER</Text>
                  
                  <View style={styles.phoneInputContainer}>
                    <View style={styles.countryCode}>
                      <Text style={styles.flag}>\ud83c\udde6\ud83c\uddea</Text>
                      <View style={styles.divider} />
                      <Text style={styles.codeText}>+971</Text>
                    </View>
                    <TextInput 
                      style={styles.phoneInput} 
                      placeholder="50 123 4567" 
                      placeholderTextColor="#94A3B8" 
                      keyboardType="phone-pad" 
                      value={phone} 
                      onChangeText={setPhone} 
                      maxLength={11} 
                      editable={!loading} 
                    />
                  </View>
                  
                  <View style={styles.helperRow}>
                    <Ionicons name="shield-checkmark" size={15} color="#1E3A8A" />
                    <Text style={styles.helperText}>Secure \u2022 Instant verification</Text>
                  </View>

                  <TouchableOpacity 
                    style={[styles.button, loading && styles.buttonDisabled]} 
                    onPress={handleSendOTP} 
                    disabled={loading}
                    activeOpacity={0.92}
                  >
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

                  <Text style={styles.termsText}>
                    By continuing, you agree to <Text style={styles.termsLink}>Terms & Privacy</Text>
                  </Text>
                  
                </View>
              </View>
            </Animated.View>

            {/* Feature icons */}
            <View style={styles.featuresContainer}>
              {[
                { icon: 'calendar', text: 'Schedule', color: '#1E3A8A' },
                { icon: 'card', text: 'Payments', color: '#F59E0B' },
                { icon: 'location', text: 'Grounds', color: '#3B82F6' },
                { icon: 'trophy', text: 'Compete', color: '#8B5CF6' },
              ].map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={[styles.featureIcon, { backgroundColor: feature.color + '15', borderColor: feature.color + '30' }]}>
                    <Ionicons name={feature.icon as any} size={24} color={feature.color} />
                  </View>
                  <Text style={styles.featureText}>{feature.text}</Text>
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
  background: { flex: 1, backgroundColor: '#F8FAFC', position: 'relative' },
  
  // Background effects
  glow: { 
    position: 'absolute', 
    width: 320, 
    height: 320, 
    borderRadius: 160, 
    backgroundColor: '#1E3A8A', 
    top: 100, 
    left: '50%',
    marginLeft: -160,
    opacity: 0.12,
    shadowColor: '#1E3A8A', 
    shadowOpacity: 0.15, 
    shadowRadius: 60 
  },
  circle1: { 
    position: 'absolute', 
    width: 450, 
    height: 450, 
    borderRadius: 225, 
    borderWidth: 2, 
    borderColor: 'rgba(30,58,138,0.08)', 
    top: -100, 
    left: -80 
  },
  circle2: { 
    position: 'absolute', 
    width: 350, 
    height: 350, 
    borderRadius: 175, 
    borderWidth: 2, 
    borderColor: 'rgba(245,158,11,0.1)', 
    bottom: -80, 
    right: -60 
  },
  shimmer: { 
    position: 'absolute', 
    width: 120, 
    height: '100%', 
    backgroundColor: 'rgba(30,58,138,0.04)', 
    transform: [{ skewX: '-20deg' }] 
  },
  meshOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(248,250,252,0.3)' 
  },
  
  keyboardView: { flex: 1, zIndex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  
  // Header
  header: { 
    alignItems: 'center', 
    paddingTop: 70, 
    paddingBottom: 40, 
    paddingHorizontal: 24 
  },
  iconContainer: { 
    marginBottom: 36, 
    position: 'relative' 
  },
  iconGlowBg: { 
    position: 'absolute', 
    width: 150, 
    height: 150, 
    borderRadius: 75, 
    backgroundColor: '#F59E0B', 
    opacity: 0.15, 
    top: -15, 
    left: -15 
  },
  iconBg: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#F59E0B', 
    shadowOffset: { width: 0, height: 14 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 26, 
    borderWidth: 4, 
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 1,
  },
  title: { 
    fontSize: 56, 
    fontWeight: '900', 
    color: '#0F172A', 
    marginBottom: 24, 
    letterSpacing: -2.5 
  },
  taglineWrapper: { 
    marginBottom: 22 
  },
  tagline: { 
    paddingHorizontal: 28, 
    paddingVertical: 12, 
    borderRadius: 28, 
    shadowColor: '#1E3A8A', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 16, 
    borderWidth: 2.5, 
    borderColor: 'rgba(255,255,255,0.95)' 
  },
  taglineText: { 
    fontSize: 14, 
    fontWeight: '900', 
    color: '#fff', 
    letterSpacing: 4 
  },
  subtitle: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#0F172A', 
    marginBottom: 10 
  },
  description: { 
    fontSize: 16, 
    color: '#64748B', 
    fontWeight: '600' 
  },
  
  // Form card
  formContainer: { 
    paddingHorizontal: 24 
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 32, 
    overflow: 'hidden', 
    shadowColor: '#1E3A8A', 
    shadowOffset: { width: 0, height: 16 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 32, 
    borderWidth: 2, 
    borderColor: '#F3F4F6',
    position: 'relative',
  },
  cardPattern: { 
    position: 'absolute', 
    right: -50, 
    top: -50, 
    width: 180, 
    height: 180, 
    borderRadius: 90, 
    backgroundColor: '#DBEAFE', 
    opacity: 0.3 
  },
  cardContent: { 
    padding: 36, 
    zIndex: 1 
  },
  
  // Input
  label: { 
    fontSize: 14, 
    fontWeight: '900', 
    color: '#0F172A', 
    marginBottom: 16, 
    letterSpacing: 1.5, 
    textTransform: 'uppercase' 
  },
  phoneInputContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#F8FAFC', 
    borderRadius: 20, 
    paddingHorizontal: 20, 
    paddingVertical: 6, 
    borderWidth: 2.5, 
    borderColor: '#E5E7EB', 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  countryCode: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingRight: 16 
  },
  flag: { 
    fontSize: 28, 
    marginRight: 14 
  },
  divider: { 
    width: 2.5, 
    height: 30, 
    backgroundColor: '#E5E7EB', 
    marginRight: 16 
  },
  codeText: { 
    fontSize: 19, 
    fontWeight: '900', 
    color: '#0F172A' 
  },
  phoneInput: { 
    flex: 1, 
    fontSize: 20, 
    color: '#0F172A', 
    paddingVertical: 20, 
    fontWeight: '800' 
  },
  helperRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginBottom: 32 
  },
  helperText: { 
    fontSize: 13, 
    color: '#64748B', 
    fontWeight: '600' 
  },
  
  // Button
  button: { 
    borderRadius: 20, 
    overflow: 'hidden', 
    marginBottom: 24, 
    shadowColor: '#1E3A8A', 
    shadowOffset: { width: 0, height: 12 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 20 
  },
  buttonDisabled: { 
    opacity: 0.6 
  },
  buttonGradient: { 
    paddingVertical: 22, 
    position: 'relative', 
    overflow: 'hidden' 
  },
  buttonShine: { 
    position: 'absolute', 
    top: 0, 
    left: '-70%', 
    width: '70%', 
    height: '100%', 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    transform: [{ skewX: '-25deg' }] 
  },
  buttonContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 16 
  },
  buttonText: { 
    fontSize: 19, 
    fontWeight: '900', 
    color: '#fff', 
    letterSpacing: 0.5 
  },
  arrowCircle: { 
    width: 38, 
    height: 38, 
    borderRadius: 19, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 6 
  },
  termsText: { 
    fontSize: 12, 
    color: '#94A3B8', 
    textAlign: 'center', 
    lineHeight: 20 
  },
  termsLink: { 
    color: '#1E3A8A', 
    fontWeight: '800' 
  },
  
  // Features
  featuresContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    paddingHorizontal: 24, 
    marginTop: 48 
  },
  featureItem: { 
    alignItems: 'center' 
  },
  featureIcon: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12, 
    borderWidth: 2.5 
  },
  featureText: { 
    fontSize: 12, 
    color: '#64748B', 
    fontWeight: '700' 
  },
});
