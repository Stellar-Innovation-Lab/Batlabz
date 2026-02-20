import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const circleScale1 = useRef(new Animated.Value(0.8)).current;
  const circleScale2 = useRef(new Animated.Value(0.9)).current;
  const circleOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.3)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Circle animations
    Animated.parallel([
      Animated.timing(circleOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(circleScale1, { toValue: 1, tension: 20, friction: 7, useNativeDriver: true }),
      Animated.spring(circleScale2, { toValue: 1, tension: 25, friction: 8, delay: 200, useNativeDriver: true }),
    ]).start();

    // Logo entrance
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 40, friction: 10, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();

    // Continuous animations
    Animated.loop(Animated.sequence([
      Animated.timing(glowPulse, { toValue: 0.8, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(glowPulse, { toValue: 0.3, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(floatY, { toValue: -20, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(floatY, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.timing(rotate, { toValue: 1, duration: 20000, easing: Easing.linear, useNativeDriver: true })).start();

    const timer = setTimeout(() => router.replace('/auth/login'), 3500);
    return () => clearTimeout(timer);
  }, []);

  const rotateInterpolate = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#1E3A8A', '#1E40AF', '#2563EB']} style={styles.gradient}>
        
        {/* Animated background circles */}
        <Animated.View style={[styles.bgCircle1, { opacity: circleOpacity, transform: [{ scale: circleScale1 }, { rotate: rotateInterpolate }] }]} />
        <Animated.View style={[styles.bgCircle2, { opacity: circleOpacity, transform: [{ scale: circleScale2 }] }]} />
        <Animated.View style={[styles.bgCircle3, { opacity: circleOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) }]} />
        
        {/* Floating elements */}
        <Animated.View style={[styles.floatShape1, { transform: [{ translateY: floatY }] }]} />
        <Animated.View style={[styles.floatShape2, { transform: [{ translateY: floatY.interpolate({ inputRange: [-20, 0], outputRange: [0, -20] }) }] }]} />
        
        {/* Mesh gradient overlay */}
        <View style={styles.meshOverlay} />

        <View style={styles.content}>
          {/* Pulsing glow */}
          <Animated.View style={[styles.glow, { opacity: glowPulse }]} />
          
          {/* Logo */}
          <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
            <View style={styles.iconWrapper}>
              <LinearGradient colors={['#F59E0B', '#FCD34D']} style={styles.iconBg}>
                <Ionicons name="flash" size={48} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.logo}>BATLABZ</Text>
            <View style={styles.tagline}>
              <Text style={styles.taglineText}>PAY & PLAY CRICKET</Text>
            </View>
            <Text style={styles.subtitle}>🏏 Premium Platform for UAE</Text>
          </Animated.View>

          {/* Animated loading */}
          <Animated.View style={[styles.loadingContainer, { opacity: logoOpacity }]}>
            <View style={styles.loadingBar}>
              <Animated.View style={[styles.loadingProgress, { opacity: glowPulse }]} />
            </View>
            <View style={styles.loadingDots}>
              <Animated.View style={[styles.dot, { opacity: glowPulse }]} />
              <Animated.View style={[styles.dot, { opacity: glowPulse }]} />
              <Animated.View style={[styles.dot, { opacity: glowPulse }]} />
            </View>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  bgCircle1: { position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: 'rgba(59, 130, 246, 0.15)', top: -200, right: -100, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' },
  bgCircle2: { position: 'absolute', width: 350, height: 350, borderRadius: 175, backgroundColor: 'rgba(245, 158, 11, 0.1)', bottom: -100, left: -80, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' },
  bgCircle3: { position: 'absolute', width: 500, height: 500, borderRadius: 250, backgroundColor: 'rgba(255, 255, 255, 0.05)', top: height / 2 - 250, left: width / 2 - 250 },
  floatShape1: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(252, 211, 77, 0.15)', top: height * 0.2, left: width * 0.1, transform: [{ rotate: '45deg' }] },
  floatShape2: { position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(96, 165, 250, 0.15)', top: height * 0.7, right: width * 0.15, transform: [{ rotate: '-30deg' }] },
  meshOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(30, 58, 138, 0.05)' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, zIndex: 1 },
  glow: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#F59E0B', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 60 },
  logoContainer: { alignItems: 'center' },
  iconWrapper: { marginBottom: 32 },
  iconBg: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.4, shadowRadius: 20, borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)' },
  logo: { fontSize: 56, fontWeight: '900', color: '#fff', letterSpacing: -2, marginBottom: 20, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
  tagline: { backgroundColor: '#F59E0B', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 25, marginBottom: 20, shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  taglineText: { fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 3 },
  subtitle: { fontSize: 17, color: 'rgba(255,255,255,0.95)', fontWeight: '600', textAlign: 'center' },
  loadingContainer: { marginTop: 80, alignItems: 'center' },
  loadingBar: { width: 240, height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  loadingProgress: { width: '80%', height: '100%', backgroundColor: '#F59E0B', borderRadius: 3, shadowColor: '#F59E0B', shadowOpacity: 0.6, shadowRadius: 8 },
  loadingDots: { flexDirection: 'row', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#F59E0B', shadowColor: '#F59E0B', shadowOpacity: 0.6, shadowRadius: 6 },
});