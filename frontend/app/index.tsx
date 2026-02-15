import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const ballScale = useRef(new Animated.Value(0)).current;
  const ballY = useRef(new Animated.Value(-100)).current;
  const ballRotate = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const taglineY = useRef(new Animated.Value(20)).current;
  const glowPulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(ballScale, { toValue: 1, tension: 40, friction: 8, useNativeDriver: true }),
        Animated.spring(ballY, { toValue: 0, tension: 40, friction: 8, delay: 200, useNativeDriver: true }),
      ]),
      Animated.spring(ballY, { toValue: -30, tension: 100, friction: 10, useNativeDriver: true }),
      Animated.spring(ballY, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
    ]).start();

    Animated.loop(Animated.timing(ballRotate, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })).start();

    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 800, delay: 600, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 10, delay: 600, useNativeDriver: true }),
      Animated.spring(taglineY, { toValue: 0, tension: 50, friction: 10, delay: 800, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.3, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    const timer = setTimeout(() => router.replace('/auth/login'), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#2A79A6', '#42C0E5', '#A9E1F5']} style={styles.gradient}>
        <View style={styles.circlesContainer}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
        </View>

        <View style={styles.content}>
          <Animated.View style={[styles.glow, { opacity: glowPulse }]} />

          <Animated.View style={[styles.ballContainer, { transform: [{ scale: ballScale }, { translateY: ballY }, { rotate: ballRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}>
            <View style={styles.ball}>
              <View style={styles.seam} />
              <View style={[styles.seam, styles.seam2]} />
              <View style={styles.ballShine} />
            </View>
          </Animated.View>

          <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
            <View style={styles.logoBox}>
              <View style={styles.logoIconContainer}>
                <Ionicons name="flash" size={28} color="#fff" style={styles.logoIcon} />
              </View>
              <Text style={styles.logoText}>BATLABZ</Text>
            </View>
            
            <Animated.View style={[styles.taglineContainer, { transform: [{ translateY: taglineY }] }]}>
              <View style={styles.taglineBadge}>
                <Text style={styles.tagline}>PAY & PLAY CRICKET</Text>
              </View>
              <Text style={styles.subtitle}>🏏 UAE's Premier Cricket Community</Text>
            </Animated.View>
          </Animated.View>

          <Animated.View style={[styles.loadingContainer, { opacity: logoOpacity }]}>
            <View style={styles.loadingBar}>
              <Animated.View style={[styles.loadingProgress, { opacity: glowPulse }]} />
            </View>
            <Text style={styles.loadingText}>Preparing your cricket experience...</Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.bottomBadge, { opacity: logoOpacity }]}>
          <Text style={styles.bottomText}>Powered by Innovation • Built for Cricket</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  circlesContainer: { ...StyleSheet.absoluteFillObject },
  circle: { position: 'absolute', borderRadius: 1000, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  circle1: { width: 400, height: 400, top: -200, left: -150 },
  circle2: { width: 350, height: 350, bottom: -100, right: -100 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  glow: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#42C0E5', shadowColor: '#42C0E5', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 60 },
  ballContainer: { marginBottom: 50 },
  ball: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#dc2626', justifyContent: 'center', alignItems: 'center', shadowColor: '#dc2626', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.6, shadowRadius: 25, elevation: 15 },
  seam: { position: 'absolute', width: 65, height: 3, backgroundColor: '#fff', borderRadius: 2, shadowColor: '#fff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 3, transform: [{ rotate: '25deg' }] },
  seam2: { transform: [{ rotate: '-25deg' }] },
  ballShine: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255, 255, 255, 0.2)', top: 15, left: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 60 },
  logoBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logoIconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginRight: 12, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12 },
  logoIcon: { transform: [{ rotate: '-15deg' }] },
  logoText: { fontSize: 52, fontWeight: '900', color: '#fff', letterSpacing: -1, textShadowColor: 'rgba(66, 192, 229, 0.3)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  taglineContainer: { alignItems: 'center' },
  taglineBadge: { backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 16, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  tagline: { fontSize: 12, fontWeight: '800', color: '#fff', letterSpacing: 2 },
  subtitle: { fontSize: 16, color: '#E7F3FB', textAlign: 'center' },
  loadingContainer: { alignItems: 'center' },
  loadingBar: { width: 200, height: 4, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 2, overflow: 'hidden', marginBottom: 12 },
  loadingProgress: { height: '100%', width: '75%', backgroundColor: '#42C0E5', borderRadius: 2, shadowColor: '#42C0E5', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8 },
  loadingText: { fontSize: 13, color: '#E7F3FB', fontStyle: 'italic' },
  bottomBadge: { position: 'absolute', bottom: 40, alignSelf: 'center' },
  bottomText: { fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', letterSpacing: 0.5 },
});