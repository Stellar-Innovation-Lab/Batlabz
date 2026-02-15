import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  // Multiple animation values for complex choreography
  const mainScale = useRef(new Animated.Value(0)).current;
  const mainRotate = useRef(new Animated.Value(0)).current;
  const ballScale = useRef(new Animated.Value(0)).current;
  const ballY = useRef(new Animated.Value(-200)).current;
  const ballRotate = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(50)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const lightningScale = useRef(new Animated.Value(0)).current;
  const lightningRotate = useRef(new Animated.Value(-45)).current;
  const particles = Array(6).fill(0).map(() => ({
    x: useRef(new Animated.Value(0)).current,
    y: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(0)).current,
  }));
  const glowPulse = useRef(new Animated.Value(0.3)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const taglineY = useRef(new Animated.Value(30)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main container entrance
    Animated.spring(mainScale, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Ball dramatic entrance
    Animated.sequence([
      Animated.parallel([
        Animated.spring(ballScale, { toValue: 1.2, tension: 30, friction: 6, useNativeDriver: true }),
        Animated.spring(ballY, { toValue: 0, tension: 30, friction: 7, delay: 200, useNativeDriver: true }),
      ]),
      Animated.spring(ballY, { toValue: -40, tension: 100, friction: 8, useNativeDriver: true }),
      Animated.spring(ballScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      Animated.spring(ballY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
    ]).start();

    // Ball continuous rotation
    Animated.loop(
      Animated.timing(ballRotate, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // Lightning bolt entrance
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.spring(lightningScale, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
        Animated.spring(lightningRotate, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();

    // Logo entrance
    Animated.parallel([
      Animated.spring(logoY, { toValue: 0, tension: 40, friction: 10, delay: 600, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 600, delay: 600, useNativeDriver: true }),
      Animated.spring(taglineY, { toValue: 0, tension: 50, friction: 10, delay: 800, useNativeDriver: true }),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 600, delay: 800, useNativeDriver: true }),
    ]).start();

    // Particle explosion
    particles.forEach((particle, i) => {
      const angle = (i / particles.length) * Math.PI * 2;
      const distance = 100;
      Animated.sequence([
        Animated.delay(500 + i * 50),
        Animated.parallel([
          Animated.spring(particle.x, { toValue: Math.cos(angle) * distance, tension: 40, friction: 8, useNativeDriver: true }),
          Animated.spring(particle.y, { toValue: Math.sin(angle) * distance, tension: 40, friction: 8, useNativeDriver: true }),
          Animated.timing(particle.opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
        Animated.timing(particle.opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    });

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 0.8, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.3, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Ring pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringScale, { toValue: 1.2, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(ringScale, { toValue: 0.8, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    const timer = setTimeout(() => router.replace('/auth/login'), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0033A0', '#001F5C', '#000A1F']} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        
        {/* Animated rings in background */}
        <Animated.View style={[styles.ring, styles.ring1, { transform: [{ scale: ringScale }] }]} />
        <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: ringScale }] }]} />
        <Animated.View style={[styles.ring, styles.ring3, { transform: [{ scale: ringScale }] }]} />

        {/* Particles */}
        {particles.map((particle, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                transform: [{ translateX: particle.x }, { translateY: particle.y }],
                opacity: particle.opacity,
              },
            ]}
          />
        ))}

        <Animated.View style={[styles.mainContainer, { transform: [{ scale: mainScale }] }]}>
          {/* Glowing orb */}
          <Animated.View style={[styles.glow, { opacity: glowPulse }]} />

          {/* Cricket ball with dramatic entrance */}
          <Animated.View
            style={[
              styles.ballContainer,
              {
                transform: [
                  { scale: ballScale },
                  { translateY: ballY },
                  { rotate: ballRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
                ],
              },
            ]}
          >
            <View style={styles.ball}>
              <View style={styles.seam} />
              <View style={[styles.seam, { transform: [{ rotate: '-50deg' }] }]} />
              <View style={styles.ballShine1} />
              <View style={styles.ballShine2} />
            </View>
          </Animated.View>

          {/* Lightning bolt with spin entrance */}
          <Animated.View
            style={[
              styles.lightningContainer,
              {
                transform: [
                  { scale: lightningScale },
                  { rotate: lightningRotate.interpolate({ inputRange: [0, 1], outputRange: ['-45deg', '0deg'] }) },
                ],
              },
            ]}
          >
            <LinearGradient colors={['#FF9933', '#FFB366']} style={styles.lightningGradient}>
              <Ionicons name="flash" size={60} color="#fff" />
            </LinearGradient>
          </Animated.View>

          {/* Logo with smooth entrance */}
          <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ translateY: logoY }] }]}>
            <Text style={styles.logoText}>BATLABZ</Text>
            <Animated.View style={[styles.taglineContainer, { opacity: taglineOpacity, transform: [{ translateY: taglineY }] }]}>
              <LinearGradient colors={['#FF9933', '#FFB366']} style={styles.taglineBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.tagline}>PAY & PLAY CRICKET</Text>
              </LinearGradient>
              <Text style={styles.subtitle}>🏏 India's Most Modern Cricket Platform</Text>
            </Animated.View>
          </Animated.View>

          {/* Animated loading bar */}
          <Animated.View style={[styles.loadingContainer, { opacity: logoOpacity }]}>
            <View style={styles.loadingBarContainer}>
              <Animated.View style={[styles.loadingBar, { opacity: glowPulse }]} />
            </View>
            <View style={styles.loadingDots}>
              <Animated.View style={[styles.dot, { opacity: glowPulse }]} />
              <Animated.View style={[styles.dot, { opacity: glowPulse }]} />
              <Animated.View style={[styles.dot, { opacity: glowPulse }]} />
            </View>
          </Animated.View>
        </Animated.View>

        {/* Bottom branding */}
        <Animated.View style={[styles.bottomContainer, { opacity: logoOpacity }]}>
          <View style={styles.brandBadge}>
            <View style={styles.brandDot} />
            <Text style={styles.brandText}>Powered by Innovation</Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  ring: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: 'rgba(66, 192, 229, 0.1)',
  },
  ring1: { width: 300, height: 300, top: height / 2 - 150, left: width / 2 - 150 },
  ring2: { width: 450, height: 450, top: height / 2 - 225, left: width / 2 - 225 },
  ring3: { width: 600, height: 600, top: height / 2 - 300, left: width / 2 - 300 },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#42C0E5',
    top: height / 2,
    left: width / 2,
  },
  mainContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#0033A0',
    shadowColor: '#42C0E5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 80,
  },
  ballContainer: { marginBottom: 40 },
  ball: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
  },
  seam: {
    position: 'absolute',
    width: 80,
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
    shadowColor: '#fff',
    shadowOpacity: 0.8,
    shadowRadius: 4,
    transform: [{ rotate: '25deg' }],
  },
  ballShine1: {
    position: 'absolute',
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    top: 20,
    left: 25,
  },
  ballShine2: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    top: 35,
    left: 45,
  },
  lightningContainer: {
    marginBottom: 30,
  },
  lightningGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  logoContainer: { alignItems: 'center' },
  logoText: {
    fontSize: 64,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
    textShadowColor: 'rgba(66, 192, 229, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
    marginBottom: 20,
  },
  taglineContainer: { alignItems: 'center' },
  taglineBadge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 16,
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  tagline: { fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 3 },
  subtitle: { fontSize: 17, color: '#A9E1F5', textAlign: 'center', fontWeight: '500' },
  loadingContainer: { marginTop: 60, alignItems: 'center' },
  loadingBarContainer: {
    width: 240,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  loadingBar: {
    width: '80%',
    height: '100%',
    backgroundColor: '#42C0E5',
    borderRadius: 3,
    shadowColor: '#42C0E5',
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  loadingDots: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#42C0E5',
  },
  bottomContainer: { position: 'absolute', bottom: 50, alignSelf: 'center' },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  brandDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#42C0E5', marginRight: 8 },
  brandText: { fontSize: 12, color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600', letterSpacing: 0.5 },
});