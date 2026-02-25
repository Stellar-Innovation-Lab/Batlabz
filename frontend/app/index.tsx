import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(40)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.3)).current;
  const circle1 = useRef(new Animated.Value(0.8)).current;
  const circle2 = useRef(new Animated.Value(0.9)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 45, friction: 10, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
      Animated.spring(logoY, { toValue: 0, tension: 50, friction: 12, useNativeDriver: true }),
    ]).start();

    Animated.loop(Animated.timing(iconRotate, { toValue: 1, duration: 20000, easing: Easing.linear, useNativeDriver: true })).start();
    Animated.loop(Animated.timing(shimmer, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })).start();
    Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(glowPulse, { toValue: 0.7, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(circle1, { toValue: 1.1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(glowPulse, { toValue: 0.3, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(circle1, { toValue: 0.8, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ])).start();

    const timer = setTimeout(() => router.replace('/auth/login'), 3500);
    return () => clearTimeout(timer);
  }, []);

  const shimmerX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-width, width] });
  const rotateValue = iconRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0B1F5E', '#1E3A8A', '#1E40AF']} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        
        {/* Animated circles */}
        <Animated.View style={[styles.circle1, { transform: [{ scale: circle1 }, { rotate: rotateValue }] }]} />
        <Animated.View style={[styles.circle2, { transform: [{ scale: circle2 }] }]} />
        <Animated.View style={[styles.circle3, { opacity: glowPulse }]} />
        
        {/* Shimmer effect */}
        <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]} />
        
        {/* Ambient glow */}
        <Animated.View style={[styles.ambientGlow, { opacity: glowPulse }]} />

        <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
          <View style={styles.iconWrapper}>
            <View style={styles.iconGlow} />
            <LinearGradient colors={['#F59E0B', '#FDBA74']} style={styles.iconBg}>
              <Ionicons name="flash" size={56} color="#fff" />
            </LinearGradient>
          </View>
          
          <Animated.View style={{ transform: [{ translateY: logoY }] }}>
            <Text style={styles.logo}>BATLABZ</Text>
            <View style={styles.taglineContainer}>
              <LinearGradient colors={['#F59E0B', '#FDBA74']} style={styles.tagline} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.taglineText}>PAY & PLAY CRICKET</Text>
              </LinearGradient>
            </View>
            <Text style={styles.subtitle}>👑 Royal Cricket Platform</Text>
          </Animated.View>

          <View style={styles.loadingContainer}>
            <View style={styles.loadingBarBg}>
              <Animated.View style={[styles.loadingBar, { opacity: glowPulse }]} />
            </View>
            <View style={styles.loadingDots}>
              {[0, 1, 2].map(i => (
                <Animated.View key={i} style={[styles.dot, { opacity: glowPulse }]} />
              ))}
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  circle1: { position: 'absolute', width: 500, height: 500, borderRadius: 250, borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.15)', top: -200, right: -150 },
  circle2: { position: 'absolute', width: 400, height: 400, borderRadius: 200, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)', bottom: -150, left: -100 },
  circle3: { position: 'absolute', width: 600, height: 600, borderRadius: 300, backgroundColor: 'rgba(59,130,246,0.05)', top: height/2 - 300, left: width/2 - 300 },
  shimmer: { position: 'absolute', width: 120, height: '100%', backgroundColor: 'rgba(255,255,255,0.06)', transform: [{ skewX: '-20deg' }] },
  ambientGlow: { position: 'absolute', width: 350, height: 350, borderRadius: 175, backgroundColor: '#F59E0B', top: height/3, left: width/2 - 175, shadowColor: '#F59E0B', shadowOpacity: 0.4, shadowRadius: 80 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, zIndex: 1 },
  iconWrapper: { marginBottom: 48, position: 'relative' },
  iconGlow: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: '#F59E0B', opacity: 0.2, top: -10, left: -10, shadowColor: '#F59E0B', shadowOpacity: 0.6, shadowRadius: 30 },
  iconBg: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.4, shadowRadius: 24, borderWidth: 4, borderColor: 'rgba(255,255,255,0.15)' },
  logo: { fontSize: 64, fontWeight: '900', color: '#fff', textAlign: 'center', letterSpacing: -2.5, marginBottom: 24, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 10 },
  taglineContainer: { alignItems: 'center', marginBottom: 20 },
  tagline: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 28, shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.2)' },
  taglineText: { fontSize: 14, fontWeight: '900', color: '#fff', letterSpacing: 3.5 },
  subtitle: { fontSize: 18, color: 'rgba(255,255,255,0.95)', fontWeight: '700', textAlign: 'center', letterSpacing: 0.5 },
  loadingContainer: { marginTop: 80, alignItems: 'center' },
  loadingBarBg: { width: 260, height: 7, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  loadingBar: { width: '80%', height: '100%', backgroundColor: '#F59E0B', borderRadius: 4, shadowColor: '#F59E0B', shadowOpacity: 0.7, shadowRadius: 12 },
  loadingDots: { flexDirection: 'row', gap: 12 },
  dot: { width: 11, height: 11, borderRadius: 6, backgroundColor: '#F59E0B', shadowColor: '#F59E0B', shadowOpacity: 0.6, shadowRadius: 8 },
});